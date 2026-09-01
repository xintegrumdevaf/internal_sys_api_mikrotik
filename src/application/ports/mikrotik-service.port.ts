import type { MikrotikClientQueueResponseDTO } from "../mikrotik/dto/mikrotik-client-queue.response.dto.js"
import type { MikrotikActionResultResponseDTO } from "../mikrotik/dto/mikrotik-action-result.response.dto.js"
import type { MikrotikClientStatusResponseDTO } from "../mikrotik/dto/mikrotik-client-status.response.dto.js"

export interface MikrotikServicePort {
  getClientStatus(sector: string, ip: string): Promise<MikrotikClientStatusResponseDTO>
  getClientQueue(sector: string, ip: string): Promise<MikrotikClientQueueResponseDTO>
  reactivateClient(sector: string, ip: string): Promise<MikrotikActionResultResponseDTO>
  cutClient(sector: string, ip: string, comment?: string): Promise<MikrotikActionResultResponseDTO>
}
