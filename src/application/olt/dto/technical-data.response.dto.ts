import type { ProfileType } from "../../../domain/olt/enums/profile.enum.js";
import type { CommandHistory } from "../../../infrastructure/session/command-history.js";
import type { MacInfo, Onu, OnuState } from "../../../shared/types/onu.js";

export interface TechnicalDataResponseDTO {

    profile: ProfileType;

    onu: Onu;

    state: OnuState;

    power?: number | null;

    mac?: MacInfo;

    // _history: CommandHistory[]

    // failedStep: string | null

}
