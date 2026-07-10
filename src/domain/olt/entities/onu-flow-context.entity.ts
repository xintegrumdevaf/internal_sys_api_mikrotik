import type { Mac } from "./mac.entity.js";
import type { OnuRxPower } from "./onu-rx-power.entity.js";
import type { OnuState } from "./onu-state.entity.js";
import type { Onu } from "./onu.entity.js";

export interface OnuFlowContext {
    rows: Record<string, any>[];
    onu: Onu;
    state: OnuState;
    power?: OnuRxPower;
    mac?: Mac;
}