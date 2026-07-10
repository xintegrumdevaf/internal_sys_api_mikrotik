import type { ExecuteDiagnosticUseCase } from "../../application/diagnostic/use-cases/execute-diagnostic.use-case.js";
import { Logger } from "../../shared/utils/logger.js";

export class DiagnosticController {
    constructor(private readonly executeDiagnostic: ExecuteDiagnosticUseCase) { }

    performDiagnostic = async (req: any, res: any, next: any) => {

        // const { serial, pon, sector, olt_name } = req.body || {}

        Logger.info(`BODY: ${JSON.stringify(req.body)}`)

        try {
            const result = await this.executeDiagnostic.execute(req.body)
            return res.status(200).json(result)

        } catch (error) {
            next(error)
        }
    }
}