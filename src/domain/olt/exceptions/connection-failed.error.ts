import { DomainError } from "../../../shared/errors/domain-error.js"

export class ConnectionFailedError extends DomainError {
  constructor(host: string, cause?: string) {
    super("CONNECTION_FAILED", `Conexión fallida a ${host}${cause ? `: ${cause}` : ""}`)
  }
}
