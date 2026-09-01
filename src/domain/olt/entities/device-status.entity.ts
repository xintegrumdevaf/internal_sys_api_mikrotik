import type { Brand } from "../enums/brand.enum.js"
import type { DeviceAdministrativeStatus } from "../enums/device-administrative-status.enum.js"
import type { DeviceOperationalStatus } from "../enums/device-operational-status.enum.js"

export interface DeviceStatus {
  serial: string
  brand: Brand
  pon: string
  ontId?: number | string | null
  administrativeStatus: DeviceAdministrativeStatus
  operationalStatus: DeviceOperationalStatus
  opticalPower?: number | null
  mac?: string | null
  controlFlag?: string | null
  rawRunState?: string | null
  canBeReactivated: boolean
  reason?: string | null
  recommendation: string
}
