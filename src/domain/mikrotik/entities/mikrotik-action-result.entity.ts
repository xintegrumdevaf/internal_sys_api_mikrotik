import type { MikrotikClientStatus } from "../enums/mikrotik-client-status.enum.js"

export interface MikrotikActionResultEntity {
  sector: string
  ip: string
  success: boolean
  previousStatus: MikrotikClientStatus
  currentStatus: MikrotikClientStatus
  message: string
  executedAt: Date
}
