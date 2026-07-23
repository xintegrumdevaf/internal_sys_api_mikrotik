import { DomainError } from "../../../shared/errors/domain-error.js"

export class SessionNotFoundError extends DomainError {
  constructor(conversationId: string) {
    super("SESSION_NOT_FOUND", `Sesión ${conversationId} no encontrada`)
  }
}
