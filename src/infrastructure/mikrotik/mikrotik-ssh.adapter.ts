import type { MikrotikClientQueueResponseDTO } from "../../application/mikrotik/dto/mikrotik-client-queue.response.dto.js"
import { parseMikrotikSimpleQueue } from "./parsers/simple-queue.parser.js"
import type { MikrotikServicePort } from "../../application/ports/mikrotik-service.port.js"
import type { MikrotikActionResultResponseDTO } from "../../application/mikrotik/dto/mikrotik-action-result.response.dto.js"
import type { MikrotikClientStatusResponseDTO } from "../../application/mikrotik/dto/mikrotik-client-status.response.dto.js"
import { MikrotikClientStatus } from "../../domain/mikrotik/enums/mikrotik-client-status.enum.js"
import { MIKROTIK_CREDENTIALS, SECTORS } from "../../config/sectors.js"
import { Logger } from "../../shared/utils/logger.js"
import { SSHService } from "../ssh/ssh.service.js"
import { parseMikrotikAddressList } from "./parsers/address-list.parser.js"

export class MikrotikSshAdapter implements MikrotikServicePort {
  private async createSshSession(sector: string): Promise<SSHService> {
    const sectorConfig = SECTORS[sector]
    if (!sectorConfig) {
      throw new Error(`Sector '${sector}' no configurado`)
    }

    const ssh = new SSHService({
      host: sectorConfig.host,
      port: sectorConfig.port,
      username: MIKROTIK_CREDENTIALS.username,
      password: MIKROTIK_CREDENTIALS.password
    })

    await ssh.connect()
    await ssh.openShell()
    await ssh.waitForStablePrompt()
    return ssh
  }

  
  async getClientQueue(sector: string, ip: string): Promise<MikrotikClientQueueResponseDTO> {
    const ssh = await this.createSshSession(sector)
    try {
      Logger.info(`[MikrotikSshAdapter.getClientQueue] Consultando Simple Queue para IP ${ip} en sector ${sector}`, "MikroTik")
      const output = await ssh.runCommand(`/queue simple print where target~"${ip}"`)
      const parsed = parseMikrotikSimpleQueue(output, ip)

      return {
        sector,
        ip,
        ...parsed,
        rawOutput: output.trim()
      }
    } finally {
      await ssh.close()
    }
  }

  async getClientStatus(sector: string, ip: string): Promise<MikrotikClientStatusResponseDTO> {
    const ssh = await this.createSshSession(sector)
    try {
      Logger.info(`[MikrotikSshAdapter.getClientStatus] Consultando IP ${ip} en sector ${sector}`, "MikroTik")
      const output = await ssh.runCommand(`/ip firewall address-list print where address="${ip}"`)
      const parsed = parseMikrotikAddressList(output, ip)


      return {
        sector,
        ip,
        status: parsed.status,
        clientName: parsed.clientName,
        list: parsed.list,
        creationTime: parsed.creationTime,
        canBeReactivated: parsed.canBeReactivated,
        reason: parsed.reason,
        rawOutput: output.trim()
      }
    } finally {
      await ssh.close()
    }
  }

  async reactivateClient(sector: string, ip: string): Promise<MikrotikActionResultResponseDTO> {
    const current = await this.getClientStatus(sector, ip)
    const ssh = await this.createSshSession(sector)

    try {
      Logger.info(`[MikrotikSshAdapter.reactivateClient] Reactivando IP ${ip} en sector ${sector}`, "MikroTik")

      if (current.list != null) {
        await ssh.runCommand(`/ip firewall address-list set [find address="${ip}"] list="Habilitado"`)
      } else {
        await ssh.runCommand(`/ip firewall address-list add list="Habilitado" address="${ip}"`)
      }

      const verified = parseMikrotikAddressList(
        await ssh.runCommand(`/ip firewall address-list print where address="${ip}"`),

        ip
      )

      const isSuccess = verified.status === MikrotikClientStatus.HABILITADO

      return {
        sector,
        ip,
        success: isSuccess,
        previousStatus: current.status,
        currentStatus: verified.status,
        message: isSuccess
          ? `Cliente con IP ${ip} reactivado exitosamente a la lista 'Habilitado'.`
          : `Se envió el comando a MikroTik pero la IP ${ip} reporta estado '${verified.status}'.`,
        executedAt: new Date().toISOString()
      }
    } finally {
      await ssh.close()
    }
  }

  async cutClient(sector: string, ip: string, comment?: string): Promise<MikrotikActionResultResponseDTO> {
    const current = await this.getClientStatus(sector, ip)
    const ssh = await this.createSshSession(sector)

    try {
      Logger.info(`[MikrotikSshAdapter.cutClient] Cortando IP ${ip} en sector ${sector}`, "MikroTik")

      if (current.list != null) {
        await ssh.runCommand(`/ip firewall address-list set [find address="${ip}"] list="CORTADO"`)
      } else {
        const commentArg = comment ? ` comment="${comment}"` : ""
        await ssh.runCommand(`/ip firewall address-list add list="CORTADO" address="${ip}"${commentArg}`)
      }

      const verified = parseMikrotikAddressList(
        await ssh.runCommand(`/ip firewall address-list print where address="${ip}"`),

        ip
      )

      const isSuccess = verified.status === MikrotikClientStatus.CORTADO

      return {
        sector,
        ip,
        success: isSuccess,
        previousStatus: current.status,
        currentStatus: verified.status,
        message: isSuccess
          ? `Cliente con IP ${ip} colocado en la lista 'CORTADO' exitosamente.`
          : `Se envió la orden de corte a MikroTik pero la IP ${ip} reporta estado '${verified.status}'.`,
        executedAt: new Date().toISOString()
      }
    } finally {
      await ssh.close()
    }
  }
}
