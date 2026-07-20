import type { DiagnosticWorkflow } from "../../../domain/diagnostic/entities/diagnostic-workflow.js";
import type { Diagnostic } from "../../../domain/diagnostic/entities/diagnostic.js";
import type { DiagnosticMessage } from "../../../domain/diagnostic/value-objects/diagnostic.message.js";
import type { TechnicalDataResponseDTO } from "../../olt/dto/technical-data.response.dto.js";

export interface DiagnosticResponseDTO {

    success: boolean;

    diagnostic: Diagnostic;

    workflow: DiagnosticWorkflow;

    technical: TechnicalDataResponseDTO;

    instruction: string | null

    // messages: DiagnosticMessage[];

}