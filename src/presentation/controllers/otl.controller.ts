import type { CollectTechnicalDataUseCase } from "../../application/olt/use-cases/collect-technical-data.use-case.js"
import { Logger } from "../../shared/utils/logger.js"

export class OltController {
    constructor(private readonly collectTechnicalData: CollectTechnicalDataUseCase) { }

    collectData = async (req: any, res: any) => {
        try {
            Logger.info(`PAYLOAD: ${JSON.stringify(req.body)}`)

            const result = await this.collectTechnicalData.execute(req.body)
            Logger.success(`RESULT IN CONTROLLER: ${JSON.stringify(result)}`)
            res.json({ success: true, data: result })
        } catch (err: any) {
            Logger.error(`ERROR IN CONTROLLER: ${err}`)
            res.status(500).json({
                success: false,
                error: err.essage
            });
        }
    }
}


// const oltService = new OltService()
// const usecase = new ShowOnuUseCase()

// export const showOntController = async (req: any, res: any) => {
//     try {

//         const { sector, olt_name, pon, serial } = req.body

//         const result = await usecase.execute(sector, olt_name, serial, pon)
//         Logger.success(`RESULT IN CONTROLLER: ${JSON.stringify(result)}`)
//         res.json({ success: true, data: result })
//     } catch (err: any) {
//         Logger.error(`ERROR IN CONTROLLER: ${err}`)
//         res.status(500).json({
//             success: false,
//             error: err.essage
//         });
//     }
// }


// export const showOntController = async (req: any, res: any) => {
//     try {

//         const { sector, olt_name, pon, serial } = req.body

//         const result = await usecase.execute(sector, olt_name, serial, pon)
//         Logger.success(`RESULT IN CONTROLLER: ${JSON.stringify(result)}`)
//         res.json({ success: true, data: result })
//     } catch (err: any) {
//         Logger.error(`ERROR IN CONTROLLER: ${err}`)
//         res.status(500).json({
//             success: false,
//             error: err.essage
//         });
//     }
// }