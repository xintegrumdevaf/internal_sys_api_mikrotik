import type { FindingType } from "../enums/finding.type.js";
import type { Severity } from "../enums/severity.js";

export interface DiagnosticFinding {

    type: FindingType;

    severity: Severity;

    description: string;

    stopExecution: boolean

}