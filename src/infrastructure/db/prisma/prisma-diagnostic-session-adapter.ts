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

  /**
   * Upsert por conversationId: un DIAGNOSTIC nuevo en la misma conversación
   * reemplaza el contexto/paso (reintentos, nuevo caso) en vez de fallar por UNIQUE.
   */
  async save(session: DiagnosticSession): Promise<void> {
    const { id, status, context, conversationId, createdAt, currentStep, expiresAt, updatedAt } =
      session;

    await prisma.diagnosticSession.upsert({
      where: { conversationId },
      create: {
        id,
        conversationId,
        status,
        context: context as InputJsonValue,
        createdAt,
        currentStep,
        expiresAt,
        updatedAt,
      },
      update: {
        status,
        context: context as InputJsonValue,
        currentStep,
        expiresAt,
        updatedAt,
      },
    });
  }

  async update(session: DiagnosticSession): Promise<void> {
    const { id, status, context, currentStep, updatedAt, expiresAt } = session;
    await prisma.diagnosticSession.update({
      where: { id },
      data: {
        status,
        context: context as InputJsonValue,
        currentStep,
        updatedAt,
        ...(expiresAt !== undefined ? { expiresAt } : {}),
      },
    });
  }
}
