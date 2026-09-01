import type { OltConnectionPort } from "../../ports/olt-connection.port.js";
import type { OltSession } from "../../../infrastructure/olt/session/olt.session.js";
import { SECTORS } from "../../../config/sectors.js";
import { AdapterFactory } from "../../../infrastructure/olt/adapters/adapter.factory.js";
import type { OltRequestDTO } from "../dto/olt.request.dto.js";
import { SectorNotFoundError, OltNotFoundError } from "../../../domain/olt/exceptions/index.js";

export class CollectTechnicalDataUseCase {
    constructor(private readonly connectionManager: OltConnectionPort) { }

    async execute(dto: OltRequestDTO) {
        const { sector, oltName, serial, pon } = dto
        const sectorConfig = SECTORS[sector];

        if (!sectorConfig) {
            throw new SectorNotFoundError(sector);
        }

        const olt = sectorConfig.olts[oltName];

        if (!olt) {
            throw new OltNotFoundError(oltName, sector);
        }

        const session = await this.connectionManager.connect(sectorConfig.host, sectorConfig.port, olt)
        try {
            const adapter = AdapterFactory.create(session as unknown as OltSession, olt.brand)
            const result = await adapter.showOnu(pon, serial)
            return result
        } finally {
            await session.close()
        }
    }
}