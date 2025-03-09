export interface IAIRepository {
    getSuggestions(code: string, line: number): Promise<string[]>;
    checkSecurity(code: string): Promise<any[]>;
    explainCode(code: string): Promise<string>;
}
