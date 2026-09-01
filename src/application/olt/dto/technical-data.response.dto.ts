import type { OnuState } from "../../../domain/olt/entities/onu-state.entity.js"
import type { Onu } from "../../../domain/olt/entities/onu.entity.js"
import type { Brand } from "../../../domain/olt/enums/brand.enum.js"
import type { CommandHistory } from "../../../infrastructure/olt/session/command-history.js"

export interface TechnicalDataResponseDTO {
  brand: Brand
  onu: Onu | null
  state: OnuState | null
  power?: number | null | undefined
  mac?: string | null | undefined
  _history: CommandHistory[]
  failedStep: string | null
  error?: string | null | undefined
}
