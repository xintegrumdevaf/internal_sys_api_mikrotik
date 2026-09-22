import { WorkflowStep } from "../../../../domain/diagnostic/enums/workflow-step.enum.js";
import { Logger } from "../../../../shared/utils/logger.js";
import type { IWorkflowHandler } from "../interfaces/iworkflow.handler.js";
import type { WorkflowContext } from "../workflow.context.js";

export class VerifyPowerHandler implements IWorkflowHandler {

    supports(context: WorkflowContext): boolean {
        return context.session.currentStep === WorkflowStep.VERIFY_POWER;
    }

    async execute(context: WorkflowContext): Promise<void> {
        const msg = context.message.toLowerCase();
        Logger.info(`[VerifyPowerHandler] Procesando respuesta de verificación de corriente: "${msg}"`);

        // Caso 1: Falla óptica explícita reportada (luz roja)
        if (msg.includes("roja") || msg.includes("rojo")) {
            context.waitSystem(
                WorkflowStep.SCHEDULE_VISIT,
                "Se detectó luz roja en el equipo tras encenderlo, lo que indica pérdida de señal óptica. Vamos a coordinar una visita técnica."
            );
            return;
        }

        // Caso 2: El equipo continúa apagado o sin corriente
        if (
            msg.includes("sigue apagado") ||
            msg.includes("no prende") ||
            msg.includes("no encendió") ||
            msg.includes("no enciende") ||
            msg.includes("sigue sin luces") ||
            msg.includes("no hay luces") ||
            msg.includes("sigue igual") ||
            msg.includes("apagado") ||
            msg.includes("no funcionó") ||
            msg.includes("no funciona")
        ) {
            context.waitUser(
                WorkflowStep.SCHEDULE_VISIT,
                "Entendido. Dado que el equipo continúa sin encender tras revisar la alimentación, coordinaremos una visita técnica para revisar la fuente o el dispositivo en tu domicilio."
            );
            return;
        }

        // Caso 3: El equipo encendió o muestra luces -> Se dispara re-diagnóstico automático
        if (
            msg.includes("prendió") ||
            msg.includes("prendio") ||
            msg.includes("encendió") ||
            msg.includes("encendio") ||
            msg.includes("ya encendio") ||
            msg.includes("ya prendió") ||
            msg.includes("ya tiene luces") ||
            msg.includes("verde") ||
            msg.includes("verdes") ||
            msg.includes("luz") ||
            msg.includes("luces") ||
            msg.includes("ya") ||
            msg.includes("listo")
        ) {
            context.waitSystem(
                WorkflowStep.RECHECK,
                "Excelente, estamos validando nuevamente la sincronización del equipo en la red."
            );
            return;
        }

        // Caso 4: Respuesta ambigua
        context.waitUser(
            WorkflowStep.VERIFY_POWER,
            "Por favor indícanos si tras verificar el enchufe y presionar el botón de encendido el equipo encendió alguna luz o continúa apagado."
        );
    }

}
