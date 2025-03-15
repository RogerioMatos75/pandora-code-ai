export interface AnalyzeResponse {
  analysis: string;
}

export interface ExplainResponse {
  explanation: string;
}

export interface SecurityResponse {
  vulnerabilities: Array<{
    type: string;
    description: string;
    severity: string;
    solution: string;
    secureExample?: string;
  }>;
}

export interface GenerateResponse {
  code: string;
  explanation: string;
  examples: string[];
}

export interface CompletionResponse {
  result: string;
  suggestions?: string[];
  details?: string;
}
