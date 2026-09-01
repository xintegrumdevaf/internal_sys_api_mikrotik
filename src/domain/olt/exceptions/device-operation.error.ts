import { DomainError } from "../../../shared/errors/domain-error.js"

export class DeviceOperationError extends DomainError {
  constructor(operation: string, reason: string) {
    super("DEVICE_OPERATION_FAILED", `No se pudo completar la operación '${operation}': ${reason}`)
  }
}
