import { AIService } from '../services/aiService';
import { DeepSeekService } from '../services/deepseekService';
import { SecurityVulnerability } from '../types/AITypes';

jest.mock('../services/deepseekService');

describe('AIService', () => {
    let aiService: AIService;
    let mockDeepSeek: jest.Mocked<DeepSeekService>;

    beforeEach(() => {
        mockDeepSeek = new DeepSeekService() as jest.Mocked<DeepSeekService>;
        aiService = new AIService();
    });

    test('analyzeCodeSecurity deve retornar vulnerabilidades', async () => {
        const mockResponse = [{
            type: 'sql-injection',
            severity: 'high',
            description: 'SQL Injection encontrado',
            solution: 'Use prepared statements',
            secureExample: 'exemplo seguro aqui'
        }] as SecurityVulnerability[];

        mockDeepSeek.generate.mockResolvedValue(JSON.stringify(mockResponse));
        
        const result = await aiService.analyzeCodeSecurity({
            getText: () => 'SELECT * FROM users WHERE id = ' + userId
        } as any);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('sql-injection');
    });
});
