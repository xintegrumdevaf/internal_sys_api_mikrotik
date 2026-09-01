import { SectorNotFoundError } from "../../../domain/olt/exceptions/sector-not-found.error.js"
import { SECTORS } from "../../../config/sectors.js"
import type { MikrotikServicePort } from "../../ports/mikrotik-service.port.js"
import type { MikrotikActionResultResponseDTO } from "../dto/mikrotik-action-result.response.dto.js"
import type { MikrotikClientRequestDTO } from "../dto/mikrotik-client.request.dto.js"

export class CutMikrotikClientUseCase {
  constructor(private readonly mikrotikService: MikrotikServicePort) {}

  async execute(dto: MikrotikClientRequestDTO): Promise<MikrotikActionResultResponseDTO> {
    const { sector, ip, comment } = dto

    if (!SECTORS[sector]) {
      throw new SectorNotFoundError(sector)
    }

    return await this.mikrotikService.cutClient(sector, ip, comment)
  }
}
