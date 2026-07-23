import type { Request, Response, NextFunction } from "express"
import type { CollectTechnicalDataUseCase } from "../../application/olt/use-cases/collect-technical-data.use-case.js"
import { Logger } from "../../shared/utils/logger.js"
import { validateOltRequest } from "../validators/olt-request.validator.js"

export class OltController {
  constructor(private readonly collectTechnicalData: CollectTechnicalDataUseCase) { }

  collectData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateOltRequest(req.body)
      Logger.info(`PAYLOAD: ${JSON.stringify(validBody)}`)
      const result = await this.collectTechnicalData.execute(validBody)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
