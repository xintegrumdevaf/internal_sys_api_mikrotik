import { CollectTechnicalDataUseCase } from "../application/olt/use-cases/collect-technical-data.use-case.js";
import { OltConnectionManager } from "../infrastructure/olt/connection/olt-connection-manager.js";
import { OltController } from "../presentation/controllers/otl.controller.js";

const connectionManager = new OltConnectionManager()

export const collectTechnicalData = new CollectTechnicalDataUseCase(connectionManager)

export const oltController = new OltController(collectTechnicalData)