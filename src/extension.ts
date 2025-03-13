import * as vscode from "vscode";
import fetch from "node-fetch";
import { AIService } from "./services/aiService";
import { ResultPanel } from "./ui/ResultPanel";
import { MetricsService } from "./services/metricsService";
import { PandoraPanel } from "./ui/PandoraPanel";

export function activate(context: vscode.ExtensionContext) {
  const aiService = new AIService();
  const resultPanel = new ResultPanel(context);
  const metricsService = new MetricsService();
  // Removemos a criação de codeAnalysisService que usava getDeepSeekService()

  let disposables = [
    vscode.commands.registerCommand(
      "pandora-code-ai.analyzeSecurity",
      async () => {
        try {
          metricsService.trackCommand("analyzeSecurity");
          const editor = vscode.window.activeTextEditor;
          if (!editor) return;

          const vulnerabilities = await aiService.analyzeCodeSecurity(
            editor.document
          );
          resultPanel.showSecurityResults(vulnerabilities);
        } catch (error) {
          metricsService.trackError(error as Error);
          vscode.window.showErrorMessage(
            "Erro ao analisar segurança: " + (error as Error).message
          );
        }
      }
    ),

    vscode.commands.registerCommand(
      "pandora-code-ai.generateCode",
      async () => {
        const description = await vscode.window.showInputBox({
          prompt: "Descreva o código que você quer gerar",
        });
        if (!description) return;

        const language = await vscode.window.showQuickPick(
          ["python", "javascript", "typescript"],
          {
            placeHolder: "Escolha a linguagem",
          }
        );
        if (!language) return;

        const result = await aiService.generateCode(description, language);
        resultPanel.showCodeGeneration(result);
      }
    ),

    vscode.commands.registerCommand("pandora-code-ai.explainCode", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const code = editor.document.getText(selection);
      const explanation = await aiService.explainCode(code);
      // Mostrar resultados
    }),

    // Novo comando para análise de código usando /complete do servidor Flask
    vscode.commands.registerCommand("pandora-code-ai.analyzeCode", async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const code = editor.document.getText();
        const response = await fetch("http://localhost:5000/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: code }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          vscode.window.showErrorMessage(
            `Erro do servidor: ${response.status} - ${errorText}`
          );
          return;
        }
        const data = await response.json();
        // Presume que data.result contém a análise do código
        resultPanel.showCodeAnalysis(data.result);
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Erro ao comunicar com o servidor: ${error.message}`
        );
      }
    }),
  ];

  // Adicionar comando para ver métricas
  disposables.push(
    vscode.commands.registerCommand("pandora-code-ai.showMetrics", () => {
      const report = metricsService.getUsageReport();
      vscode.window.showInformationMessage(report);
    })
  );

  // Removido o comando "pandora-code-ai.showModelMetrics" que dependia do DeepSeekService

  // Registrar comando para abrir o painel
  context.subscriptions.push(
    vscode.commands.registerCommand("pandora-code-ai.showPanel", () => {
      PandoraPanel.createOrShow(context.extensionUri);
    })
  );

  // Registrar a view do Pandora
  const pandoraViewProvider = {
    resolveWebviewView(
      webviewView: vscode.WebviewView,
      context: vscode.WebviewViewResolveContext,
      token: vscode.CancellationToken
    ) {
      webviewView.webview.html = PandoraPanel.getWebviewContent();
      // Atualizar status inicial – agora usando o servidor Flask
      webviewView.webview.postMessage({
        type: "status",
        status: "connected",
        message: "Servidor conectado",
      });
      // Removida a chamada à inicialização do DeepSeekService
    },
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "pandora-ai.mainView",
      pandoraViewProvider
    )
  );

  context.subscriptions.push(...disposables);
}

export function deactivate() {}
