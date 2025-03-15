import * as vscode from "vscode";
import fetch from "node-fetch";
import {
  CodeSuggestion,
  SecurityIssue,
  CodeExplanation,
  SecurityVulnerability,
  CodeGeneration,
} from "../types/AITypes";
import { ResponseParser } from "../utils/responseParser";
import {
  AnalyzeResponse,
  ExplainResponse,
  SecurityResponse,
  GenerateResponse,
} from "../types/APITypes";

export class AIService {
  private maxRetries = 3;
  private serverUrl = "http://localhost:5000";
  private isServerAvailable = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await fetch(`${this.serverUrl}/status`);
        if (response.ok) {
          this.isServerAvailable = true;
          return;
        }
        throw new Error(`Servidor indisponível: ${response.status}`);
      } catch (error) {
        if (i === this.maxRetries - 1) {
          // Usar vscode.window em vez de window
          vscode.window.showErrorMessage(
            `Falha ao conectar ao servidor após ${this.maxRetries} tentativas. Verifique se o servidor está rodando.`
          );
          throw new Error(`Falha na inicialização: ${error}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1))); // Backoff exponencial
      }
    }
  }

  private async ensureServerAvailable(): Promise<boolean> {
    if (!this.isServerAvailable) {
      try {
        await this.initialize();
      } catch {
        return false;
      }
    }
    return true;
  }

  async checkServerConnection(): Promise<boolean> {
    try {
      console.log("Tentando conectar ao servidor:", this.serverUrl);
      const response = await fetch(`${this.serverUrl}/status`);
      const ok = response.ok;
      console.log("Status do servidor:", ok ? "Conectado" : "Erro");
      return ok;
    } catch (error) {
      console.error("Erro ao conectar ao servidor:", error);
      return false;
    }
  }

  async getSuggestions(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<CodeSuggestion[]> {
    if (!(await this.ensureServerAvailable())) {
      vscode.window.showErrorMessage("Servidor indisponível.");
      return [];
    }
    try {
      const prompt = `
                Analise este código e sugira melhorias:
                ${document.getText()}
                
                Foque na linha ${position.line + 1}.
                Formato da resposta:
                - Sugestão: (sua sugestão aqui)
                - Explicação: (explicação simples aqui)
            `;
      const response = await fetch(`${this.serverUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: document.getText() }),
      });
      if (!response.ok) {
        vscode.window.showErrorMessage("Erro ao comunicar com o servidor.");
        return [];
      }
      const data = (await response.json()) as AnalyzeResponse;
      return this.parseResponse(data.analysis);
    } catch (error) {
      vscode.window.showErrorMessage(
        "Não consegui gerar sugestões. Tente novamente."
      );
      return [];
    }
  }

  async explainCode(code: string): Promise<CodeExplanation> {
    if (!(await this.ensureServerAvailable())) {
      vscode.window.showErrorMessage("Servidor indisponível.");
      return { simpleExplanation: "" };
    }
    try {
      const prompt = `
                Explique este código de forma simples, como se estivesse explicando para alguém
                que está começando a programar:
                ${code}
            `;
      const response = await fetch(`${this.serverUrl}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        vscode.window.showErrorMessage("Erro ao comunicar com o servidor.");
        return { simpleExplanation: "" };
      }
      const data = (await response.json()) as ExplainResponse;
      return { simpleExplanation: data.explanation, examples: [] };
    } catch (error) {
      vscode.window.showErrorMessage(
        "Não consegui explicar o código. Tente novamente."
      );
      return { simpleExplanation: "" };
    }
  }

  async checkSecurity(code: string): Promise<SecurityIssue[]> {
    if (!(await this.ensureServerAvailable())) {
      vscode.window.showErrorMessage("Servidor indisponível.");
      return [];
    }
    try {
      const response = await fetch(`${this.serverUrl}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        vscode.window.showErrorMessage("Erro ao comunicar com o servidor.");
        return [];
      }
      const data = (await response.json()) as SecurityResponse;
      // Mapear as vulnerabilidades para o tipo SecurityIssue
      return data.vulnerabilities.map((vuln) => ({
        type: vuln.type,
        description: vuln.description,
        severity: ResponseParser.assessSeverity(vuln.severity),
        solution: vuln.solution,
      }));
    } catch (error) {
      vscode.window.showErrorMessage(
        "Não consegui verificar a segurança. Tente novamente."
      );
      return [];
    }
  }

  async analyzeCodeSecurity(
    document: vscode.TextDocument
  ): Promise<SecurityVulnerability[]> {
    if (!(await this.ensureServerAvailable())) {
      vscode.window.showErrorMessage("Servidor indisponível.");
      return [];
    }
    try {
      const code = document.getText();
      const prompt = `
                Analise este código e identifique vulnerabilidades de segurança comuns como SQL Injection, XSS, etc.
                Para cada vulnerabilidade encontrada, forneça:
                1. Tipo da vulnerabilidade
                2. Descrição do problema
                3. Como corrigir
                4. Exemplo de código seguro

                Código para análise:
                ${code}
            `;
      const response = await fetch(`${this.serverUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        vscode.window.showErrorMessage("Erro ao comunicar com o servidor.");
        return [];
      }
      const data = (await response.json()) as AnalyzeResponse;
      return this.parseSecurityAnalysis(data.analysis);
    } catch (error) {
      vscode.window.showErrorMessage("Falha na análise de segurança");
      return [];
    }
  }

  async generateCode(
    description: string,
    language: string
  ): Promise<CodeGeneration> {
    if (!(await this.ensureServerAvailable())) {
      vscode.window.showErrorMessage("Servidor indisponível.");
      return { code: "", explanation: "", examples: [] };
    }
    try {
      const prompt = `
                Gere um código em ${language} que atenda a seguinte descrição:
                ${description}

                Forneça:
                1. Código completo
                2. Explicação do código
                3. Exemplos de uso
            `;
      const response = await fetch(`${this.serverUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, language }),
      });
      if (!response.ok) {
        vscode.window.showErrorMessage("Erro ao comunicar com o servidor.");
        return { code: "", explanation: "", examples: [] };
      }
      const data = (await response.json()) as GenerateResponse;
      return this.parseCodeGeneration(data); // Agora passa o objeto GenerateResponse diretamente
    } catch (error) {
      vscode.window.showErrorMessage("Falha na geração de código");
      return { code: "", explanation: "", examples: [] };
    }
  }

  private parseSecurityAnalysis(response: string): SecurityVulnerability[] {
    return ResponseParser.parseSecurityAnalysis(response);
  }

  private parseCodeGeneration(
    response: string | GenerateResponse
  ): CodeGeneration {
    return ResponseParser.parseCodeGeneration(response);
  }

  private parseResponse(response: string): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];
    const lines = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    let currentSuggestion = "";
    let currentExplanation = "";
    for (const line of lines) {
      if (line.startsWith("- Sugestão:")) {
        currentSuggestion = line.replace("- Sugestão:", "").trim();
      } else if (line.startsWith("- Explicação:")) {
        currentExplanation = line.replace("- Explicação:", "").trim();
        if (currentSuggestion) {
          suggestions.push({
            suggestion: currentSuggestion,
            explanation: currentExplanation,
          });
          currentSuggestion = "";
          currentExplanation = "";
        }
      }
    }
    return suggestions;
  }
}
