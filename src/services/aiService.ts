import * as vscode from "vscode";
import axios from "axios";
import {
  CodeSuggestion,
  SecurityIssue,
  CodeExplanation,
  SecurityVulnerability,
  CodeGeneration,
} from "../types/AITypes";
import { ResponseParser } from "../utils/responseParser";

export class AIService {
  private maxRetries = 3;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        // Inicialização via servidor Flask; não usamos DeepSeekService
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

  async getSuggestions(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<CodeSuggestion[]> {
    try {
      const prompt = `
                Analise este código e sugira melhorias:
                ${document.getText()}
                
                Foque na linha ${position.line + 1}.
                Formato da resposta:
                - Sugestão: (sua sugestão aqui)
                - Explicação: (explicação simples aqui)
            `;
      const axiosResponse = await axios.post("http://localhost:5000/analyze", {
        code: document.getText(),
      });
      return this.parseResponse(axiosResponse.data.analysis);
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
      const axiosResponse = await axios.post("http://localhost:5000/explain", {
        code,
      });
      // Assume que o servidor retorna uma propriedade 'explanation'
      return {
        simpleExplanation: axiosResponse.data.explanation,
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
      const axiosResponse = await axios.post("http://localhost:5000/security", {
        code,
      });
      return axiosResponse.data.vulnerabilities;
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
      const axiosResponse = await axios.post("http://localhost:5000/analyze", {
        code,
      });
      return this.parseSecurityAnalysis(axiosResponse.data.analysis);
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
      const axiosResponse = await axios.post("http://localhost:5000/generate", {
        description,
        language,
      });
      return this.parseCodeGeneration(axiosResponse.data);
    } catch (error) {
      vscode.window.showErrorMessage("Falha na geração de código");
      return { code: "", explanation: "", examples: [] };
    }
  }

  private parseSecurityAnalysis(response: string): SecurityVulnerability[] {
    return ResponseParser.parseSecurityAnalysis(response);
  }

  private parseCodeGeneration(response: string): CodeGeneration {
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
