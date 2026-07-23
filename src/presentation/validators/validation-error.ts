export class ValidationError extends Error {
  public readonly fields: string[]

  constructor(fields: string[]) {
    super("Faltan campos obligatorios")
    this.name = "ValidationError"
    this.fields = fields
  }
}
