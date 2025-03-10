export class StatusManager {
  private static instance: StatusManager;
  private status: {
    modelInstalled: boolean;
    serverRunning: boolean;
    lastError?: string;
  } = {
    modelInstalled: false,
    serverRunning: false,
  };

  static getInstance(): StatusManager {
    if (!StatusManager.instance) {
      StatusManager.instance = new StatusManager();
    }
    return StatusManager.instance;
  }

  updateModelStatus(installed: boolean, error?: string) {
    this.status.modelInstalled = installed;
    this.status.lastError = error;
  }

  updateServerStatus(running: boolean, error?: string) {
    this.status.serverRunning = running;
    this.status.lastError = error;
  }

  getStatus() {
    return { ...this.status };
  }
}
