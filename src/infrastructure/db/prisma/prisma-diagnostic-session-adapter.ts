import type { InputJsonValue } from "@prisma/client/runtime/client";
import type { DiagnosticSession } from "../../../domain/diagnostic/entities/diagnostic-session.js";
import type { DiagnosticSessionRepository } from "../../../domain/diagnostic/repositories/diagnostic-session.repository.js";
import { prisma } from "./prisma-client.js";

export class PrismaDiagnosticSessionAdapter implements DiagnosticSessionRepository {
    async findByConversationId(conversationId: string): Promise<DiagnosticSession | null> {
        const session = await prisma.diagnosticSession.findUnique({
            where: { conversationId },
        });

        if (!session) {
            return null;
        }

        return {
            id: session.id,
            conversationId: session.conversationId,
            status: session.status,
            currentStep: session.currentStep,
            context: (session.context ?? {}) as Record<string, unknown>,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            expiresAt: session.expiresAt,
        };
    }

    async save(session: DiagnosticSession): Promise<void> {
        const { id, status, context, conversationId, createdAt, currentStep, expiresAt, updatedAt } = session
        await prisma.diagnosticSession.create({
            data: {
                id: id,
                conversationId: conversationId,
                status: status,
                context: context as InputJsonValue,
                createdAt: createdAt,
                currentStep: currentStep,
                expiresAt: expiresAt,
                updatedAt: updatedAt
            }
        })
    }

    async update(session: DiagnosticSession): Promise<void> {
        const { id, status, context, currentStep, updatedAt } = session
        await prisma.diagnosticSession.update({
            where: { conversationId: id }, data: {
                id: id,
                status: status,
                context: context as InputJsonValue,
                currentStep: currentStep,
                updatedAt: updatedAt
            }
        })
    }

}