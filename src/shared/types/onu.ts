import type { CommandHistory } from "../../infrastructure/session/command-history.js";
import type { OltGeneration } from "./olt.js";

export interface OnuState {

    adminState?: string;

    runState?: string;

    configState?: string;

    matchState?: string;

    omccState?: string;

    phaseState?: string;

}

export interface Onu {

    id: number;

    serial: string;

    frame?: number;

    slot?: number;

    pon?: number;

    model?: string;

    profile?: string;

}

export interface OnuResponse {

    profile: OltGeneration;

    onu: Onu;

    state: OnuState;

    power?: number | null;

    mac?: MacInfo;

    _history: CommandHistory[]

    failedStep: string | null

}

export interface OnuRxPower {
    onuIndex: string;
    rxPower: number;
    unit: string;
}

export interface MacInfo {

    mac: string;

    vlan?: number;

    port?: string;

}

export interface OnuFlowContext {
    rows: Record<string, any>[];
    onu: Onu;
    state: OnuState;
    power?: OnuRxPower;
    mac?: MacInfo;
}