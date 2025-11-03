export class AntivirusUnavailableError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AntivirusUnavailableError';
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}

export class AntivirusScanFailureError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AntivirusScanFailureError';
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}
