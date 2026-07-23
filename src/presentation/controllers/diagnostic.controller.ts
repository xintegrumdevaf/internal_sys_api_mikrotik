import type { Request, Response, NextFunction } from "express"
import type { ContinueDiagnosticUseCase } from "../../application/diagnostic/use-cases/continue-diagnostic.use-case.js"
import type { StartDiagnosticUseCase } from "../../application/diagnostic/use-cases/start-diagnostic.use-case.js"
import { Logger } from "../../shared/utils/logger.js"
import { validateDiagnosticRequest } from "../validators/diagnostic-request.validator.js"
import { validateContinueDiagnostic } from "../validators/continue-diagnostic.validator.js"

export class DiagnosticController {
  constructor(
    private readonly startDiagnostic: StartDiagnosticUseCase,
    private readonly continueDiagnostic: ContinueDiagnosticUseCase
  ) { }

  analyze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateDiagnosticRequest(req.body)
      Logger.info(`BODY: ${JSON.stringify(validBody)}`)
      const result = await this.startDiagnostic.execute(validBody)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  continue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validBody = validateContinueDiagnostic(req.body)
      Logger.info(`BODY: ${JSON.stringify(validBody)}`)
      const result = await this.continueDiagnostic.execute(validBody)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
