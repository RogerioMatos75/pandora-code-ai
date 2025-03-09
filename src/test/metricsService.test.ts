import { MetricsService } from '../services/metricsService';

describe('MetricsService', () => {
    let metricsService: MetricsService;

    beforeEach(() => {
        metricsService = new MetricsService();
    });

    test('deve registrar comando executado', () => {
        metricsService.trackCommand('analyzeSecurity');
        const report = metricsService.getUsageReport();
        expect(report).toContain('analyzeSecurity: 1');
    });

    test('deve incrementar contador de comando', () => {
        metricsService.trackCommand('analyzeSecurity');
        metricsService.trackCommand('analyzeSecurity');
        const report = metricsService.getUsageReport();
        expect(report).toContain('analyzeSecurity: 2');
    });

    test('deve registrar erros por tipo', () => {
        const error = new TypeError('teste');
        metricsService.trackError(error);
        const report = metricsService.getUsageReport();
        expect(report).toContain('error_TypeError: 1');
    });

    test('deve persistir métricas entre chamadas', () => {
        metricsService.trackCommand('explainCode');
        metricsService.trackCommand('generateCode');
        const report = metricsService.getUsageReport();
        expect(report).toContain('explainCode: 1');
        expect(report).toContain('generateCode: 1');
    });
});
