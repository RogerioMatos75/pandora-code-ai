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

  private async handleDiagnosticsChange() {
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
    vscode.languages.getDiagnostics().forEach(([uri, diagnostics]) => {
      diagnostics.forEach((diagnostic) => {
        allDiagnostics.push({ uri, diagnostic });
      });
    });
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
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
                <script>
                    (function() {
                        const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;
                        if (vscode) {
                            window.vscode = vscode;
                        }
                    })();
                </script>
                <style>
                    body { padding: 20px; }
                    .error-card {
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        padding: 15px;
                        margin-bottom: 15px;
                        border-radius: 4px;
                    }
                    .summary {
                        color: var(--vscode-foreground);
                        margin: 10px 0;
                    }
                    .actions {
                        margin-top: 10px;
                        display: flex;
                        gap: 10px;
                    }
                    button {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 8px 12px;
                        cursor: pointer;
                    }
                    .primary-button {
                        background: var(--vscode-button-prominentBackground);
                    }
                </style>
            </head>
            <body>
                <h2>🔍 Caixa de Pandora</h2>
                <div class="info">
                    <p>Selecione mensagens de erro no terminal e envie para análise.</p>
                </div>
                <div id="error-container"></div>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'analyzeError':
                                showAnalyzing(message.code);
                                break;
                            case 'analysisResult':
                                updateAnalysis(message.result);
                                break;
                        }
                    });

                    function showAnalyzing(code) {
                        const container = document.getElementById('error-container');
                        container.innerHTML = \`
                            <div class="error-card">
                                <h3>🔄 Analisando Erro</h3>
                                <pre class="error-code">\${code}</pre>
                                <p class="analyzing">Processando análise...</p>
                            </div>
                        \`;
                    }

                    function updateAnalysis(result) {
                        const container = document.getElementById('error-container');
                        container.innerHTML = \`
                            <div class="error-card">
                                <h3>📝 Análise Concluída</h3>
                                <pre class="error-code">\${result.originalError}</pre>
                                <div class="summary">\${result.summary}</div>
                                <div class="actions">
                                    <button class="primary-button" onclick="viewAnalysis()">
                                        Ver Análise Completa
                                    </button>
                                </div>
                            </div>
                        \`;
                    }

                    function viewAnalysis() {
                        vscode.postMessage({ type: 'viewAnalysis' });
                    }
                </script>
            </body>
            </html>
        `;
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
