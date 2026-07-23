import type { DiagnosticRequestDTO } from "../../dto/diagnostic.request.dto.js";
import { WorkflowStep } from "../../../../domain/diagnostic/enums/workflow-step.enum.js";

export interface ISystemHandler {

    supports(step: WorkflowStep): boolean;

    execute(dto: DiagnosticRequestDTO): Promise<void>;

}