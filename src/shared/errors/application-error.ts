export abstract class ApplicationError extends Error {
  public readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "ApplicationError"
    this.code = code
  }
}
