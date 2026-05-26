export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(context, error);
  }
}

export function logWarn(context: string, message: string): void {
  if (import.meta.env.DEV) {
    console.warn(context, message);
  }
}
