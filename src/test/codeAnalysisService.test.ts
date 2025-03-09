import { CodeAnalysisService } from '../services/codeAnalysisService';
import { DeepSeekService } from '../services/deepseekService';
import * as vscode from 'vscode';

jest.mock('../services/deepseekService');
jest.mock('vscode');

describe('CodeAnalysisService', () => {
    let service: CodeAnalysisService;
    let mockDeepSeek: jest.Mocked<DeepSeekService>;

    beforeEach(() => {
        mockDeepSeek = new DeepSeekService() as jest.Mocked<DeepSeekService>;
        service = new CodeAnalysisService(mockDeepSeek);
    });

    test('deve analisar código corretamente', async () => {
        const mockDocument = {
            getText: jest.fn().mockReturnValue('function test() { return true; }')
        } as unknown as vscode.TextDocument;

        mockDeepSeek.generate.mockResolvedValue(`
            ## Complexidade
            Score: 1
            - Código simples
        `);

        const result = await service.analyzeCode(mockDocument);
        
        expect(result.complexity.score).toBe(1);
        expect(mockDeepSeek.generate).toHaveBeenCalled();
    });
});
