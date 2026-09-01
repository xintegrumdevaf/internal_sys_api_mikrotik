import type { Brand } from "../../../domain/olt/enums/brand.enum.js"
import type { DeviceAdministrativeStatus } from "../../../domain/olt/enums/device-administrative-status.enum.js"
import type { DeviceOperationalStatus } from "../../../domain/olt/enums/device-operational-status.enum.js"
import type { CommandHistory } from "../../../infrastructure/olt/session/command-history.js"

export interface DeviceStatusResponseDTO {
  brand: Brand
  serial: string
  pon: string
  ontId: number | string | null
  administrativeStatus: DeviceAdministrativeStatus
  operationalStatus: DeviceOperationalStatus
  opticalPower: number | null
  mac: string | null
  controlFlag: string | null
  rawRunState: string | null
  canBeReactivated: boolean
  reason: string | null
  recommendation: string
  _history?: CommandHistory[]
  failedStep?: string | null
}
