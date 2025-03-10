import * as vscode from "vscode";

export class PandoraPanel {
  public static currentPanel: PandoraPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent();

    // Adicionar handler para mensagens do webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "analyzeCode":
            await vscode.commands.executeCommand("pandora-code-ai.analyzeCode");
            this.addToHistory("Análise", "Código analisado com sucesso");
            break;
          case "explainCode":
            await vscode.commands.executeCommand("pandora-code-ai.explainCode");
            break;
          case "analyzeSecurity":
            await vscode.commands.executeCommand(
              "pandora-code-ai.analyzeSecurity"
            );
            break;
          case "generateCode":
            await vscode.commands.executeCommand(
              "pandora-code-ai.generateCode"
            );
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (PandoraPanel.currentPanel) {
      PandoraPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "pandoraAI",
      "Pandora Code AI",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    PandoraPanel.currentPanel = new PandoraPanel(panel, extensionUri);
  }

  private _getWebviewContent() {
    return `<!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pandora Code AI</title>
            <style>
                body {
                    padding: 20px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    font-family: var(--vscode-font-family);
                }
                .card {
                    background: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                .button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 2px;
                    cursor: pointer;
                }
                .button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                .status-card {
                    background: var(--vscode-editorWidget-background);
                }
                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #666;
                }
                .dot.connected { background: #3ea76a; }
                .dot.connecting { background: #f9a825; }
                .dot.error { background: #e51400; }
                
                .button-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 8px;
                }
                .button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                }
                .button.primary {
                    background: var(--vscode-button-prominentBackground);
                }
                .history-container {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .empty-state {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            <h1>🤖 Pandora Code AI</h1>
            
            <div class="card status-card">
                <h2>Status</h2>
                <div class="status-indicator">
                    <span id="statusDot" class="dot"></span>
                    <span id="modelStatus">Inicializando...</span>
                </div>
            </div>

            <div class="card">
                <h2>🚀 Ações Rápidas</h2>
                <div class="button-grid">
                    <button class="button primary" onclick="analyzeCurrent()">
                        <span class="icon">📊</span>
                        Analisar Código
                    </button>
                    <button class="button" onclick="explainSelected()">
                        <span class="icon">📝</span>
                        Explicar Seleção
                    </button>
                    <button class="button" onclick="checkSecurity()">
                        <span class="icon">🔒</span>
                        Verificar Segurança
                    </button>
                    <button class="button" onclick="generateCode()">
                        <span class="icon">✨</span>
                        Gerar Código
                    </button>
                </div>
            </div>

            <div class="card">
                <h2>📜 Histórico</h2>
                <div id="history" class="history-container">
                    <div class="empty-state">
                        Nenhuma ação realizada ainda.
                        Selecione uma ação acima para começar!
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let connected = false;

                function updateStatus(status, message) {
                    const dot = document.getElementById('statusDot');
                    const statusText = document.getElementById('modelStatus');
                    
                    dot.className = 'dot ' + status;
                    statusText.textContent = message;
                    connected = status === 'connected';
                }

                function addHistoryItem(type, content) {
                    const history = document.getElementById('history');
                    const item = document.createElement('div');
                    item.className = 'history-item';
                    item.innerHTML = \`
                        <div class="history-header">
                            <span class="history-type">\${type}</span>
                            <span class="history-time">\${new Date().toLocaleTimeString()}</span>
                        </div>
                        <div class="history-content">\${content}</div>
                    \`;
                    history.insertBefore(item, history.firstChild);
                }

                // Atualização inicial do status
                updateStatus('connecting', 'Conectando ao DeepSeek...');

                function analyzeCurrent() {
                    vscode.postMessage({ command: 'analyzeCode' });
                }
                
                function explainSelected() {
                    vscode.postMessage({ command: 'explainCode' });
                }
                
                function checkSecurity() {
                    vscode.postMessage({ command: 'analyzeSecurity' });
                }

                function generateCode() {
                    vscode.postMessage({ command: 'generateCode' });
                }

                // Atualizar status quando receber mensagens
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'status':
                            updateStatus(message.status, message.message);
                            break;
                        case 'history':
                            addHistoryItem(message.historyType, message.content);
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
  }

  public updateModelStatus(
    status: "connected" | "connecting" | "error",
    message: string
  ) {
    this._panel.webview.postMessage({ type: "status", status, message });
  }

  public addToHistory(type: string, content: string) {
    this._panel.webview.postMessage({
      type: "history",
      historyType: type,
      content,
    });
  }

  private dispose() {
    PandoraPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) x.dispose();
    }
  }
}
