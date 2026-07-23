import type { DiagnosticSessionRepository } from "../../../domain/diagnostic/repositories/diagnostic-session.repository.js";
import { Logger } from "../../../shared/utils/logger.js";
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

        Logger.info(`SESSION FOUNDED: ${JSON.stringify(session)}`)

        if (!session) {

            throw new Error("Diagnostic session not found");

        }

        const context = new WorkflowContext(

            session,

            dto.message

        );

        Logger.info(`CONTEXT FOUNDED: ${JSON.stringify(context)}`)

        await this.workflow.execute(context);

        const response = ContinueResponseMapper.toResponse(context);

        Logger.info(`RESPONSE: ${JSON.stringify(response)}`)

        await this.repository.update(context.session);

        return ContinueResponseMapper.toResponse(context);

    }

}