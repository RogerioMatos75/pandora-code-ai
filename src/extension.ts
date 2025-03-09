import * as vscode from 'vscode';
import { AIService } from './services/aiService';
import { ResultPanel } from './ui/ResultPanel';
import { MetricsService } from './services/metricsService';
import { CodeAnalysisService } from './services/codeAnalysisService';

export function activate(context: vscode.ExtensionContext) {
    const aiService = new AIService();
    const resultPanel = new ResultPanel(context);
    const metricsService = new MetricsService();
    const codeAnalysisService = new CodeAnalysisService(aiService.getDeepSeekService());

    let disposables = [
        vscode.commands.registerCommand('pandora-code-ai.analyzeSecurity', async () => {
            try {
                metricsService.trackCommand('analyzeSecurity');
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;

                const vulnerabilities = await aiService.analyzeCodeSecurity(editor.document);
                resultPanel.showSecurityResults(vulnerabilities);
            } catch (error) {
                metricsService.trackError(error as Error);
                vscode.window.showErrorMessage('Erro ao analisar segurança: ' + (error as Error).message);
            }
        }),

        vscode.commands.registerCommand('pandora-code-ai.generateCode', async () => {
            const description = await vscode.window.showInputBox({
                prompt: 'Descreva o código que você quer gerar'
            });
            if (!description) return;

            const language = await vscode.window.showQuickPick(['python', 'javascript', 'typescript'], {
                placeHolder: 'Escolha a linguagem'
            });
            if (!language) return;

            const result = await aiService.generateCode(description, language);
            resultPanel.showCodeGeneration(result);
        }),

        vscode.commands.registerCommand('pandora-code-ai.explainCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.selection;
            const code = editor.document.getText(selection);
            const explanation = await aiService.explainCode(code);
            // Mostrar resultados
        })
    ];

    // Adicionar comando para ver métricas
    disposables.push(
        vscode.commands.registerCommand('pandora-code-ai.showMetrics', () => {
            const report = metricsService.getUsageReport();
            vscode.window.showInformationMessage(report);
        })
    );

    disposables.push(
        vscode.commands.registerCommand('pandora-code-ai.analyzeCode', async () => {
            try {
                metricsService.trackCommand('analyzeCode');
                
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;

                const analysis = await codeAnalysisService.analyzeCode(editor.document);
                resultPanel.showCodeAnalysis(analysis);
                
            } catch (error) {
                metricsService.trackError(error as Error);
                vscode.window.showErrorMessage('Erro na análise de código: ' + (error as Error).message);
            }
        })
    );

    context.subscriptions.push(...disposables);
}

export function deactivate() {}
