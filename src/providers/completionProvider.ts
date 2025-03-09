import * as vscode from 'vscode';
import { DeepSeekService } from '../services/deepseekService';

export class DeepSeekCompletionProvider implements vscode.CompletionItemProvider {
    constructor(private deepseek: DeepSeekService) {}

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        const code = document.getText();
        const offset = document.offsetAt(position);
        
        const suggestions = await this.deepseek.codeComplete(code, offset);
        
        return suggestions.map(suggestion => {
            const item = new vscode.CompletionItem(suggestion);
            item.kind = vscode.CompletionItemKind.Snippet;
            return item;
        });
    }
}
