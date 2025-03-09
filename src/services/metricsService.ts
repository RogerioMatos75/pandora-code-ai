import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class MetricsService {
    private metrics: Map<string, number>;
    private context?: vscode.ExtensionContext;

    constructor(context?: vscode.ExtensionContext) {
        this.context = context;
        this.metrics = this.loadMetrics();
    }

    private loadMetrics(): Map<string, number> {
        if (!this.context) {
            return new Map();
        }
        const saved = this.context.globalState.get<Record<string, number>>('metrics', {});
        return new Map(Object.entries(saved));
    }

    private saveMetrics(): void {
        if (!this.context) return;
        const metricsObj = Object.fromEntries(this.metrics);
        this.context.globalState.update('metrics', metricsObj);
    }

    trackCommand(command: string) {
        const count = this.metrics.get(command) || 0;
        this.metrics.set(command, count + 1);
        this.saveMetrics();
    }

    trackError(error: Error) {
        const errorType = error.constructor.name;
        const count = this.metrics.get(`error_${errorType}`) || 0;
        this.metrics.set(`error_${errorType}`, count + 1);
        this.saveMetrics();
    }

    getUsageReport(): string {
        let report = '## Relatório de Uso\n\n';
        this.metrics.forEach((count, key) => {
            report += `- ${key}: ${count} vezes\n`;
        });
        return report;
    }

    async exportMetrics(format: 'json' | 'csv' | 'markdown'): Promise<string> {
        const metrics = Object.fromEntries(this.metrics);
        
        switch (format) {
            case 'json':
                return JSON.stringify(metrics, null, 2);
            
            case 'csv':
                const csvContent = ['Comando,Contagem'];
                Object.entries(metrics).forEach(([key, value]) => {
                    csvContent.push(`${key},${value}`);
                });
                return csvContent.join('\n');
            
            case 'markdown':
                return this.getUsageReport();
        }
    }

    async saveMetricsToFile(format: 'json' | 'csv' | 'markdown'): Promise<void> {
        const content = await this.exportMetrics(format);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const fileName = `metrics-${timestamp}.${format}`;
        
        if (this.context) {
            const filePath = path.join(this.context.globalStoragePath, fileName);
            await fs.promises.writeFile(filePath, content);
            vscode.window.showInformationMessage(`Métricas exportadas para: ${filePath}`);
        }
    }
}
