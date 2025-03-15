import * as vscode from "vscode";

export class PandoraPanelProvider implements vscode.WebviewViewProvider {
  public static current?: PandoraPanelProvider;
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {
    PandoraPanelProvider.current = this;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "applyFix":
          const document = await vscode.workspace.openTextDocument(
            vscode.Uri.file(data.file)
          );
          const editor = await vscode.window.showTextDocument(document);
          const range = new vscode.Range(
            data.range.start.line,
            data.range.start.character,
            data.range.end.line,
            data.range.end.character
          );

          await editor.edit((editBuilder) => {
            editBuilder.replace(range, data.code);
          });
          break;
        case "analyzeError":
          vscode.commands.executeCommand("pandora-code-ai.analyzeError");
          break;
        case "analyzeCode":
          vscode.commands.executeCommand("pandora-code-ai.analyzeCode");
          break;
      }
    });
  }

  public async updateFixSuggestion(fix: {
    originalError: string;
    fixedCode: string;
    explanation: string;
    file: string;
    line: number;
    diagnostic: vscode.Diagnostic;
  }) {
    try {
      if (this._view) {
        await this._view.webview.postMessage({
          type: "fixSuggestion",
          fix: {
            ...fix,
            location: {
              file: fix.file,
              line: fix.line,
              column: fix.diagnostic.range.start.character,
            },
            severity: "error",
            source: fix.diagnostic.source || "unknown",
            timestamp: new Date().toISOString(),
          },
          status: "ready",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar sugestão para webview:", error);
      if (this._view) {
        await this._view.webview.postMessage({
          type: "error",
          message: "Falha ao processar sugestão",
        });
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "src", "ui", "pandoraView.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "src", "ui", "pandoraView.js")
    );

    return `<!DOCTYPE html>
            <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Caixa de Pandora</title>
                    <link rel="stylesheet" href="${styleUri}">
                </head>
                <body>
                    <h2>🔍 Caixa de Pandora</h2>
                    
                    <div id="loading" class="loading hidden">
                        <div class="spinner"></div>
                        <p>Analisando código...</p>
                    </div>

                    <div class="toolbar">
                        <button class="tool-button" onclick="fixProblems()" id="fixButton">
                            <i class="codicon codicon-tools"></i>
                            Corrigir Erros Automaticamente
                        </button>
                    </div>

                    <div class="filters">
                        <label>
                            <input type="checkbox" checked id="showErrors">
                            Mostrar Erros
                        </label>
                    </div>

                    <div class="info">
                        <p>Problemas detectados aparecerão aqui automaticamente</p>
                    </div>

                    <div id="fixes-container"></div>
                    <div id="error-container"></div>
                    
                    <script>
                        // Verificação de ambiente
                        if (typeof window !== 'undefined') {
                            try {
                                // ...existing script code...
                            } catch (e) {
                                console.error('Erro ao inicializar webview:', e);
                            }
                        }
                    </script>
                    <script src="${scriptUri}"></script>
                </body>
            </html>`;
  }
}
