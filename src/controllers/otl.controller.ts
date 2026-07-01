import { OltService } from "../services/otl/oltService.js"
import { Logger } from "../utils/logger.js"
import { findByAuthInfo, parseOnuTable } from "../utils/ont.js"


const oltService = new OltService()

export const showOntController = async (req: any, res: any) => {
    try {

        const { sector, olt, pon, serial } = req.body

        const result = await oltService.showOnt(sector, olt, pon, serial)

        // Logger.info(`SHOW ONT RESULT: ${JSON.stringify(result)}`)

        // const raw = await oltService.showOnt(sector, olt, serial);

        const rows = parseOnuTable(result);

        Logger.info(`PARSED: ${JSON.stringify(rows, null, 2)}`);

        const found = findByAuthInfo(rows, serial);

        if (found) {
            Logger.info(`Puerto: ${found.port}`); // 👈 el "1" de GPON0/6:1
        } else {
            Logger.warn("No se encontró ese AuthInfo");
        }
        

        res.json({ success: true, data: rows })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: err.essage
        });
    }
}