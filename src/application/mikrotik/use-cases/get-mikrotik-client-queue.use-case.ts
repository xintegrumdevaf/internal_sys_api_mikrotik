import { SectorNotFoundError } from "../../../domain/olt/exceptions/sector-not-found.error.js"
import { SECTORS } from "../../../config/sectors.js"
import type { MikrotikServicePort } from "../../ports/mikrotik-service.port.js"
import type { MikrotikClientRequestDTO } from "../dto/mikrotik-client.request.dto.js"
import type { MikrotikClientQueueResponseDTO } from "../dto/mikrotik-client-queue.response.dto.js"

export class GetMikrotikClientQueueUseCase {
  constructor(private readonly mikrotikService: MikrotikServicePort) {}

  async execute(dto: MikrotikClientRequestDTO): Promise<MikrotikClientQueueResponseDTO> {
    const { sector, ip } = dto

    if (!SECTORS[sector]) {
      throw new SectorNotFoundError(sector)
    }

    return await this.mikrotikService.getClientQueue(sector, ip)
  }
}
