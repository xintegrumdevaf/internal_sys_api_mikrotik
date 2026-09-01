import type { GetMikrotikClientQueueUseCase } from "../../application/mikrotik/use-cases/get-mikrotik-client-queue.use-case.js"
import type { Request, Response, NextFunction } from "express"
import type { GetMikrotikClientStatusUseCase } from "../../application/mikrotik/use-cases/get-mikrotik-client-status.use-case.js"
import type { ReactivateMikrotikClientUseCase } from "../../application/mikrotik/use-cases/reactivate-mikrotik-client.use-case.js"
import type { CutMikrotikClientUseCase } from "../../application/mikrotik/use-cases/cut-mikrotik-client.use-case.js"
import { Logger } from "../../shared/utils/logger.js"
import { validateMikrotikRequest } from "../validators/mikrotik-request.validator.js"

export class MikrotikController {
  constructor(
    private readonly getClientStatusUseCase: GetMikrotikClientStatusUseCase,
    private readonly getClientQueueUseCase: GetMikrotikClientQueueUseCase,
    private readonly reactivateClientUseCase: ReactivateMikrotikClientUseCase,
    private readonly cutClientUseCase: CutMikrotikClientUseCase
  ) {}

  
  getQueue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateMikrotikRequest(req.body)
      Logger.info(`[MikrotikController.getQueue] PAYLOAD: ${JSON.stringify(validBody)}`)
      const result = await this.getClientQueueUseCase.execute(validBody)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateMikrotikRequest(req.body)
      Logger.info(`[MikrotikController.getStatus] PAYLOAD: ${JSON.stringify(validBody)}`)
      const result = await this.getClientStatusUseCase.execute(validBody)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  reactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateMikrotikRequest(req.body)
      Logger.info(`[MikrotikController.reactivate] PAYLOAD: ${JSON.stringify(validBody)}`)
      const result = await this.reactivateClientUseCase.execute(validBody)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  cut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateMikrotikRequest(req.body)
      Logger.info(`[MikrotikController.cut] PAYLOAD: ${JSON.stringify(validBody)}`)
      const result = await this.cutClientUseCase.execute(validBody)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
