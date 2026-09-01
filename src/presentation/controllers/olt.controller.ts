import type { Request, Response, NextFunction } from "express"
import type { CollectTechnicalDataUseCase } from "../../application/olt/use-cases/collect-technical-data.use-case.js"
import type { GetDeviceStatusUseCase } from "../../application/olt/use-cases/get-device-status.use-case.js"
import type { ReactivateDeviceUseCase } from "../../application/olt/use-cases/reactivate-device.use-case.js"
import { Logger } from "../../shared/utils/logger.js"
import { validateOltRequest } from "../validators/olt-request.validator.js"

export class OltController {
  constructor(
    private readonly collectTechnicalData: CollectTechnicalDataUseCase,
    private readonly getDeviceStatusUseCase: GetDeviceStatusUseCase,
    private readonly reactivateDeviceUseCase: ReactivateDeviceUseCase
  ) { }

  collectData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateOltRequest(req.body)
      Logger.info(`[OltController.collectData] PAYLOAD: ${JSON.stringify(validBody)}`)
      const result = await this.collectTechnicalData.execute(validBody)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateOltRequest(req.body)
      Logger.info(`[OltController.getStatus] PAYLOAD: ${JSON.stringify(validBody)}`)
      const result = await this.getDeviceStatusUseCase.execute(validBody)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  reactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateOltRequest(req.body)
      Logger.info(`[OltController.reactivate] PAYLOAD: ${JSON.stringify(validBody)}`)
      const result = await this.reactivateDeviceUseCase.execute(validBody)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}

