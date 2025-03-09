import axios from 'axios';
import { IAIRepository } from './IAIRepository';

export class AIRepository implements IAIRepository {
    private readonly serverUrl = 'http://localhost:5000';

    async getSuggestions(code: string, line: number): Promise<string[]> {
        const response = await axios.post(`${this.serverUrl}/suggest`, { code, position: line });
        return response.data.suggestions;
    }

    async checkSecurity(code: string): Promise<any[]> {
        const response = await axios.post(`${this.serverUrl}/security`, { code });
        return response.data.vulnerabilities;
    }

    async explainCode(code: string): Promise<string> {
        const response = await axios.post(`${this.serverUrl}/explain`, { code });
        return response.data.explanation;
    }
}
