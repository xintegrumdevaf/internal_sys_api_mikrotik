import type { ContinueDiagnosticUseCase } from "../../application/diagnostic/use-cases/continue-diagnostic.use-case.js";
import type { StartDiagnosticUseCase } from "../../application/diagnostic/use-cases/start-diagnostic.use-case.js";
import { Logger } from "../../shared/utils/logger.js";
import { validateRequiredFields } from "../../shared/utils/validate-fields.js";

export class DiagnosticController {
    constructor(private readonly startDiagnostic: StartDiagnosticUseCase, private readonly continueDiagnostic: ContinueDiagnosticUseCase) { }

    analyze = async (req: any, res: any, next: any) => {
        // const requiredFields = ["conversationId", "sector", "olt_name", "pon", "serial"]
        const requiredFields = ["sector", "olt_name", "pon", "serial"]

        const missingFields = validateRequiredFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "Faltan campos obligatorios",
                fields: missingFields,
            });
        }

        Logger.info(`BODY: ${JSON.stringify(req.body)}`)

        try {
            const result = await this.startDiagnostic.execute(req.body)
            return res.status(200).json(result)

        } catch (error) {
            next(error)
        }
    }

    continue = async (req: any, res: any, next: any) => {

        const requiredFields = ["conversationId", "message",]

        const missingFields = validateRequiredFields(req.body, requiredFields);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "Faltan campos obligatorios",
                fields: missingFields,
            });
        }

        Logger.info(`BODY: ${JSON.stringify(req.body)}`)

        try {
            const result = await this.continueDiagnostic.execute(req.body)
            return res.status(200).json(result)

        } catch (error) {
            next(error)
        }
    }
}