import * as vscode from 'vscode';
import { DeepSeekService } from './deepseekService';
import { ResponseParser } from '../utils/responseParser';

export interface CodeAnalysisResult {
    complexity: {
        score: number;
        suggestions: string[];
    };
    maintainability: {
        score: number;
        issues: string[];
    };
    bestPractices: {
        violations: Array<{
            rule: string;
            suggestion: string;
            priority: 'high' | 'medium' | 'low';
        }>;
    };
    performance: {
        issues: Array<{
            description: string;
            impact: string;
            solution: string;
        }>;
    };
}

export class CodeAnalysisService {
    constructor(private deepseek: DeepSeekService) {}

    async analyzeCode(document: vscode.TextDocument): Promise<CodeAnalysisResult> {
        const code = document.getText();
        
        const prompt = `
            Analise este código e forneça:
            1. Complexidade ciclomática (score de 0-10)
            2. Manutenibilidade (score de 0-10)
            3. Boas práticas (liste violações)
            4. Problemas de performance (liste questões)

            Formate a resposta em seções com títulos.
            Código:
            ${code}
        `;

        try {
            const response = await this.deepseek.generate(prompt);
            return this.parseAnalysisResponse(response);
        } catch (error) {
            console.error('Erro na análise de código:', error);
            throw new Error('Falha ao analisar código');
        }
    }

    private parseAnalysisResponse(response: string): CodeAnalysisResult {
        return ResponseParser.parseCodeAnalysis(response);
    }
}
