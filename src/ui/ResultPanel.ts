import * as vscode from "vscode";
import {
  SecurityVulnerability,
  CodeGeneration,
  CodeAnalysisResult,
} from "../types/AITypes";

export class ResultPanel {
  private panel: vscode.WebviewPanel;

  constructor(private context: vscode.ExtensionContext) {
    this.panel = vscode.window.createWebviewPanel(
      "pandoraResults",
      "Pandora AI - Resultados",
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );
  }

  public showSecurityResults(vulnerabilities: SecurityVulnerability[]): void {
    const content = this.createSecurityResultsHtml(vulnerabilities);
    this.panel.webview.html = content;
    this.panel.reveal();
  }

  public showCodeGeneration(result: CodeGeneration): void {
    const content = this.createCodeGenerationHtml(result);
    this.panel.webview.html = content;
    this.panel.reveal();
  }

  public showCodeAnalysis(analysis: CodeAnalysisResult): void {
    const content = this.createAnalysisResultsHtml(analysis);
    this.panel.webview.html = content;
    this.panel.reveal();
  }

  private createSecurityResultsHtml(
    vulnerabilities: SecurityVulnerability[]
  ): string {
    return `
            <!DOCTYPE html>
            <html>
                <head>
                    ${this.getStyles()}
                </head>
                <body>
                    <h1>Análise de Segurança</h1>
                    ${vulnerabilities
                      .map(
                        (v) => `
                        <div class="vulnerability-card ${v.severity}">
                            <h3>${v.type}</h3>
                            <p>${v.description}</p>
                            <div class="solution">
                                <h4>Solução:</h4>
                                <p>${v.solution}</p>
                            </div>
                            <div class="example">
                                <h4>Exemplo Seguro:</h4>
                                <pre><code>${v.secureExample}</code></pre>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </body>
            </html>
        `;
  }

  private createCodeGenerationHtml(result: CodeGeneration): string {
    return `
            <!DOCTYPE html>
            <html>
                <head>
                    ${this.getStyles()}
                </head>
                <body>
                    <h1>Código Gerado</h1>
                    <div class="code-section">
                        <pre><code>${result.code}</code></pre>
                    </div>
                    <div class="explanation">
                        <h3>Explicação</h3>
                        <p>${result.explanation}</p>
                    </div>
                    <div class="examples">
                        <h3>Exemplos</h3>
                        ${result.examples
                          .map(
                            (example: string) => `
                            <pre><code>${example}</code></pre>
                        `
                          )
                          .join("")}
                    </div>
                </body>
            </html>
        `;
  }

  private createAnalysisResultsHtml(analysis: CodeAnalysisResult): string {
    return `
            <!DOCTYPE html>
            <html>
                <head>
                    ${this.getStyles()}
                </head>
                <body>
                    <h1>Análise de Código</h1>
                    
                    <div class="section">
                        <h2>Complexidade (${analysis.complexity.score}/10)</h2>
                        <ul>
                            ${analysis.complexity.suggestions
                              .map(
                                (suggestion: string) => `
                                <li>${suggestion}</li>
                            `
                              )
                              .join("")}
                        </ul>
                    </div>

                    <div class="section">
                        <h2>Manutenibilidade (${
                          analysis.maintainability.score
                        }/10)</h2>
                        <ul>
                            ${analysis.maintainability.issues
                              .map(
                                (issue: string) => `
                                <li>${issue}</li>
                            `
                              )
                              .join("")}
                        </ul>
                    </div>
                </body>
            </html>
        `;
  }

  private getStyles(): string {
    return `
            <style>
                body {
                    padding: 20px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                }
                .vulnerability-card {
                    margin: 10px 0;
                    padding: 15px;
                    border-radius: 5px;
                    border-left: 4px solid;
                }
                .critical { border-color: #ff0000; }
                .high { border-color: #ff8c00; }
                .medium { border-color: #ffd700; }
                .low { border-color: #90ee90; }
                pre {
                    background: var(--vscode-editor-background);
                    padding: 10px;
                    border-radius: 5px;
                }
                code {
                    font-family: var(--vscode-editor-font-family);
                }
                .section {
                    margin: 20px 0;
                    padding: 15px;
                    background: var(--vscode-editor-background);
                    border-radius: 5px;
                }
            </style>
        `;
  }
}
