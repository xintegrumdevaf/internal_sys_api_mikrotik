import type { DiagnosticSessionRepository } from "../../../domain/diagnostic/repositories/diagnostic-session.repository.js";
import type { ContinueDiagnosticDTO } from "../dto/continue-diagnostic.dto.js";
import { ContinueResponseMapper } from "../workflow/mappers/continue-response.mapper.js";
import { WorkflowContext } from "../workflow/workflow.context.js";
import type { WorkflowEngine } from "../workflow/workflow.engine.js";

export class ContinueDiagnosticUseCase {

    constructor(

        private readonly repository: DiagnosticSessionRepository,

        private readonly workflow: WorkflowEngine

    ) { }

    async execute(dto: ContinueDiagnosticDTO) {

        const session =
            await this.repository.findByConversationId(
                dto.conversationId
            );

        if (!session) {

            throw new Error("Diagnostic session not found");

        }

        const context = new WorkflowContext(

            session,

            dto.message

        );

        await this.workflow.execute(context);

        await this.repository.update(context.session);

        return ContinueResponseMapper.toResponse(context);

    }

}