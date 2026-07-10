import { MacAnalyzer } from "../application/diagnostic/analyzers/mac.analyzer.js"
import { PowerAnalyzer } from "../application/diagnostic/analyzers/power.analyzer.js"
import { RunStateAnalyzer } from "../application/diagnostic/analyzers/run-state.analyzer.js"
import { DiagnosticEngine } from "../application/diagnostic/services/diagnostic.engine.js"
import { ExecuteDiagnosticUseCase } from "../application/diagnostic/use-cases/execute-diagnostic.use-case.js"
import { CollectTechnicalDataUseCase } from "../application/olt/use-cases/collect-technical-data.use-case.js"
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

const executeDiagnostic =
    new ExecuteDiagnosticUseCase(

        collectTechnicalData,

        diagnosticEngine

    )

export const diagnosticController = new DiagnosticController(executeDiagnostic)