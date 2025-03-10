import * as vscode from "vscode";
import {
  CodeSuggestion,
  SecurityIssue,
  CodeExplanation,
  SecurityVulnerability,
  CodeGeneration,
} from "../types/AITypes";
import { DeepSeekService } from "./deepseekService";
import { ResponseParser } from "../utils/responseParser";

export class AIService {
  private deepseek: DeepSeekService;
  private maxRetries = 3;

  constructor() {
    this.deepseek = new DeepSeekService();
    this.initialize();
  }

  private async initialize() {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        await this.deepseek.initialize();
        return;
      } catch (error) {
        if (i === this.maxRetries - 1) {
          throw new Error(
            `Falha ao inicializar após ${this.maxRetries} tentativas`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  // Adicionar método para expor o DeepSeekService
  getDeepSeekService(): DeepSeekService {
    return this.deepseek;
  }

  async getSuggestions(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<CodeSuggestion[]> {
    try {
      const response = await this.deepseek.generate(`
                Analise este código e sugira melhorias:
                ${document.getText()}
                
                Foque na linha ${position.line + 1}.
                Formato da resposta:
                - Sugestão: (sua sugestão aqui)
                - Explicação: (explicação simples aqui)
            `);

      return this.parseResponse(response);
    } catch (error) {
      vscode.window.showErrorMessage(
        "Não consegui gerar sugestões. Tente novamente."
      );
      return [];
    }
  }

  async explainCode(code: string): Promise<CodeExplanation> {
    try {
      const prompt = `
                Explique este código de forma simples, como se estivesse explicando para alguém
                que está começando a programar:
                ${code}
            `;

      // Implementar chamada local ao DeepSeek
      return {
        simpleExplanation: "",
        examples: [],
      };
    } catch (error) {
      vscode.window.showErrorMessage(
        "Não consegui explicar o código. Tente novamente."
      );
      return { simpleExplanation: "" };
    }
  }

  async checkSecurity(code: string): Promise<SecurityIssue[]> {
    try {
      const prompt = `
                Analise este código e identifique possíveis problemas de segurança.
                Explique os problemas de forma simples:
                ${code}
            `;

      // Implementar chamada local ao DeepSeek
      return [];
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

      const response = await this.deepseek.generate(prompt);
      return this.parseSecurityAnalysis(response);
    } catch (error) {
      vscode.window.showErrorMessage("Falha na análise de segurança");
      return [];
    }
  }

  async generateCode(
    description: string,
    language: string
  ): Promise<CodeGeneration> {
    try {
      const prompt = `
                Gere um código em ${language} que atenda a seguinte descrição:
                ${description}

                Forneça:
                1. Código completo
                2. Explicação do código
                3. Exemplos de uso
            `;

      const response = await this.deepseek.generate(prompt);
      return this.parseCodeGeneration(response);
    } catch (error) {
      vscode.window.showErrorMessage("Falha na geração de código");
      return { code: "", explanation: "", examples: [] };
    }
  }

  // Corrigir parsers não implementados
  private parseSecurityAnalysis(response: string): SecurityVulnerability[] {
    return ResponseParser.parseSecurityAnalysis(response);
  }

  private parseCodeGeneration(response: string): CodeGeneration {
    return ResponseParser.parseCodeGeneration(response);
  }
}
