import type { MikrotikClientStatus } from "../../../domain/mikrotik/enums/mikrotik-client-status.enum.js"

export interface MikrotikClientStatusResponseDTO {
  sector: string
  ip: string
  status: MikrotikClientStatus
  clientName: string | null
  list: string | null
  creationTime: string | null
  canBeReactivated: boolean
  reason: string
  rawOutput?: string
}
