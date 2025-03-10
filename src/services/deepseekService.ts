import * as WebSocket from "ws";
import { workspace } from "vscode";
import { StatusManager } from "../utils/statusManager";

export class DeepSeekService {
  private ws: WebSocket | null = null;
  private isReady = false;
  private connectionTimeout: number;
  private baseUrl: string;

  private readonly modelConfig = {
    temperature: 0.7,
    max_length: 2048,
    top_p: 0.95,
  };

  private connectionMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    averageResponseTime: 0,
  };

  constructor() {
    const config = workspace.getConfiguration("pandoraAI");
    const host = config.get("host", "localhost");
    const port = config.get("port", 11434);
    this.connectionTimeout = config.get("timeout", 30000);
    this.baseUrl = `ws://${host}:${port}`;
  }

  async initialize() {
    try {
      await this.connect();
      await this.loadModel();
      this.setupHeartbeat();
      StatusManager.getInstance().updateModelStatus(true);
    } catch (error) {
      StatusManager.getInstance().updateModelStatus(false, error.message);
      console.error("Falha ao inicializar DeepSeek:", error);
      throw error;
    }
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.baseUrl);

      const timeout = setTimeout(() => {
        reject(new Error("Timeout ao conectar com DeepSeek"));
      }, this.connectionTimeout);

      this.ws.on("open", () => {
        clearTimeout(timeout);
        this.isReady = true;
        console.log("DeepSeek conectado com sucesso");
        resolve();
      });

      this.ws.on("error", (error) => {
        clearTimeout(timeout);
        this.isReady = false;
        reject(error);
      });

      this.ws.on("close", () => {
        this.isReady = false;
        this.reconnect();
      });
    });
  }

  private async reconnect() {
    console.log("Tentando reconectar ao DeepSeek...");
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error("Falha ao reconectar:", error);
      }
    }, 5000);
  }

  private setupHeartbeat() {
    setInterval(() => {
      if (this.isReady && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000);
  }

  private async loadModel() {
    if (!this.ws) return;

    const modelPath = workspace
      .getConfiguration()
      .get("pandoraAI.modelPath", "deepseek-coder-6.7b-instruct");
    await this.sendCommand("load_model", { path: modelPath });
  }

  async generate(prompt: string): Promise<string> {
    if (!this.ws) throw new Error("Modelo não inicializado");

    const response = await this.sendCommand("generate", {
      prompt,
      ...this.modelConfig,
    });

    return response.text;
  }

  async generateWithStream(
    prompt: string,
    callback: (text: string) => void
  ): Promise<void> {
    if (!this.ws) throw new Error("Modelo não inicializado");

    this.ws.send(
      JSON.stringify({
        command: "generate_stream",
        params: {
          prompt,
          ...this.modelConfig,
          stream: true,
        },
      })
    );

    this.ws.on("message", (data) => {
      const response = JSON.parse(data.toString());
      if (response.text) {
        callback(response.text);
      }
    });
  }

  async codeComplete(code: string, position: number): Promise<string[]> {
    return this.sendCommand("complete", {
      code,
      position,
      max_suggestions: 5,
    });
  }

  async getMetrics() {
    return {
      ...this.connectionMetrics,
      isReady: this.isReady,
      uptime: process.uptime(),
    };
  }

  private async sendCommand(command: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.isReady) {
        return reject(new Error("DeepSeek não está pronto"));
      }

      const timeout = setTimeout(() => {
        reject(new Error("Timeout na requisição ao DeepSeek"));
      }, this.connectionTimeout);

      this.ws.send(JSON.stringify({ command, params }));

      this.ws.once("message", (data) => {
        clearTimeout(timeout);
        try {
          resolve(JSON.parse(data.toString()));
        } catch (error) {
          reject(new Error("Erro ao parsear resposta do DeepSeek"));
        }
      });
    });
  }
}
