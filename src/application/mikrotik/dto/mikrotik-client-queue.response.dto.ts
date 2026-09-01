export interface MikrotikClientQueueResponseDTO {
  sector: string
  ip: string
  found: boolean
  name: string | null
  contractId: string | null
  clientName: string | null
  target: string | null
  maxLimit: string | null
  uploadLimit: string | null
  downloadLimit: string | null
  disabled: boolean
  dynamic: boolean
  invalid: boolean
  rawOutput?: string
}
