import type { LoggerPort } from "../../application/ports/logger.port.js"

export class Logger implements LoggerPort {
  private static reset = "\x1b[0m"
  private static colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    warn: "\x1b[33m",
    error: "\x1b[31m",
    debug: "\x1b[35m"
  }

  private static format(level: keyof typeof Logger.colors, message: string, context?: string) {
    const color = Logger.colors[level]
    const time = new Date().toISOString()
    const ctx = context ? `[${context}]` : ""
    return `${color}[${level.toUpperCase()}] ${time} ${ctx} ${message}${Logger.reset}`
  }

  info(message: string, context?: string): void {
    Logger.info(message, context)
  }

  success(message: string, context?: string): void {
    Logger.success(message, context)
  }

  warn(message: string, context?: string): void {
    Logger.warn(message, context)
  }

  error(message: string, context?: string): void {
    Logger.error(message, context)
  }

  debug(message: string, context?: string): void {
    Logger.debug(message, context)
  }

  static info(message: string, context?: string) {
    console.log(this.format("info", message, context))
  }

  static success(message: string, context?: string) {
    console.log(this.format("success", message, context))
  }

  static warn(message: string, context?: string) {
    console.log(this.format("warn", message, context))
  }

  static error(message: string, context?: string) {
    console.log(this.format("error", message, context))
  }

  static debug(message: string, context?: string) {
    if (process.env.DEBUG === "true") {
      console.log(this.format("debug", message, context))
    }
  }
}
