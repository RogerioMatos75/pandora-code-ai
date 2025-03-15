import * as vscode from "vscode";

export interface FixResult {
  code: string;
  explanation: string;
}

export interface Fix {
  originalError: string;
  fixedCode: string;
  explanation: string;
  file: string;
  line: number;
  diagnostic?: vscode.Diagnostic;
}

export interface ServerFixResponse {
  code: string;
  explanation: string;
}
