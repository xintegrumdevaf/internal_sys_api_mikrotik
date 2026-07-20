import type { DiagnosticSessionRepository } from "../../../domain/diagnostic/repositories/diagnostic-session.repository.js";

export class GetDiagnosticSessionUseCase {
    constructor(private readonly repository: DiagnosticSessionRepository) { }

    async execute(conversationId: string) {
        return await this.repository.findByConversationId(conversationId)
    }
}