import { randomUUID } from "node:crypto";
import type { DiagnosticSession } from "../../../domain/diagnostic/entities/diagnostic-session.js";
import type { DiagnosticSessionRepository } from "../../../domain/diagnostic/repositories/diagnostic-session.repository.js";
import type { CollectTechnicalDataUseCase } from "../../olt/use-cases/collect-technical-data.use-case.js";
import type { DiagnosticRequestDTO } from "../dto/diagnostic.request.dto.js";
import type { DiagnosticEngine } from "../services/diagnostic.engine.js";
import type { DiagnosticResponseDTO } from "../dto/diagnostic.response.dto.js";
import { DiagnosticResponseMapper } from "../mappers/diagnostic-response.mapper.js";
import { WorkflowStatus } from "../../../domain/diagnostic/enums/workflow-status.enum.js";
import type { ISystemHandler } from "../workflow/interfaces/isystem.handler copy.js";
import type { SystemWorkflowEngine } from "../workflow/system-workflow.engine.js";

export class StartDiagnosticUseCase {
    constructor(
        private readonly collectTechnicalData:
            CollectTechnicalDataUseCase, private readonly diagnosticEngine: DiagnosticEngine, private readonly repository: DiagnosticSessionRepository, private readonly systemWorkflow: SystemWorkflowEngine
    ) { }

    async execute(dto: DiagnosticRequestDTO): Promise<DiagnosticResponseDTO> {
        // const technicalData = await this.collectTechnicalData.execute(dto)

        // const diagnostic = await this.diagnosticEngine.execute(technicalData)

        let technicalData = await this.collectTechnicalData.execute(dto);

        let diagnostic = await this.diagnosticEngine.execute(technicalData);

        while (
            diagnostic.workflow.status === WorkflowStatus.WAITING_SYSTEM
        ) {

            await this.systemWorkflow.execute(diagnostic?.workflow?.currentStep, dto);

            technicalData = await this.collectTechnicalData.execute(dto);

            diagnostic = await this.diagnosticEngine.execute(technicalData);

        }


        const now = new Date();

        const session: DiagnosticSession = {

            id: randomUUID(),

            conversationId: dto.conversationId,

            context: {
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

                instruction: diagnostic.instruction,

                workflow: diagnostic.workflow,

                diagnosticStatus: diagnostic.status,
            },

            currentStep: diagnostic.workflow.currentStep,

            status: diagnostic.workflow.status,

            createdAt: now,

            updatedAt: now,

            expiresAt: new Date(now.getTime() + 30 * 60 * 1000) // 30 minutos

        };

        // await this.repository.save(session)

        return DiagnosticResponseMapper.toResponse(diagnostic)
    }
}