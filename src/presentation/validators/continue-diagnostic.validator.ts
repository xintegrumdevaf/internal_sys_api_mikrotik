import { ValidationError } from "./validation-error.js"

export interface ContinueDiagnosticValidation {
  conversationId: string
  message: string
}

export function validateContinueDiagnostic(body: unknown): ContinueDiagnosticValidation {
  const errors: string[] = []
  const data = body as Record<string, unknown>

  if (!data.conversationId || typeof data.conversationId !== "string" || data.conversationId.trim() === "") {
    errors.push("conversationId")
  }
  if (!data.message || typeof data.message !== "string" || data.message.trim() === "") {
    errors.push("message")
  }

  if (errors.length > 0) {
    throw new ValidationError(errors)
  }

  return data as unknown as ContinueDiagnosticValidation
}
