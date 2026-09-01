import type { MikrotikClientStatus } from "../../../domain/mikrotik/enums/mikrotik-client-status.enum.js"

export interface MikrotikActionResultResponseDTO {
  sector: string
  ip: string
  success: boolean
  previousStatus: MikrotikClientStatus
  currentStatus: MikrotikClientStatus
  message: string
  executedAt: string
}
