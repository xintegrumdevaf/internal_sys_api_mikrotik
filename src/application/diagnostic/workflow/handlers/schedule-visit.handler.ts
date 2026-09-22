import { WorkflowStep } from "../../../../domain/diagnostic/enums/workflow-step.enum.js";
import { Logger } from "../../../../shared/utils/logger.js";
import type { IWorkflowHandler } from "../interfaces/iworkflow.handler.js";
import type { WorkflowContext } from "../workflow.context.js";

export class ScheduleVisitHandler implements IWorkflowHandler {

    supports(context: WorkflowContext): boolean {
        return context.session.currentStep === WorkflowStep.SCHEDULE_VISIT;
    }

    async execute(context: WorkflowContext): Promise<void> {
        Logger.info(`[ScheduleVisitHandler] Registrando visita técnica para conversación ${context.session.conversationId}`);

        context.complete(
            "Hemos registrado la solicitud de visita técnica para tu domicilio. Un asesor del área técnica se comunicará a la brevedad para coordinar el día y horario de la revisión."
        );
    }

}
