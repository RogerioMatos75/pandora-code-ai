import fetch from "node-fetch";
import { IAIRepository } from "./IAIRepository";

export class AIRepository implements IAIRepository {
  private readonly serverUrl = "http://localhost:5000";

  async getSuggestions(code: string, line: number): Promise<string[]> {
    const response = await fetch(`${this.serverUrl}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, position: line }),
    });
    const data = await response.json();
    return data.suggestions;
  }

  async checkSecurity(code: string): Promise<any[]> {
    const response = await fetch(`${this.serverUrl}/security`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    return data.vulnerabilities;
  }

  async explainCode(code: string): Promise<string> {
    const response = await fetch(`${this.serverUrl}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    return data.explanation;
  }
}
