export interface Logger {
  info(message: string): void;
  error(message: string): void;
}

export function createLogger(scope: string): Logger {
  return {
    info(message) {
      console.info(`[${scope}] ${message}`);
    },
    error(message) {
      console.error(`[${scope}] ${message}`);
    }
  };
}
