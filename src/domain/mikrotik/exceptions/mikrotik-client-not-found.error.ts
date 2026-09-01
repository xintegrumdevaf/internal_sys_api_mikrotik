import { DomainError } from "../../../shared/errors/domain-error.js"

export class MikrotikClientNotFoundError extends DomainError {
  constructor(ip: string, sector: string) {
    super(
      "MIKROTIK_CLIENT_NOT_FOUND",
      `No se encontró ningún registro en el firewall para la IP ${ip} en el sector ${sector}.`
    )
  }
}
