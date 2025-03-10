import * as os from "os";
import * as fs from "fs";

export class SystemCheck {
  static checkRequirements(): { ok: boolean; issues: string[] } {
    const issues: string[] = [];
    const totalMem = os.totalmem() / (1024 * 1024 * 1024); // GB
    const freeDisk = this.getFreeDiskSpace();

    if (totalMem < 16) {
      issues.push("Memória RAM insuficiente. Mínimo recomendado: 16GB");
    }

    if (freeDisk < 20) {
      issues.push("Espaço em disco insuficiente. Mínimo recomendado: 20GB");
    }

    return {
      ok: issues.length === 0,
      issues,
    };
  }

  private static getFreeDiskSpace(): number {
    // Implementar verificação de espaço em disco
    return 0;
  }
}
