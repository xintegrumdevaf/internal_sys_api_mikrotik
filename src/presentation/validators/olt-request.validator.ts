import { ValidationError } from "./validation-error.js"

export interface OltRequestValidation {
  sector: string
  oltName: string
  pon: string
  serial: string
}

export function validateOltRequest(body: unknown): OltRequestValidation {
  const errors: string[] = []
  const data = body as Record<string, unknown>

  if (!data.sector || typeof data.sector !== "string" || data.sector.trim() === "") {
    errors.push("sector")
  }
  if (!data.oltName || typeof data.oltName !== "string" || data.oltName.trim() === "") {
    errors.push("oltName")
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

  return data as unknown as OltRequestValidation
}
