import {
  SecurityVulnerability,
  CodeGeneration,
  CodeAnalysisResult,
} from "../types/AITypes";
import { GenerateResponse } from "../types/APITypes";

export class ResponseParser {
  static parseSecurityAnalysis(response: any): SecurityVulnerability[] {
    try {
      const rawVulnerabilities =
        typeof response === "string"
          ? JSON.parse(response).vulnerabilities
          : response.vulnerabilities;

      return rawVulnerabilities.map((v: any) => ({
        type: v.type || "unknown",
        description: v.description || "",
        severity: this.assessSeverity(v.severity || ""),
        solution: v.solution || "",
        secureExample: v.secureExample,
      }));
    } catch (error) {
      console.error("Erro ao analisar resposta de segurança:", error);
      return [];
    }
  }

  static parseCodeGeneration(
    response: GenerateResponse | string
  ): CodeGeneration {
    try {
      const data =
        typeof response === "string" ? JSON.parse(response) : response;
      return {
        code: data.code || "",
        explanation: data.explanation || "",
        examples: Array.isArray(data.examples) ? data.examples : [],
      };
    } catch (error) {
      console.error("Erro ao parsear resposta:", error);
      return { code: "", explanation: "", examples: [] };
    }
  }

  static parseCodeAnalysis(response: string): CodeAnalysisResult {
    try {
      const sections = response.split(/\n#{2,3}\s/);

      return {
        complexity: this.parseComplexitySection(sections),
        maintainability: this.parseMaintainabilitySection(sections),
        bestPractices: {
          violations: this.parseBestPracticesSection(sections),
        },
        performance: {
          issues: this.parsePerformanceSection(sections),
        },
      };
    } catch (error) {
      console.error("Erro ao parsear análise de código:", error);
      return {
        complexity: { score: 0, suggestions: [] },
        maintainability: { score: 0, issues: [] },
        bestPractices: { violations: [] },
        performance: { issues: [] },
      };
    }
  }

  private static parseTextResponse(text: string): any[] {
    const sections = text.split(/\n\d+\.\s/);
    return sections.filter(Boolean).map((section) => ({
      description: section.trim(),
    }));
  }

  private static detectVulnerabilityType(text: string): string {
    const types = {
      sql: "sql-injection",
      xss: "xss",
      csrf: "csrf",
      injection: "injection",
    };

    for (const [keyword, type] of Object.entries(types)) {
      if (text.toLowerCase().includes(keyword)) {
        return type;
      }
    }
    return "other";
  }

  static assessSeverity(
    severity: string
  ): "critical" | "high" | "medium" | "low" {
    const severityMap: Record<string, "critical" | "high" | "medium" | "low"> =
      {
        grave: "critical",
        crítico: "critical",
        alta: "high",
        alto: "high",
        moderada: "medium",
        moderado: "medium",
        média: "medium",
        médio: "medium",
        baixa: "low",
        baixo: "low",
        "1": "critical",
        "2": "high",
        "3": "medium",
        "4": "low",
      };

    return severityMap[severity.toLowerCase()] || "medium";
  }

  private static extractSolution(item: any): string {
    if (typeof item === "string") {
      const solutionMatch = item.match(/solução:?\s*([^\n]+)/i);
      return solutionMatch ? solutionMatch[1].trim() : "";
    }
    return "";
  }

  private static extractExample(item: any): string {
    if (typeof item === "string") {
      const exampleMatch = item.match(/exemplo:?\s*([^\n]+)/i);
      return exampleMatch ? exampleMatch[1].trim() : "";
    }
    return "";
  }

  private static parseComplexitySection(sections: string[]): {
    score: number;
    suggestions: string[];
  } {
    const complexitySection =
      sections.find((s) => s.toLowerCase().includes("complexidade")) || "";
    const scoreMatch = complexitySection.match(/score:\s*(\d+)/i);
    const suggestions = complexitySection
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace("-", "").trim());

    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
      suggestions,
    };
  }

  private static parseMaintainabilitySection(sections: string[]): {
    score: number;
    issues: string[];
  } {
    const section =
      sections.find((s) => s.toLowerCase().includes("manutenibilidade")) || "";
    const scoreMatch = section.match(/score:\s*(\d+)/i);
    const issues = section
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace("-", "").trim());

    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
      issues,
    };
  }

  private static parseBestPracticesSection(sections: string[]): Array<{
    rule: string;
    suggestion: string;
    priority: "high" | "medium" | "low";
  }> {
    const section =
      sections.find((s) => s.toLowerCase().includes("boas práticas")) || "";
    return section
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => {
        const [rule, ...rest] = line.replace("-", "").split(":");
        return {
          rule: rule.trim(),
          suggestion: rest.join(":").trim(),
          priority: this.assessPriority(line),
        };
      });
  }

  private static parsePerformanceSection(
    sections: string[]
  ): Array<{ description: string; impact: string; solution: string }> {
    const section =
      sections.find((s) => s.toLowerCase().includes("performance")) || "";
    return section
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => {
        const parts = line
          .replace("-", "")
          .split("|")
          .map((p) => p.trim());
        return {
          description: parts[0] || "",
          impact: parts[1] || "",
          solution: parts[2] || "",
        };
      });
  }

  private static assessPriority(text: string): "high" | "medium" | "low" {
    if (
      text.toLowerCase().includes("crítico") ||
      text.toLowerCase().includes("importante")
    ) {
      return "high";
    }
    if (text.toLowerCase().includes("moderado")) {
      return "medium";
    }
    return "low";
  }
}
