import * as WebSocket from 'ws';
import { workspace } from 'vscode';

export class DeepSeekService {
    private ws: WebSocket | null = null;
    private readonly modelConfig = {
        temperature: 0.7,
        max_length: 2048,
        top_p: 0.95
    };

    async initialize() {
        try {
            this.ws = new WebSocket(`ws://localhost:${workspace.getConfiguration().get('pandoraAI.port', 8080)}`);
            await this.loadModel();
        } catch (error) {
            throw new Error('Falha ao inicializar o modelo DeepSeek');
        }
    }

    private async loadModel() {
        if (!this.ws) return;
        
        const modelPath = workspace.getConfiguration().get('pandoraAI.modelPath', 'deepseek-coder-6.7b-instruct');
        await this.sendCommand('load_model', { path: modelPath });
    }

    async generate(prompt: string): Promise<string> {
        if (!this.ws) throw new Error('Modelo não inicializado');
        
        const response = await this.sendCommand('generate', {
            prompt,
            ...this.modelConfig
        });

        return response.text;
    }

    async generateWithStream(prompt: string, callback: (text: string) => void): Promise<void> {
        if (!this.ws) throw new Error('Modelo não inicializado');
        
        this.ws.send(JSON.stringify({
            command: 'generate_stream',
            params: {
                prompt,
                ...this.modelConfig,
                stream: true
            }
        }));

        this.ws.on('message', (data) => {
            const response = JSON.parse(data.toString());
            if (response.text) {
                callback(response.text);
            }
        });
    }

    async codeComplete(code: string, position: number): Promise<string[]> {
        return this.sendCommand('complete', {
            code,
            position,
            max_suggestions: 5
        });
    }

    private async sendCommand(command: string, params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.ws) return reject('WebSocket não inicializado');
            
            this.ws.send(JSON.stringify({ command, params }));
            this.ws.once('message', (data) => resolve(JSON.parse(data.toString())));
        });
    }
}
