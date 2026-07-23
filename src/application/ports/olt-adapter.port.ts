import type { TechnicalDataResponseDTO } from "../olt/dto/technical-data.response.dto.js"

export interface OltAdapterPort {
  showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO>
  setupUserDevice(pon: string, serial: string): Promise<void>
  rebootOnt(serial: string): Promise<void>
  deleteOnt(serial: string): Promise<void>
}
