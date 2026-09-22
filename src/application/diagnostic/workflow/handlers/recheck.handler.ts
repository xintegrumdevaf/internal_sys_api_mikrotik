import { DiagnosticStatus } from "../../../../domain/diagnostic/enums/diagnostic.status.js";
import { WorkflowStep } from "../../../../domain/diagnostic/enums/workflow-step.enum.js";
import { Logger } from "../../../../shared/utils/logger.js";
import type { CollectTechnicalDataUseCase } from "../../../olt/use-cases/collect-technical-data.use-case.js";
import type { DiagnosticRequestDTO } from "../../dto/diagnostic.request.dto.js";
import type { DiagnosticEngine } from "../../services/diagnostic.engine.js";
import type { IWorkflowHandler } from "../interfaces/iworkflow.handler.js";
import type { WorkflowContext } from "../workflow.context.js";

export class RecheckHandler implements IWorkflowHandler {

    constructor(
        private readonly collectTechnicalData: CollectTechnicalDataUseCase,
        private readonly diagnosticEngine: DiagnosticEngine
    ) { }

    supports(context: WorkflowContext): boolean {
        return context.session.currentStep === WorkflowStep.RECHECK;
    }

    async execute(context: WorkflowContext): Promise<void> {
        const sessionContext = context.session.context as Record<string, unknown>;
        const request = sessionContext.request as DiagnosticRequestDTO | undefined;

        if (!request) {
            Logger.warn("[RecheckHandler] No se encontraron parámetros de request en la sesión para re-diagnóstico.");
            context.waitUser(
                WorkflowStep.TRANSFER_SUPPORT,
                "No fue posible recuperar los datos del equipo para la re-validación técnica. Te derivamos con un asesor para continuar."
            );
            return;
        }

        Logger.info(`[RecheckHandler] Re-evaluando equipo ${request.serial} en sector ${request.sector}...`);

        try {
            const technicalData = await this.collectTechnicalData.execute(request);
            const diagnostic = await this.diagnosticEngine.execute(technicalData);

            // Actualizar la sesión con la nueva telemetría
            context.session.context = {
                ...sessionContext,
                technical: {
                    brand: diagnostic.technical.brand,
                    onu: diagnostic.technical.onu,
                    state: diagnostic.technical.state,
                    power: diagnostic.technical.power ?? null,
                    mac: diagnostic.technical.mac ?? null,
                    failedStep: diagnostic.technical.failedStep,
                    error: diagnostic.technical.error ?? null
                },
                findings: diagnostic.findings,
                actions: diagnostic.actions,
                diagnosticStatus: diagnostic.status
            };

            if (diagnostic.status === DiagnosticStatus.SUCCESS) {
                Logger.info(`[RecheckHandler] Diagnóstico resuelto con éxito para ${request.serial}.`);
                context.complete(
                    "¡Excelente noticia! Comprobamos nuevamente tu equipo en la red y el servicio ya se encuentra restablecido y operando con normalidad."
                );
            } else {
                Logger.warn(`[RecheckHandler] El equipo ${request.serial} continúa con falla (Estado: ${diagnostic.status}).`);
                context.waitUser(
                    WorkflowStep.SCHEDULE_VISIT,
                    "Comprobamos nuevamente el estado del equipo en la red pero aún no sincroniza de forma óptima. Vamos a coordinar una visita técnica para revisar la instalación física."
                );
            }
        } catch (error) {
            Logger.error(`[RecheckHandler] Error consultando OLT en recheck: ${error instanceof Error ? error.message : String(error)}`);
            context.waitUser(
                WorkflowStep.TRANSFER_SUPPORT,
                "Ocurrió un inconveniente temporal al consultar la red para re-validar tu servicio. Te derivamos con un asesor para asistirte."
            );
        }
    }

}
