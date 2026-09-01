import { ValidationError } from "./validation-error.js"

export interface MikrotikRequestValidation {
  sector: string
  ip: string
  comment?: string | undefined
}

export function validateMikrotikRequest(body: unknown): MikrotikRequestValidation {
  const errors: string[] = []
  const data = body as Record<string, unknown>

  if (!data || typeof data !== "object") {
    throw new ValidationError(["body"])
  }

  if (!data.sector || typeof data.sector !== "string" || data.sector.trim() === "") {
    errors.push("sector")
  }

  const ipRegex = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
  if (!data.ip || typeof data.ip !== "string" || !ipRegex.test(data.ip.trim())) {
    errors.push("ip (formato IPv4 válido requerido)")
  }

  if (errors.length > 0) {
    throw new ValidationError(errors)
  }

  const result: MikrotikRequestValidation = {
    sector: (data.sector as string).trim(),
    ip: (data.ip as string).trim()
  }

  if (typeof data.comment === "string" && data.comment.trim() !== "") {
    result.comment = data.comment.trim()
  }

  return result
}

