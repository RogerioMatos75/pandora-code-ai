import * as vscode from "vscode";

export class OutputService {
  private static instance: OutputService;
  private outputChannel: vscode.OutputChannel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel("Caixa de Pandora");
  }

  static getInstance(): OutputService {
    if (!OutputService.instance) {
      OutputService.instance = new OutputService();
    }
    return OutputService.instance;
  }

  show(): void {
    this.outputChannel.show();
  }

  appendLine(text: string): void {
    this.outputChannel.appendLine(text);
  }

  clear(): void {
    this.outputChannel.clear();
  }
}
