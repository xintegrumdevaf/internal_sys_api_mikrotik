import type { DiagnosticSession } from "../entities/diagnostic-session.js";

export interface DiagnosticSessionRepository {
    findByConversationId(conversationId: string): Promise<DiagnosticSession | null>

    save(session: DiagnosticSession): Promise<void>

    update(session: DiagnosticSession): Promise<void>
}