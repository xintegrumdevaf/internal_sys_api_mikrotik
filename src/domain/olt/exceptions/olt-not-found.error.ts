import { DomainError } from "../../../shared/errors/domain-error.js"

export class OltNotFoundError extends DomainError {
  constructor(oltName: string, sector: string) {
    super("OLT_NOT_FOUND", `OLT ${oltName} no existe en ${sector}`)
  }
}
