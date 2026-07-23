export interface LoggerPort {
  info(message: string, context?: string): void
  success(message: string, context?: string): void
  warn(message: string, context?: string): void
  error(message: string, context?: string): void
  debug(message: string, context?: string): void
}
