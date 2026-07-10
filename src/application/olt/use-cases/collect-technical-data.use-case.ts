import { SECTORS } from "../../../config/sectors.js";
import { AdapterFactory } from "../../../infrastructure/olt/adapters/adapter.factory.js";
import { Logger } from "../../../shared/utils/logger.js";
import type { OltConnectionManager } from "../../../infrastructure/olt/connection/olt-connection-manager.js";
import type { OltRequestDTO } from "../dto/olt.request.dto.js";


export class CollectTechnicalDataUseCase {

    constructor(private readonly connectionManager: OltConnectionManager) { }

    async execute(dto: OltRequestDTO) {
        const { sector, olt_name, serial, pon } = dto
        const sectorConfig = SECTORS[sector];
        Logger.info(`SECTOR CONFIG: ${sectorConfig}`)

        if (!sectorConfig) {
            throw new Error(`Sector ${sector} no existe`);
        }

        const olt = sectorConfig.olts[olt_name];
        Logger.info(`OLT: ${JSON.stringify(olt)}`)

        if (!olt) {
            throw new Error(`OLT ${olt_name} no existe en ${sector}`);
        }
        // const { session, brand } = await this.connectionManager.connect(sectorConfig.host, olt)
        const session = await this.connectionManager.connect(sectorConfig.host, olt)
        // const sectorConfig = SECTORS[sector];
        // const olt = sectorConfig?.olts[olt_name]
        // if (!olt) {
        //     throw new Error("Olt no encontrada")
        // }
        const adapter = AdapterFactory.create(olt.brand, session)
        const result = await adapter.showOnu(pon, serial)
        Logger.success(`RESULT IN USECASE: ${JSON.stringify(result)}`)
        await session.close()

        return result
    }
}