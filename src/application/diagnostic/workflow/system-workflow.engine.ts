import type { WorkflowStep } from "../../../domain/diagnostic/enums/workflow-step.enum.js";
import type { DiagnosticRequestDTO } from "../dto/diagnostic.request.dto.js";
import type { ISystemHandler } from "./interfaces/isystem.handler copy.js";

export class SystemWorkflowEngine {

    constructor(
        private readonly handlers: ISystemHandler[]
    ) { }

    async execute(
        step: WorkflowStep | null,
        dto: DiagnosticRequestDTO
    ): Promise<void> {

        if (!step) {
            return;
        }

        const handler = this.handlers.find(h => h.supports(step));

        if (!handler) {
            throw new Error(`System handler not found for step '${step}'`);
        }

        await handler.execute(dto);
    }

}