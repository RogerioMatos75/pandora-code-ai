import * as vscode from "vscode";
import fetch from "node-fetch";
import { AIService } from "./services/aiService";
import { ResultPanel } from "./ui/ResultPanel";
import { MetricsService } from "./services/metricsService";
import { PandoraPanel } from "./ui/PandoraPanel";
import { CompletionResponse } from "./types/APITypes";
import { CodeAnalysisResult } from "./types/AITypes";
import { ResponseParser } from "./utils/responseParser";
import { OutputService } from "./services/outputService";
import { PandoraBox } from "./ui/PandoraBox";
import { PandoraPanelProvider } from "./ui/PandoraPanelProvider";
import { Fix, ServerFixResponse } from "./types/FixTypes";

interface APIResponse {
  result: string;
  explanation?: string;
  correctedCode?: string;
}

let aiService: AIService;
let resultPanel: ResultPanel;
let metricsService: MetricsService;

class ServerInitializer {
  private maxRetries: number = 3;
  private serverUrl: string = "http://localhost:5000";
  private isServerAvailable: boolean = false;

  async initialize(): Promise<void> {
    for (let t = 0; t < this.maxRetries; t++) {
      try {
        const response = await fetch(`${this.serverUrl}/status`);
        if (response.ok) {
          this.isServerAvailable = true;
          return;
        }
        throw new Error(`Servidor indisponível: ${response.status}`);
      } catch (error) {
        if (t === this.maxRetries - 1) {
          vscode.window.showErrorMessage(
            `Falha ao conectar ao servidor após ${this.maxRetries} tentativas. Verifique se o servidor está rodando.`
          );
          throw new Error(`Falha na inicialização: ${error}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000 * (t + 1)));
      }
    }
  }
}

export async function activate(context: vscode.ExtensionContext) {
  console.log("Iniciando Pandora Code AI...");

  try {
    const serverInit = new ServerInitializer();
    // Inicializar serviços de forma mais controlada
    aiService = new AIService();
    resultPanel = new ResultPanel(context);
    metricsService = new MetricsService();

    // Verificar conexão com servidor antes de registrar comandos
    console.log("Verificando conexão com servidor...");
    const serverAvailable = await aiService.checkServerConnection();
    if (!serverAvailable) {
      const message =
        "Servidor não está respondendo. A extensão funcionará com capacidades limitadas.";
      console.warn(message);
      vscode.window.showWarningMessage(message);
    }

    // Registrar comandos mesmo se o servidor não estiver disponível
    let disposables = [
      vscode.commands.registerCommand(
        "pandora-code-ai.analyzeSecurity",
        handleAnalyzeSecurity
      ),
      vscode.commands.registerCommand(
        "pandora-code-ai.generateCode",
        handleGenerateCode
      ),
      vscode.commands.registerCommand(
        "pandora-code-ai.explainCode",
        handleExplainCode
      ),
      vscode.commands.registerCommand(
        "pandora-code-ai.analyzeCode",
        handleAnalyzeCode
      ),
      vscode.commands.registerCommand(
        "pandora-code-ai.showMetrics",
        handleShowMetrics
      ),
      vscode.commands.registerCommand("pandora-code-ai.showPanel", () => {
        PandoraPanel.createOrShow(context.extensionUri);
      }),
      vscode.commands.registerCommand(
        "pandora-code-ai.analyzeError",
        handleAnalyzeError
      ),
      vscode.commands.registerCommand(
        "pandora-code-ai.sendToPandoraBox",
        async () => {
          const editor = vscode.window.activeTextEditor;
          if (!editor) return;

          const selection = editor.selection;
          const code = editor.document.getText(selection);

          if (!code) {
            vscode.window.showInformationMessage(
              "Selecione um trecho de código com erro"
            );
            return;
          }

          PandoraBox.createOrShow();
          // Aguarda um momento para garantir que o webview está pronto
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Chamar o método estático diretamente
          await PandoraBox.analyzeError(code);
        }
      ),
      vscode.commands.registerCommand(
        "pandora-code-ai.fixProblems",
        handleFixProblems
      ),
    ];

    context.subscriptions.push(...disposables);

    // Adicionar comando para terminal
    let terminalErrorCommand = vscode.commands.registerCommand(
      "pandora-code-ai.analyzeTerminalError",
      async () => {
        const terminal = vscode.window.activeTerminal;
        if (!terminal) return;

        const selection = await vscode.env.clipboard.readText();
        if (!selection) {
          vscode.window.showInformationMessage(
            "Selecione o erro no terminal primeiro"
          );
          return;
        }

        // Criar/mostrar Pandora Box
        PandoraBox.createOrShow();
        await PandoraBox.analyzeError(selection);
      }
    );

    context.subscriptions.push(terminalErrorCommand);

    // Registrar provedores de visualização unificados
    const pandoraViewProvider = new PandoraPanelProvider(context.extensionUri);
    const pandoraBoxProvider = {
      resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = {
          enableScripts: true,
        };
        webviewView.webview.html = PandoraBox.getWebviewContent();
      },
    };

    // Registrar views containers
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        "pandora-ai.mainView",
        pandoraViewProvider
      ),
      vscode.window.registerWebviewViewProvider(
        "pandoraBox",
        pandoraBoxProvider
      )
    );

    console.log("Pandora Code AI ativada com sucesso!");
  } catch (error) {
    console.error("Erro na inicialização:", error);
    vscode.window.showErrorMessage(`Erro ao iniciar Pandora Code AI: ${error}`);
    // Não propagar o erro para permitir que a extensão continue funcionando parcialmente
  }
}

// Extrair handlers dos comandos para melhor organização
async function handleAnalyzeSecurity() {
  try {
    metricsService.trackCommand("analyzeSecurity");
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const vulnerabilities = await aiService.analyzeCodeSecurity(
      editor.document
    );
    resultPanel.showSecurityResults(vulnerabilities);
  } catch (error) {
    console.error("Erro em analyzeSecurity:", error);
    metricsService.trackError(error as Error);
    vscode.window.showErrorMessage(
      `Erro ao analisar segurança: ${(error as Error).message}`
    );
  }
}

async function handleGenerateCode() {
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

async function handleExplainCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const selection = editor.selection;
  const code = editor.document.getText(selection);
  const explanation = await aiService.explainCode(code);
  // Mostrar resultados
}

async function handleAnalyzeCode() {
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

    const data = (await response.json()) as CompletionResponse;
    if (typeof data.result === "string") {
      // Usar ResponseParser para converter a string em CodeAnalysisResult
      const analysisResult = ResponseParser.parseCodeAnalysis(data.result);
      resultPanel.showCodeAnalysis(analysisResult);
    } else {
      vscode.window.showErrorMessage(
        "Formato de resposta inválido do servidor"
      );
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Erro ao comunicar com o servidor: ${error.message}`
    );
  }
}

async function handleShowMetrics() {
  const report = metricsService.getUsageReport();
  vscode.window.showInformationMessage(report);
}

async function handleAnalyzeError() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  if (!selectedText) {
    vscode.window.showInformationMessage(
      "Selecione o erro ou trecho de código para analisar."
    );
    return;
  }

  const output = OutputService.getInstance();
  output.clear();
  output.appendLine("🔍 Enviando erro para análise...");
  output.show();

  try {
    const response = await fetch("http://localhost:5000/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Corrija o seguinte erro:\n${selectedText}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      output.appendLine(
        `❌ Erro do servidor: ${response.status} - ${errorText}`
      );
      return;
    }

    const data = (await response.json()) as APIResponse;

    if (data && data.result) {
      output.appendLine("\n💡 Sugestão da Pandora:");
      output.appendLine(data.result);

      const choice = await vscode.window.showQuickPick(
        ["Aplicar Correção", "Copiar para Clipboard", "Ignorar"],
        { placeHolder: "O que você deseja fazer com a sugestão?" }
      );

      if (choice === "Copiar para Clipboard") {
        await vscode.env.clipboard.writeText(data.result);
        output.appendLine("\n📋 Sugestão copiada para clipboard!");
      } else if (choice === "Aplicar Correção") {
        await editor.edit((editBuilder) => {
          editBuilder.replace(selection, data.result);
        });
        output.appendLine("\n✅ Correção aplicada ao código!");
      }
    }
  } catch (error) {
    output.appendLine(`\n❌ Erro: ${error}`);
    vscode.window.showErrorMessage(`Erro ao analisar código: ${error}`);
  }
}

async function handleFixProblems() {
  const diagnostics = vscode.languages.getDiagnostics();

  for (const [uri, fileDiagnostics] of diagnostics) {
    for (const diagnostic of fileDiagnostics) {
      try {
        const response = await fetch("http://localhost:5000/fix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: diagnostic.message,
            code: diagnostic.source,
            line: diagnostic.range.start.line,
            file: uri.fsPath,
          }),
        });

        const fix = (await response.json()) as ServerFixResponse;

        resultPanel.showFixResult({
          originalError: diagnostic.message,
          fixedCode: fix.code,
          explanation: fix.explanation,
          file: uri.fsPath,
          line: diagnostic.range.start.line,
        });
      } catch (error) {
        console.error("Erro ao corrigir problema:", error);
        vscode.window.showErrorMessage(`Erro ao corrigir problema: ${error}`);
      }
    }
  }
}

async function handleDiagnosticsChange(
  diagnostics: [vscode.Uri, readonly vscode.Diagnostic[]][]
) {
  for (const [uri, fileDiagnostics] of diagnostics) {
    for (const diagnostic of fileDiagnostics) {
      if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
        try {
          // Extrair informações do erro
          const errorInfo = {
            message: diagnostic.message,
            range: diagnostic.range,
            source: diagnostic.source,
            file: uri.fsPath,
          };

          const response = await fetch("http://localhost:5000/fix", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              error: errorInfo.message,
              code: errorInfo.source,
              line: errorInfo.range.start.line,
              character: errorInfo.range.start.character,
              file: errorInfo.file,
            }),
          });

          const fix = (await response.json()) as ServerFixResponse;

          // Aplicar correção usando TextEditor.edit()
          const document = await vscode.workspace.openTextDocument(uri);
          const editor = await vscode.window.showTextDocument(document);

          await editor.edit((editBuilder) => {
            editBuilder.replace(diagnostic.range, fix.code);
          });

          // Atualizar view com feedback
          PandoraPanelProvider.current?.updateFixSuggestion({
            originalError: errorInfo.message,
            fixedCode: fix.code,
            explanation: fix.explanation,
            file: errorInfo.file,
            line: errorInfo.range.start.line,
            diagnostic: diagnostic,
          });
        } catch (error) {
          console.error("Erro ao analisar diagnóstico:", error);
        }
      }
    }
  }
}

export function deactivate() {
  // Cleanup code here if needed
  console.log("Pandora Code AI desativada.");
}
