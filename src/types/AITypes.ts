export interface CodeSuggestion {
    suggestion: string;
    explanation: string;
}

export interface SecurityIssue {
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
}

export interface CodeExplanation {
    simpleExplanation: string;
    technicalDetails?: string;
    examples?: string[];
}

export interface SecurityVulnerability {
    type: 'sql-injection' | 'xss' | 'csrf' | 'other';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    solution: string;
    secureExample: string;
}

export interface CodeGeneration {
    code: string;
    explanation: string;
    examples: string[];
}

export interface CodeAnalysis {
    security: SecurityVulnerability[];
    performance: string[];
    bestPractices: string[];
}
