import * as vscode from "vscode";
import { ResultPanel } from "./ResultPanel";
import fetch from "node-fetch";
import { isBrowserEnvironment } from "../utils/environmentUtils";

interface AnalysisResult {
  explanation: string;
  correctedCode: string;
  suggestion: string;
}

export class PandoraBox {
  private static _currentPanel: PandoraBox | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private static resultPanel: ResultPanel;
  private diagnosticCollection: vscode.DiagnosticCollection;

  // Método público para acessar o currentPanel
  public static getCurrentPanel(): PandoraBox | undefined {
    return PandoraBox._currentPanel;
  }

  private constructor(panel: vscode.WebviewPanel) {
    this._panel = panel;
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("pandora");
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = PandoraBox.getWebviewContent();
    this.setWebviewMessageListener(this._panel.webview);
    this.setupDiagnosticListener();
  }

  private setupDiagnosticListener() {
    this._disposables.push(
      vscode.languages.onDidChangeDiagnostics((e) => {
        this.handleDiagnosticsChange();
      })
    );
  }

  private handleDiagnosticsChange() {
    const diagnostics = this.getAllDiagnostics();
    if (diagnostics.length > 0) {
      this._panel.webview.postMessage({
        type: "diagnosticsUpdate",
        diagnostics: diagnostics.map((d) => ({
          message: d.diagnostic.message,
          severity: d.diagnostic.severity,
          file: d.uri.fsPath,
          line: d.diagnostic.range.start.line + 1,
          code: d.diagnostic.code,
          selection: true, // Adiciona propriedade para controle de seleção
        })),
      });
    }
  }

  private getAllDiagnostics(): Array<{
    uri: vscode.Uri;
    diagnostic: vscode.Diagnostic;
  }> {
    const allDiagnostics: Array<{
      uri: vscode.Uri;
      diagnostic: vscode.Diagnostic;
    }> = [];
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders) {
      for (const folder of workspaceFolders) {
        vscode.languages.getDiagnostics().forEach(([uri, diagnostics]) => {
          if (uri.fsPath.startsWith(folder.uri.fsPath)) {
            diagnostics.forEach((diagnostic) => {
              allDiagnostics.push({ uri, diagnostic });
            });
          }
        });
      }
    }
    return allDiagnostics;
  }

  static createOrShow() {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (PandoraBox._currentPanel) {
      PandoraBox._currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "pandoraBox",
      "Caixa de Pandora",
      {
        viewColumn: column || vscode.ViewColumn.Two,
        preserveFocus: true,
      },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [],
      }
    );

    PandoraBox._currentPanel = new PandoraBox(panel);
  }

  static async analyzeError(errorText: string, lineNumber?: number) {
    try {
      // Mostrar análise em andamento na Pandora Box
      PandoraBox._currentPanel?._panel.webview.postMessage({
        type: "analyzeError",
        code: errorText,
      });

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: errorText,
          line: lineNumber,
        }),
      });

      const analysis = (await response.json()) as AnalysisResult;

      // Atualizar Pandora Box com resumo
      PandoraBox._currentPanel?._panel.webview.postMessage({
        type: "analysisResult",
        result: {
          originalError: errorText,
          summary:
            analysis.explanation?.slice(0, 150) + "..." ||
            "Análise não disponível",
        },
      });

      // Abrir Resultado da Pandora em uma nova aba do editor
      const resultDocument = await vscode.workspace.openTextDocument({
        content: `// Análise da Pandora
${analysis.explanation || "Nenhuma explicação disponível"}

// Código Original:
${errorText}

// Código Corrigido:
${analysis.correctedCode || "Nenhuma correção disponível"}
`,
        language: "typescript",
      });

      await vscode.window.showTextDocument(resultDocument, {
        viewColumn: vscode.ViewColumn.One,
      });

      return analysis;
    } catch (error) {
      vscode.window.showErrorMessage(`Erro ao analisar: ${error}`);
      return null;
    }
  }

  // Método estático para acessar o conteúdo do webview
  public static getWebviewContent(): string {
    return `<!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
                <style>
                    body { padding: 20px; }
                    .error-container { margin-top: 20px; }
                    .error-card {
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        padding: 15px;
                        margin-bottom: 15px;
                        border-radius: 4px;
                    }
                    .error-header {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .error-selector { margin: 0; }
                    .error-message { margin-top: 8px; }
                    .actions-bar {
                        margin: 20px 0;
                        display: flex;
                        gap: 10px;
                    }
                    .empty-state {
                        color: var(--vscode-descriptionForeground);
                        text-align: center;
                        padding: 20px;
                    }
                    button {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 8px 12px;
                        cursor: pointer;
                        border-radius: 2px;
                    }
                    button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                </style>
            </head>
            <body>
                <h2>🔍 Caixa de Pandora</h2>
                <div class="actions-bar">
                    <button onclick="analyzeSelectedErrors()" id="analyze-button" disabled>
                        Analisar Erros Selecionados
                    </button>
                </div>
                <div id="error-container">
                    <div class="empty-state">
                        Nenhum erro encontrado. Os erros da aba "Problemas" aparecerão aqui.
                    </div>
                </div>
                <script>
                    (function() {
                        // Garantir que o VS Code API está disponível
                        const vscode = (() => {
                            if (typeof acquireVsCodeApi === 'function') {
                                return acquireVsCodeApi();
                            }
                            return {
                                postMessage: () => {},
                                setState: () => {},
                                getState: () => ({})
                            };
                        })();

                        // Setup dos event listeners de forma segura
                        document.addEventListener('DOMContentLoaded', () => {
                            window.addEventListener('message', event => {
                                const message = event.data;
                                if (message.type === 'diagnosticsUpdate') {
                                    updateDiagnostics(message.diagnostics);
                                }
                            });
                        });

                        function updateDiagnostics(diagnostics) {
                            const container = document.getElementById('error-container');
                            const analyzeButton = document.getElementById('analyze-button');
                            
                            if (!diagnostics || diagnostics.length === 0) {
                                container.innerHTML = '<div class="empty-state">Nenhum erro encontrado</div>';
                                analyzeButton.disabled = true;
                                return;
                            }

                            container.innerHTML = diagnostics.map((d, index) => 
                                \`<div class="error-card">
                                    <div class="error-header">
                                        <input type="checkbox" 
                                               class="error-selector" 
                                               id="error-\${index}"
                                               data-error="\${encodeURIComponent(JSON.stringify(d))}"
                                               checked>
                                        <label for="error-\${index}">
                                            <strong>\${d.file}</strong>:\${d.line}
                                        </label>
                                    </div>
                                    <div class="error-message">\${d.message}</div>
                                </div>\`
                            ).join('');
                            
                            analyzeButton.disabled = false;
                        }

                        function analyzeSelectedErrors() {
                            const selectedErrors = Array.from(document.querySelectorAll('.error-selector:checked'))
                                .map(checkbox => JSON.parse(decodeURIComponent(checkbox.dataset.error)));
                            
                            if (selectedErrors.length === 0) return;

                            vscode.postMessage({
                                type: 'analyzeSelectedErrors',
                                errors: selectedErrors
                            });
                        }

                        // Expor funções necessárias globalmente
                        window.analyzeSelectedErrors = analyzeSelectedErrors;
                    })();
                </script>
            </body>
            </html>`;
  }

  private setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case "analyzeSelectedErrors":
            await this.handleSelectedErrors(message.errors);
            return;
          case "applyFix":
            this.applyFixToEditor(message.code);
            return;
          case "copyFix":
            vscode.env.clipboard.writeText(message.code);
            return;
        }
      },
      undefined,
      this._disposables
    );
  }

  private async handleSelectedErrors(errors: any[]) {
    try {
      const analyses = [];
      for (const error of errors) {
        const analysis = await PandoraBox.analyzeError(
          error.message,
          error.line
        );
        if (analysis) {
          analyses.push({
            error,
            analysis,
          });
        }
      }

      // Criar documento de resultado consolidado
      const content = analyses
        .map(
          ({ error, analysis }) => `
// Erro em ${error.file}:${error.line}
// ${error.message}

${analysis.explanation || "Nenhuma explicação disponível"}

// Código Corrigido:
${analysis.correctedCode || "Nenhuma correção disponível"}

`
        )
        .join("\n---\n");

      const resultDocument = await vscode.workspace.openTextDocument({
        content,
        language: "typescript",
      });

      await vscode.window.showTextDocument(resultDocument, {
        viewColumn: vscode.ViewColumn.One,
        preview: false,
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Erro ao analisar erros selecionados: ${error}`
      );
    }
  }

  private applyFixToEditor(fixedCode: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((editBuilder) => {
        const selection = editor.selection;
        editBuilder.replace(selection, fixedCode);
      });
    }
  }

  private dispose() {
    PandoraBox._currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
