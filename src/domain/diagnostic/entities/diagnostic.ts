import type { DiagnosticStatus } from "../enums/diagnostic.status.js";
import type { DiagnosticAction } from "./diagnostic.action.js";
import type { DiagnosticFinding } from "./diagnostic.finding.js";

export interface Diagnostic {

    status: DiagnosticStatus;

    findings: DiagnosticFinding[];

    actions: DiagnosticAction[];

}