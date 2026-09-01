import type { Brand } from "../enums/brand.enum.js"
import type { DeviceAdministrativeStatus } from "../enums/device-administrative-status.enum.js"

export interface ReactivationResult {
  serial: string
  brand: Brand
  pon: string
  success: boolean
  previousStatus: DeviceAdministrativeStatus
  currentStatus: DeviceAdministrativeStatus
  message: string
  executedAt: Date
}
