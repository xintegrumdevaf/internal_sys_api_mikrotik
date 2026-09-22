import { WorkflowStep } from "../../../../domain/diagnostic/enums/workflow-step.enum.js";
import { Logger } from "../../../../shared/utils/logger.js";
import type { IWorkflowHandler } from "../interfaces/iworkflow.handler.js";
import type { WorkflowContext } from "../workflow.context.js";

export class TransferSupportHandler implements IWorkflowHandler {

    supports(context: WorkflowContext): boolean {
        return context.session.currentStep === WorkflowStep.TRANSFER_SUPPORT;
    }

    async execute(context: WorkflowContext): Promise<void> {
        Logger.info(`[TransferSupportHandler] Derivando a soporte técnico humano para conversación ${context.session.conversationId}`);

        context.complete(
            "Te hemos derivado con el equipo de soporte técnico especializado. Un asesor tomará tu caso a la brevedad para continuar con tu atención."
        );
    }

}
