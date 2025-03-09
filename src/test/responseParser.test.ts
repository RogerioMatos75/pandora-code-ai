import { ResponseParser } from '../utils/responseParser';

describe('ResponseParser', () => {
    describe('parseSecurityAnalysis', () => {
        test('deve parsear vulnerabilidades de segurança corretamente', () => {
            const mockResponse = `
                1. SQL Injection encontrado na linha 10
                2. XSS vulnerabilidade no input do usuário
            `;

            const result = ResponseParser.parseSecurityAnalysis(mockResponse);
            
            expect(result).toHaveLength(2);
            expect(result[0].type).toBe('sql-injection');
            expect(result[1].type).toBe('xss');
        });
    });

    describe('parseCodeAnalysis', () => {
        test('deve parsear análise de código corretamente', () => {
            const mockResponse = `
                ## Complexidade
                Score: 7
                - Muitos loops aninhados
                - Condicionais complexas

                ## Manutenibilidade
                Score: 5
                - Falta de documentação
                - Código duplicado
            `;

            const result = ResponseParser.parseCodeAnalysis(mockResponse);
            
            expect(result.complexity.score).toBe(7);
            expect(result.maintainability.score).toBe(5);
            expect(result.complexity.suggestions).toHaveLength(2);
        });
    });
});
