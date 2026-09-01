import { DomainError } from "../../../shared/errors/domain-error.js"

export class DeviceNotFoundError extends DomainError {
  constructor(serial: string, pon?: string) {
    super(
      "DEVICE_NOT_FOUND",
      pon
        ? `El equipo con serial ${serial} en PON ${pon} no fue encontrado.`
        : `El equipo con serial ${serial} no fue encontrado.`
    )
  }
}
