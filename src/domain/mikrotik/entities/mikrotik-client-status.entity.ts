import type { MikrotikClientStatus } from "../enums/mikrotik-client-status.enum.js"

export interface MikrotikClientStatusEntity {
  sector: string
  ip: string
  status: MikrotikClientStatus
  clientName?: string | null
  list?: string | null
  creationTime?: string | null
  canBeReactivated: boolean
  reason: string
}
