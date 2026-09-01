import type { Brand } from "../../../domain/olt/enums/brand.enum.js"
import type { DeviceAdministrativeStatus } from "../../../domain/olt/enums/device-administrative-status.enum.js"
import type { CommandHistory } from "../../../infrastructure/olt/session/command-history.js"

export interface ReactivateDeviceResponseDTO {
  serial: string
  brand: Brand
  pon: string
  success: boolean
  previousStatus: DeviceAdministrativeStatus
  currentStatus: DeviceAdministrativeStatus
  message: string
  executedAt: string
  _history?: CommandHistory[]
}
