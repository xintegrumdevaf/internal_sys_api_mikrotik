import type { DeviceStatusResponseDTO } from "../olt/dto/device-status.response.dto.js"
import type { ReactivateDeviceResponseDTO } from "../olt/dto/reactivate-device.response.dto.js"
import type { TechnicalDataResponseDTO } from "../olt/dto/technical-data.response.dto.js"

export interface OltAdapterPort {
  showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO>
  getDeviceStatus(pon: string, serial: string): Promise<DeviceStatusResponseDTO>
  reactivateOnt(pon: string, serial: string): Promise<ReactivateDeviceResponseDTO>
  setupUserDevice(pon: string, serial: string): Promise<void>
  rebootOnt(serial: string): Promise<void>
  deleteOnt(serial: string): Promise<void>
}

