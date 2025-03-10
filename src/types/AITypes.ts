export interface CodeSuggestion {
  suggestion: string;
  explanation: string;
}

export interface SecurityIssue {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  solution?: string;
}

export interface CodeExplanation {
  simpleExplanation: string;
  technicalDetails?: string;
  examples?: string[];
}

export interface SecurityVulnerability {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  solution: string;
  secureExample: string;
}

export interface CodeGeneration {
  code: string;
  explanation: string;
  examples: string[];
}

export interface CodeAnalysisResult {
  complexity: {
    score: number;
    suggestions: string[];
  };
  maintainability: {
    score: number;
    issues: string[];
  };
  bestPractices: {
    violations: Array<{
      rule: string;
      suggestion: string;
      priority: "high" | "medium" | "low";
    }>;
  };
  performance: {
    issues: Array<{
      description: string;
      impact: string;
      solution: string;
    }>;
  };
}
