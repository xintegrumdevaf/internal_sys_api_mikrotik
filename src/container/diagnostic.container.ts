import { MacAnalyzer } from "../application/diagnostic/analyzers/mac.analyzer.js"
import { PowerAnalyzer } from "../application/diagnostic/analyzers/power.analyzer.js"
import { RunStateAnalyzer } from "../application/diagnostic/analyzers/run-state.analyzer.js"
import { DiagnosticEngine } from "../application/diagnostic/services/diagnostic.engine.js"
import { ContinueDiagnosticUseCase } from "../application/diagnostic/use-cases/continue-diagnostic.use-case.js"
import { StartDiagnosticUseCase } from "../application/diagnostic/use-cases/start-diagnostic.use-case.js"
import { AskLedStatusHandler } from "../application/diagnostic/workflow/handlers/ask-led-status.handler.js"
import { WorkflowEngine } from "../application/diagnostic/workflow/workflow.engine.js"
import { CollectTechnicalDataUseCase } from "../application/olt/use-cases/collect-technical-data.use-case.js"
import { PrismaDiagnosticSessionAdapter } from "../infrastructure/db/prisma/prisma-diagnostic-session-adapter.js"
import { OltConnectionManager } from "../infrastructure/olt/connection/olt-connection-manager.js"
import { DiagnosticController } from "../presentation/controllers/diagnostic.controller.js"

const connectionManager =
    new OltConnectionManager()

const collectTechnicalData =
    new CollectTechnicalDataUseCase(
        connectionManager
    )

/* ANALYZERS */

const runStateAnalyzer =
    new RunStateAnalyzer()

const powerAnalyzer =
    new PowerAnalyzer()

const macAnalyzer =
    new MacAnalyzer()

const analyzers = [

    runStateAnalyzer,

    powerAnalyzer,

    macAnalyzer

]

const diagnosticEngine =
    new DiagnosticEngine(
        analyzers
    )

const diagnosticRepository = new PrismaDiagnosticSessionAdapter()

const startDiagnostic =
    new StartDiagnosticUseCase(

        collectTechnicalData,

        diagnosticEngine,

        diagnosticRepository

    )


const onuLedHandler = new AskLedStatusHandler()

const workflowEngine = new WorkflowEngine([onuLedHandler])

const continueDiagnostic = new ContinueDiagnosticUseCase(diagnosticRepository, workflowEngine)

export const diagnosticController = new DiagnosticController(startDiagnostic, continueDiagnostic)