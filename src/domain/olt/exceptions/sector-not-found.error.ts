import { DomainError } from "../../../shared/errors/domain-error.js"

export class SectorNotFoundError extends DomainError {
  constructor(sector: string) {
    super("SECTOR_NOT_FOUND", `Sector ${sector} no existe`)
  }
}
