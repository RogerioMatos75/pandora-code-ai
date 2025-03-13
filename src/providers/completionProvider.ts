import * as vscode from "vscode";
import fetch from "node-fetch";
import { CodeSuggestion } from "../types/AITypes";

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
      const data = await response.json();
      // Supondo que o endpoint retorne um array de sugestões em string
      const suggestions: CodeSuggestion[] = data.suggestions.map(
        (s: string) => ({ suggestion: s, explanation: "" })
      );

      return suggestions.map((suggestion: CodeSuggestion) => {
        const item = new vscode.CompletionItem(suggestion.suggestion);
        item.detail = suggestion.explanation;
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
