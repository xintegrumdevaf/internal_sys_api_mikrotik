import { open } from "../../../infrastructure/ssh/session.service.js"
import { SECTORS } from "../../../config/sectors.js";
import { AdapterFactory } from "../../../infrastructure/olt/adapters/adapter.factory.js";
import { Logger } from "../../../shared/utils/logger.js";


export class ShowOnuUseCase {
    async execute(sector: string, olt_name: string, serial: string, pon: string) {
        const sectorConfig = SECTORS[sector];
        Logger.info(sector)

        if (!sectorConfig) {
            throw new Error(`Sector ${sector} no existe`);
        }

        const olt = sectorConfig.olts[olt_name];
        Logger.info(`OLT: ${JSON.stringify(olt)}`)

        if (!olt) {
            throw new Error(`OLT ${olt_name} no existe en ${sector}`);
        }
        const connection = await open(sectorConfig.host, olt)
        // const sectorConfig = SECTORS[sector];
        // const olt = sectorConfig?.olts[olt_name]
        // if (!olt) {
        //     throw new Error("Olt no encontrada")
        // }
        const adapter = AdapterFactory.create(connection.profile, connection.session)
        const result = await adapter.showOnu(pon, serial)
        Logger.success(`RESULT IN USECASE: ${JSON.stringify(result)}`)
        await connection.session.close()

        return result
    }
}