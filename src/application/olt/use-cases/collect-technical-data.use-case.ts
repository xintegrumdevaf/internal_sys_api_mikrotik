import type { OltConnectionPort } from "../../ports/olt-connection.port.js";
import type { OltSession } from "../../../infrastructure/olt/session/olt.session.js";
import { SECTORS } from "../../../config/sectors.js";
import { AdapterFactory } from "../../../infrastructure/olt/adapters/adapter.factory.js";
import type { OltRequestDTO } from "../dto/olt.request.dto.js";

export class CollectTechnicalDataUseCase {
    constructor(private readonly connectionManager: OltConnectionPort) { }

    async execute(dto: OltRequestDTO) {
        const { sector, olt_name, serial, pon } = dto
        const sectorConfig = SECTORS[sector];

        if (!sectorConfig) {
            throw new Error(`Sector ${sector} no existe`);
        }

        const olt = sectorConfig.olts[olt_name];

        if (!olt) {
            throw new Error(`OLT ${olt_name} no existe en ${sector}`);
        }

        const session = await this.connectionManager.connect(sectorConfig.host, sectorConfig.port, olt)
        const adapter = AdapterFactory.create(session as unknown as OltSession, olt.brand)
        const result = await adapter.showOnu(pon, serial)
        await session.close()

        return result
    }
}