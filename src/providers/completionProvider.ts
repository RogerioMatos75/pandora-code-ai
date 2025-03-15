import * as vscode from "vscode";
import fetch from "node-fetch";
import { CodeSuggestion } from "../types/AITypes";
import { CompletionResponse } from "../types/APITypes";

export class DeepSeekCompletionProvider
  implements vscode.CompletionItemProvider
{
  // Removido o parâmetro deepseek
  constructor() {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.CompletionItem[]> {
    const code = document.getText();
    const offset = document.offsetAt(position);

    try {
      const response = await fetch("http://localhost:5000/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, position: offset }),
      });
      if (!response.ok) {
        vscode.window.showErrorMessage("Erro do servidor ao obter sugestões.");
        return [];
      }
      const data = (await response.json()) as CompletionResponse;
      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        return [];
      }

      return data.suggestions.map((suggestion: string) => {
        const item = new vscode.CompletionItem(suggestion);
        item.kind = vscode.CompletionItemKind.Snippet;
        return item;
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(
        `Erro ao obter sugestões: ${error.message}`
      );
      return [];
    }
  }
}
