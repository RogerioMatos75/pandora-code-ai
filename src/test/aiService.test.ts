import { AIService } from "../services/aiService";
import { SecurityVulnerability } from "../types/AITypes";

jest.mock("../services/deepseekService");

describe("AIService", () => {
  let aiService: AIService;
  let mockDeepSeek: any;

  beforeEach(() => {
    aiService = new AIService();
  });

  test("analyzeCodeSecurity deve retornar vulnerabilidades", async () => {
    const userId = 1;
    const mockResponse = [
      {
        type: "sql-injection",
        severity: "high",
        description: "SQL Injection encontrado",
        solution: "Use prepared statements",
        secureExample: "exemplo seguro aqui",
      },
    ] as SecurityVulnerability[];

    const result = await aiService.analyzeCodeSecurity({
      getText: () => "SELECT * FROM users WHERE id = " + userId,
    } as any);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("sql-injection");
  });
});
