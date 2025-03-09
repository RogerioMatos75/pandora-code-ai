import * as vscode from 'vscode';
import { SecurityVulnerability, CodeGeneration } from '../types/AITypes';

export class ResultPanel {
    private static readonly viewType = 'pandoraAI.results';
    private readonly panel: vscode.WebviewPanel;

    constructor(context: vscode.ExtensionContext) {
        this.panel = vscode.window.createWebviewPanel(
            ResultPanel.viewType,
            'Pandora AI - Resultados',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );
    }

    private getWebviewContent(content: string): string {
        const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorTheme.Dark;
        
        return `
            <html>
                <head>
                    <style>
                        body {
                            background-color: ${isDarkTheme ? '#1e1e1e' : '#ffffff'};
                            color: ${isDarkTheme ? '#ffffff' : '#000000'};
                            padding: 20px;
                            font-family: system-ui;
                        }
                        .vulnerability {
                            margin: 10px 0;
                            padding: 15px;
                            border-radius: 5px;
                            border-left: 4px solid;
                        }
                        .critical { border-color: #ff0000; background: ${isDarkTheme ? '#3c1414' : '#ffe6e6'}; }
                        .high { border-color: #ff8c00; background: ${isDarkTheme ? '#3c2814' : '#fff3e6'}; }
                        .medium { border-color: #ffd700; background: ${isDarkTheme ? '#3c3814' : '#fffbe6'}; }
                        .low { border-color: #90ee90; background: ${isDarkTheme ? '#143c14' : '#e6ffe6'}; }
                        pre {
                            background: ${isDarkTheme ? '#2d2d2d' : '#f0f0f0'};
                            padding: 10px;
                            border-radius: 5px;
                            overflow-x: auto;
                        }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
            </html>
        `;
    }

    showSecurityResults(vulnerabilities: SecurityVulnerability[]) {
        const content = `
            <h2>🔒 Análise de Segurança</h2>
            ${this.renderVulnerabilities(vulnerabilities)}
        `;
        this.panel.webview.html = this.getWebviewContent(content);
    }

    showCodeGeneration(result: CodeGeneration) {
        const content = `
            <h2>💻 Código Gerado</h2>
            <pre>${result.code}</pre>
            <h3>Explicação</h3>
            <p>${result.explanation}</p>
            <h3>Exemplos</h3>
            ${result.examples.map(ex => `<pre>${ex}</pre>`).join('')}
        `;
        this.panel.webview.html = this.getWebviewContent(content);
    }

    showCodeAnalysis(analysis: CodeAnalysisResult) {
        const content = `
            <h2>📊 Análise de Código</h2>
            
            <div class="section">
                <h3>Complexidade (${analysis.complexity.score})</h3>
                <ul>
                    ${analysis.complexity.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>Manutenibilidade (${analysis.maintainability.score})</h3>
                <ul>
                    ${analysis.maintainability.issues.map(i => `<li>${i}</li>`).join('')}
                </ul>
            </div>
        `;
        this.panel.webview.html = this.getWebviewContent(content);
    }

    private renderVulnerabilities(vulnerabilities: SecurityVulnerability[]): string {
        return vulnerabilities.map(v => `
            <div class="vulnerability ${v.severity}">
                <h3>${v.type}</h3>
                <p>${v.description}</p>
                <h4>Solução:</h4>
                <pre>${v.solution}</pre>
                <h4>Exemplo Seguro:</h4>
                <pre>${v.secureExample}</pre>
            </div>
        `).join('');
    }
}
