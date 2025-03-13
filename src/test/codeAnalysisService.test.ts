import { CodeAnalysisService } from "../services/codeAnalysisService";
import * as vscode from "vscode";
import { ResponseParser } from "../utils/responseParser";

jest.mock("vscode");

describe("CodeAnalysisService", () => {
  let service: CodeAnalysisService;

  beforeEach(() => {
    service = new CodeAnalysisService();
  });

  test("deve analisar código corretamente", async () => {
    const mockDocument = {
      getText: jest.fn().mockReturnValue("function test() { return true; }"),
    } as unknown as vscode.TextDocument;

    // Simule a resposta do endpoint /analyze (ajuste conforme sua implementação):
    const mockResponse = `
            ## Complexidade
            Score: 1
            - Código simples
        `;
    // Supondo que o ResponseParser vai extrair um score de 1
    // Para o teste, você deve ajustar se usar um mock global para fetch.

    // Se for necessário, simule a função fetch global neste teste.
    // Em seguida, chame service.analyzeCode e verifique o resultado.
    const result = await service.analyzeCode(mockDocument);

    expect(result.complexity.score).toBe(1);
  });
});
