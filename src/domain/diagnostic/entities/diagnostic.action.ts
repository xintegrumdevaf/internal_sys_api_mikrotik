import type { ActionType } from "../enums/action.type.js";

export interface DiagnosticAction {

    type: ActionType;

    priority: number;

    // stopExecution: boolean;

}