import type { Mac } from "../../../domain/olt/entities/mac.entity.js";
import type { OnuState } from "../../../domain/olt/entities/onu-state.entity.js";
import type { Onu } from "../../../domain/olt/entities/onu.entity.js";
import type { Brand } from "../../../domain/olt/enums/brand.enum.js";
import type { CommandHistory } from "../../../infrastructure/olt/session/command-history.js";


export interface TechnicalDataResponseDTO {

    brand: Brand;

    onu: Onu;

    state: OnuState;

    power?: number | null;

    mac?: Mac;

    _history: CommandHistory[]

    failedStep: string | null

}
