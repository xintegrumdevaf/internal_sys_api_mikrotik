
import { WorkflowStep } from "../../../../domain/diagnostic/enums/workflow-step.enum.js";
import type { IWorkflowHandler } from "../interfaces/iworkflow.handler.js";
import type { WorkflowContext } from "../workflow.context.js";


export class AskLedStatusHandler
    implements IWorkflowHandler {


    supports(context: WorkflowContext) {

        return (
            context.session.currentStep ===
            WorkflowStep.ASK_LED_STATUS
        );

    }



    async execute(context: WorkflowContext) {


        const msg =
            context.message.toLowerCase();



        if (
            msg.includes("sin luces") ||
            msg.includes("apagado") ||
            msg.includes("ninguna luz")
        ) {

            context.waitUser(

                WorkflowStep.VERIFY_POWER,

                "Verifique que el equipo esté conectado a la corriente y presione el botón de encendido si está apagado. Espere unos minutos y confirme si las luces aparecen."

            );


            return;

        }



        if (
            msg.includes("roja") ||
            msg.includes("rojo")
        ) {

            context.waitSystem(

                WorkflowStep.SCHEDULE_VISIT,

                "Se detectó una posible falla física del equipo. Vamos a coordinar una revisión técnica."

            );


            return;

        }



        if (
            msg.includes("verde") ||
            msg.includes("todas verdes")
        ) {


            context.waitSystem(

                WorkflowStep.RECHECK,

                "Vamos a validar nuevamente el estado del equipo."

            );


            return;

        }



        context.waitUser(

            WorkflowStep.ASK_LED_STATUS,

            "Indíquenos si el equipo tiene luces encendidas y qué color muestra cada una."

        );


    }

}