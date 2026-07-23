import { CollectTechnicalDataUseCase } from "../application/olt/use-cases/collect-technical-data.use-case.js"
import { SetupUserDeviceUseCase } from "../application/olt/use-cases/setup-user-device.use-case.js"
import { MacAnalyzer } from "../application/diagnostic/analyzers/mac.analyzer.js"
import { OnuAnalyzer } from "../application/diagnostic/analyzers/onu.analyzer.js"
import { PowerAnalyzer } from "../application/diagnostic/analyzers/power.analyzer.js"
import { RunStateAnalyzer } from "../application/diagnostic/analyzers/run-state.analyzer.js"
import { DiagnosticEngine } from "../application/diagnostic/services/diagnostic.engine.js"
import { ContinueDiagnosticUseCase } from "../application/diagnostic/use-cases/continue-diagnostic.use-case.js"
import { StartDiagnosticUseCase } from "../application/diagnostic/use-cases/start-diagnostic.use-case.js"
import { AskLedStatusHandler } from "../application/diagnostic/workflow/handlers/ask-led-status.handler.js"
import { OnuNotAvailableHandler } from "../application/diagnostic/workflow/handlers/onu-not-available.handler.js"
import { SystemWorkflowEngine } from "../application/diagnostic/workflow/system-workflow.engine.js"
import { WorkflowEngine } from "../application/diagnostic/workflow/workflow.engine.js"
import { PrismaDiagnosticSessionAdapter } from "../infrastructure/db/prisma/prisma-diagnostic-session-adapter.js"
import { OltConnectionManager } from "../infrastructure/olt/connection/olt-connection-manager.js"
import { DiagnosticController } from "../presentation/controllers/diagnostic.controller.js"
import { OltController } from "../presentation/controllers/olt.controller.js"

const connectionManager = new OltConnectionManager()

const collectTechnicalData = new CollectTechnicalDataUseCase(connectionManager)
const setupUserDeviceUseCase = new SetupUserDeviceUseCase(connectionManager)

const onuAnalyzer = new OnuAnalyzer()
const runStateAnalyzer = new RunStateAnalyzer()
const powerAnalyzer = new PowerAnalyzer()
const macAnalyzer = new MacAnalyzer()
const analyzers = [onuAnalyzer, runStateAnalyzer, powerAnalyzer, macAnalyzer]
const diagnosticEngine = new DiagnosticEngine(analyzers)

const diagnosticRepository = new PrismaDiagnosticSessionAdapter()
const onuNotAvailableHandler = new OnuNotAvailableHandler(setupUserDeviceUseCase)
const systemWorkflowEngine = new SystemWorkflowEngine([onuNotAvailableHandler])

const startDiagnostic = new StartDiagnosticUseCase(
  collectTechnicalData,
  diagnosticEngine,
  diagnosticRepository,
  systemWorkflowEngine
)

const onuLedHandler = new AskLedStatusHandler()
const workflowEngine = new WorkflowEngine([onuLedHandler])
const continueDiagnostic = new ContinueDiagnosticUseCase(diagnosticRepository, workflowEngine)

export const oltController = new OltController(collectTechnicalData)
export const diagnosticController = new DiagnosticController(startDiagnostic, continueDiagnostic)
