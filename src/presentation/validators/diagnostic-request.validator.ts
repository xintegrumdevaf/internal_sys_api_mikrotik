import { ValidationError } from "./validation-error.js"

export interface DiagnosticRequestValidation {
  sector: string
  olt_name: string
  pon: string
  serial: string
}

export function validateDiagnosticRequest(body: unknown): DiagnosticRequestValidation {
  const errors: string[] = []
  const data = body as Record<string, unknown>

  if (!data.sector || typeof data.sector !== "string" || data.sector.trim() === "") {
    errors.push("sector")
  }
  if (!data.olt_name || typeof data.olt_name !== "string" || data.olt_name.trim() === "") {
    errors.push("olt_name")
  }
  if (!data.pon || typeof data.pon !== "string" || data.pon.trim() === "") {
    errors.push("pon")
  }
  if (!data.serial || typeof data.serial !== "string" || data.serial.trim() === "") {
    errors.push("serial")
  }

  if (errors.length > 0) {
    throw new ValidationError(errors)
  }

  return data as unknown as DiagnosticRequestValidation
}
