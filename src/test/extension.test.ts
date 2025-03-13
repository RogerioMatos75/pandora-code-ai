import * as vscode from "vscode";
import * as assert from "assert";

describe("Extensão Pandora Code AI Test Suite", () => {
  test("Extensão deve ser ativada", async () => {
    const ext = vscode.extensions.getExtension("pandora-code-ai");
    assert.ok(ext);

    await ext?.activate();
    assert.ok(
      await vscode.commands
        .getCommands(true)
        .then((cmds) => cmds.includes("pandora-code-ai.analyzeCode"))
    );
  });

  test("Comando analyzeCode deve executar", async () => {
    // Criar documento de teste
    const document = await vscode.workspace.openTextDocument({
      content: "function test() { return true; }",
      language: "javascript",
    });

    await vscode.window.showTextDocument(document);

    // Executar comando
    await vscode.commands.executeCommand("pandora-code-ai.analyzeCode");

    // Verificar se o painel de resultados foi aberto
    const activePanel = vscode.window.visibleTextEditors.find((editor) =>
      editor.document.fileName.includes("Pandora AI - Resultados")
    );

    assert.ok(activePanel);
  });
});
