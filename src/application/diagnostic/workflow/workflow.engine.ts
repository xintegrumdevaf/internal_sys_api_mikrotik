import { WorkflowStatus } from "../../../domain/diagnostic/enums/workflow-status.enum.js";
import { WorkflowStep } from "../../../domain/diagnostic/enums/workflow-step.enum.js";
import { Logger } from "../../../shared/utils/logger.js";
import type { IWorkflowHandler } from "./interfaces/iworkflow.handler.js";
import type { WorkflowContext } from "./workflow.context.js";

export class WorkflowEngine {

    constructor(
        private readonly handlers: IWorkflowHandler[]
    ) { }

    async execute(context: WorkflowContext): Promise<void> {
        // 1. Manejo seguro de sesiones que ya concluyeron o expiraron
        if (context.session.status === WorkflowStatus.COMPLETED) {
            context.complete(
                "El diagnóstico para esta sesión ya ha finalizado. Si continuás con inconvenientes, por favor iniciá una nueva consulta."
            );
            return;
        }

        if (context.session.status === WorkflowStatus.FAILED) {
            context.fail(
                "Esta sesión de diagnóstico fue cerrada previamente por falla técnica. Te transferimos con un asesor para continuar."
            );
            return;
        }

        // 2. Búsqueda de handler especializado para el paso actual
        const handler = this.handlers.find(h => h.supports(context));

        if (handler) {
            await handler.execute(context);
            return;
        }

        // 3. Fallback / Resiliencia: si ningún handler atiende el estado o mensaje
        Logger.warn(
            `[WorkflowEngine] No se encontró handler para el paso '${context.session.currentStep}'. Aplicando fallback a TRANSFER_SUPPORT. Mensaje recibido: "${context.message}"`
        );

        context.waitUser(
            WorkflowStep.TRANSFER_SUPPORT,
            "No pudimos procesar la consulta en esta etapa. Te estamos derivando con un asesor técnico para ayudarte de forma personalizada."
        );
    }

}