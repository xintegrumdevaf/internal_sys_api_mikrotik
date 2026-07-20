export interface DiagnosticSession {

    id: string;

    conversationId: string;

    status: string;

    currentStep: string | null;

    context: Record<string, unknown>;

    createdAt: Date;

    updatedAt: Date;

    expiresAt: Date | null;

}