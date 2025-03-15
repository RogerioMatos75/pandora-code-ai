declare global {
  interface Window {
    acquireVsCodeApi?: () => any;
  }
  var window: Window & typeof globalThis;
}
export function getWindow(): (Window & typeof globalThis) | undefined {
  if (typeof window !== "undefined") {
    return window;
  }
  return undefined;
}

export function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined";
}

export function getVSCodeAPI() {
  if (typeof window.acquireVsCodeApi === "function") {
    try {
      return window.acquireVsCodeApi();
    } catch (e) {
      console.warn("VSCode API não disponível:", e);
    }
  }
  return null;
}
