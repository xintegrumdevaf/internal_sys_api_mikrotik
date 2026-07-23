import { SECTORS } from "../../../config/sectors.js";
import { AdapterFactory } from "../../../infrastructure/olt/adapters/adapter.factory.js";
import type { OltConnectionManager } from "../../../infrastructure/olt/connection/olt-connection-manager.js";
import type { OltRequestDTO } from "../dto/olt.request.dto.js";

export class SetupUserDeviceUseCase {
    constructor(
        private readonly connectionManager: OltConnectionManager
    ) { }

    async execute(dto: OltRequestDTO): Promise<void> {

        const { sector, olt_name, pon, serial } = dto;

        const sectorConfig = SECTORS[sector];
        if (!sectorConfig) {
            throw new Error(`Sector ${sector} no existe`);
        }

        const olt = sectorConfig.olts[olt_name];
        if (!olt) {
            throw new Error(`OLT ${olt_name} no existe`);
        }

        const session = await this.connectionManager.connect(
            sectorConfig.host,
            sectorConfig.port,
            olt
        );

        try {
            const adapter = AdapterFactory.create(session, olt.brand);

            await adapter.setupUserDevice(pon, serial);

        } finally {
            await session.close();
        }
    }
}