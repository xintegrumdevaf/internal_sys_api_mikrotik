import type { ContinueDiagnosticUseCase } from "../../application/diagnostic/use-cases/continue-diagnostic.use-case.js";
import type { StartDiagnosticUseCase } from "../../application/diagnostic/use-cases/start-diagnostic.use-case.js";
import { Logger } from "../../shared/utils/logger.js";

export class DiagnosticController {
    constructor(private readonly startDiagnostic: StartDiagnosticUseCase, private readonly continueDiagnostic: ContinueDiagnosticUseCase) { }

    analyze = async (req: any, res: any, next: any) => {

        // const { serial, pon, sector, olt_name } = req.body || {}

        Logger.info(`BODY: ${JSON.stringify(req.body)}`)

        try {
            const result = await this.startDiagnostic.execute(req.body)
            return res.status(200).json(result)

        } catch (error) {
            next(error)
        }
    }

    continue = async (req: any, res: any, next: any) => {

        // const { serial, pon, sector, olt_name } = req.body || {}

        Logger.info(`BODY: ${JSON.stringify(req.body)}`)

        try {
            const result = await this.continueDiagnostic.execute(req.body)
            return res.status(200).json(result)

        } catch (error) {
            next(error)
        }
    }
}