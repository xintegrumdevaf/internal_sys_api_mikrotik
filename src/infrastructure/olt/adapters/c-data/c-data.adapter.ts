import type { OltSession } from "../../session/olt.session.js"
import { loginInterface } from "./commands/loginInterface.command.js"
import { showOntMac } from "./commands/showOntMac.command.js"
import { showOntInfo } from "./commands/showOntInfo.command.js"
import { showOntPower } from "./commands/showOntPower.command.js"
import { activateOnt } from "./commands/activate-ont.command.js"
import { deactivateOnt } from "./commands/deactivate-ont.command.js"
import { setupUserDevice } from "./commands/setup-user-device.command.js"
import { showOntHookBySn } from "./commands/show-ont-hook-by-sn.command.js"
import { parseAutofindOnts, parseOntInfo, type HuaweiOntInfo } from "./parsers/ont.parser.js"
import { parseOntRxPower } from "./parsers/power.parser.js"
import { parseMacTable } from "./parsers/mac.parser.js"
import { CommandExecutor } from "../../session/command-executor.js"
import type { OltAdapterPort } from "../../../../application/ports/olt-adapter.port.js"
import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js"
import type { DeviceStatusResponseDTO } from "../../../../application/olt/dto/device-status.response.dto.js"
import type { ReactivateDeviceResponseDTO } from "../../../../application/olt/dto/reactivate-device.response.dto.js"
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js"
import { DeviceAdministrativeStatus } from "../../../../domain/olt/enums/device-administrative-status.enum.js"
import { DeviceOperationalStatus } from "../../../../domain/olt/enums/device-operational-status.enum.js"
import { DeviceNotFoundError } from "../../../../domain/olt/exceptions/device-not-found.error.js"
import { Logger } from "../../../../shared/utils/logger.js"

interface CDataFlowContext {
  ont?: HuaweiOntInfo | null
  power?: number | null
  mac?: string | null
  [key: string]: unknown
}

interface CDataSetupFlowContext {
  ont?: { number: number; ontSN: string } | null
  [key: string]: unknown
}

export class CDataAdapter implements OltAdapterPort {
  constructor(
    private readonly session: OltSession,
    private readonly brand: Brand
  ) {}

  async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {
    const executor = new CommandExecutor(this.session)

    const result = await executor.runFlow<CDataFlowContext>([
      {
        step: "login",
        command: () => loginInterface()
      },
      {
        step: "ont",
        command: () => showOntInfo(serial),
        parser: (output: string, ctx: CDataFlowContext) => {
          if (/no ONT available/i.test(output)) {
            throw new Error("There is no ONT available.")
          }
          const ont = parseOntInfo(output)
          if (!ont) throw new Error("ONT no encontrada")
          ctx.ont = ont
          return ont
        },
        required: true
      },
      {
        step: "power",
        command: (ctx: CDataFlowContext) => showOntPower(pon, ctx.ont?.id ?? 0),
        parser: (out: string) => parseOntRxPower(out)
      },
      {
        step: "exit",
        command: () => "exit"
      },
      {
        step: "mac",
        command: (ctx: CDataFlowContext) =>
          showOntMac(`${ctx.ont?.frame ?? 0}/${ctx.ont?.slot ?? 0}/${ctx.ont?.pon ?? 0}`),
        parser: (out: string, ctx: CDataFlowContext) => {
          const macs = parseMacTable(out)
          return macs.find(m => m.onu === ctx.ont?.id)?.mac ?? null
        }
      }
    ])

    const ont = result.context.ont
    const lastFailed = result.history.find(h => !h.success)

    return {
      brand: this.brand,
      onu: ont ?? null,
      state: ont
        ? {
            adminState: ont.controlFlag ?? "unknown",
            runState: ont.runState ?? "unknown",
            configState: ont.configState ?? "unknown",
            matchState: ont.matchState ?? "unknown"
          }
        : null,
      power: typeof result.context.power === "number" ? result.context.power : null,
      mac: result.context.mac ?? null,
      _history: result.history,
      failedStep: result.failedStep ?? null,
      error: lastFailed?.error ?? null
    }
  }

  async getDeviceStatus(pon: string, serial: string): Promise<DeviceStatusResponseDTO> {
    const techData = await this.showOnu(pon, serial)
    const ont = techData.onu as unknown as HuaweiOntInfo | null

    if (!ont) {
      return {
        brand: this.brand,
        serial,
        pon,
        ontId: null,
        administrativeStatus: DeviceAdministrativeStatus.NOT_FOUND,
        operationalStatus: DeviceOperationalStatus.UNKNOWN,
        opticalPower: null,
        mac: null,
        controlFlag: null,
        rawRunState: null,
        canBeReactivated: false,
        reason: "ONT no encontrada en la OLT C-Data con el serial provisto.",
        recommendation: "Verificar el serial y el puerto PON asignado.",
        _history: techData._history,
        failedStep: techData.failedStep
      }
    }

    const controlFlag = (ont.controlFlag ?? "").toLowerCase()
    const runState = (ont.runState ?? "").toLowerCase()
    const power = typeof techData.power === "number" ? techData.power : null
    const mac = techData.mac ?? null

    let administrativeStatus = DeviceAdministrativeStatus.UNKNOWN
    let operationalStatus = DeviceOperationalStatus.UNKNOWN
    let canBeReactivated = false
    let reason = ""
    let recommendation = ""

    if (controlFlag === "deactivated" || controlFlag === "disable") {
      administrativeStatus = DeviceAdministrativeStatus.DISABLED
      operationalStatus = runState === "online" ? DeviceOperationalStatus.ONLINE : DeviceOperationalStatus.OFFLINE
      canBeReactivated = true
      reason = "ONT deshabilitada administrativamente en la OLT C-Data."
      recommendation = "Ejecutar la reactivación del equipo para habilitar el servicio."
    } else if (controlFlag === "active" || controlFlag === "enable") {
      if (runState === "online") {
        administrativeStatus = DeviceAdministrativeStatus.ENABLED
        operationalStatus = DeviceOperationalStatus.ONLINE
        canBeReactivated = false
        reason = "ONT habilitada administrativamente y en línea en la OLT C-Data."
        recommendation = "El equipo se encuentra funcionando normalmente."
      } else {
        operationalStatus = DeviceOperationalStatus.OFFLINE
        if (power == null || power <= -28) {
          administrativeStatus = DeviceAdministrativeStatus.OPTICAL_FAULT
          canBeReactivated = false
          reason = "ONT fuera de línea por falla o corte en la señal óptica (LOS)."
          recommendation = "Revisar la continuidad física de la fibra óptica."
        } else {
          administrativeStatus = DeviceAdministrativeStatus.SUSPENDED
          canBeReactivated = true
          reason = "ONT administrativamente activa pero fuera de línea / suspendida."
          recommendation = "Verificar conexión física o enviar orden de reactivación."
        }
      }
    } else {
      administrativeStatus = DeviceAdministrativeStatus.UNKNOWN
      operationalStatus = runState === "online" ? DeviceOperationalStatus.ONLINE : DeviceOperationalStatus.OFFLINE
      canBeReactivated = true
      reason = `Estado de control C-Data: ${ont.controlFlag}`
      recommendation = "Revisar configuración de la ONT en la OLT."
    }

    return {
      brand: this.brand,
      serial,
      pon,
      ontId: ont.id,
      administrativeStatus,
      operationalStatus,
      opticalPower: power,
      mac,
      controlFlag: ont.controlFlag ?? null,
      rawRunState: ont.runState ?? null,
      canBeReactivated,
      reason,
      recommendation,
      _history: techData._history,
      failedStep: techData.failedStep
    }
  }

  async reactivateOnt(pon: string, serial: string): Promise<ReactivateDeviceResponseDTO> {
    const currentStatus = await this.getDeviceStatus(pon, serial)
    if (currentStatus.administrativeStatus === DeviceAdministrativeStatus.NOT_FOUND || !currentStatus.ontId) {
      throw new DeviceNotFoundError(serial, pon)
    }

    const ontId = currentStatus.ontId
    const executor = new CommandExecutor(this.session)

    const result = await executor.runFlow([
      {
        step: "login",
        command: () => loginInterface()
      },
      {
        step: "activate_ont",
        command: () => activateOnt(ontId),
        interactions: [
          {
            wait: /[#>\s*]/i,
            send: ""
          }
        ]
      },
      {
        step: "exit",
        command: () => "exit"
      }
    ])

    const newStatus = await this.getDeviceStatus(pon, serial)
    const isSuccess =
      newStatus.administrativeStatus === DeviceAdministrativeStatus.ENABLED ||
      newStatus.controlFlag?.toLowerCase() === "active" ||
      newStatus.administrativeStatus !== DeviceAdministrativeStatus.DISABLED

    return {
      serial,
      brand: this.brand,
      pon,
      success: isSuccess,
      previousStatus: currentStatus.administrativeStatus,
      currentStatus: newStatus.administrativeStatus,
      message: isSuccess
        ? "Equipo reactivado exitosamente en la OLT C-Data."
        : "Se envió el comando de activación a la OLT C-Data. El equipo se encuentra sincronizando.",
      executedAt: new Date().toISOString(),
      _history: result.history
    }
  }

  async setupUserDevice(pon: string, serial: string): Promise<void> {
    const executor = new CommandExecutor(this.session)
    const result = await executor.runFlow<CDataSetupFlowContext>([
      {
        step: "login",
        command: () => loginInterface()
      },
      {
        step: "ont",
        command: () => showOntHookBySn(pon, serial),
        parser: (output: string) => {
          const onts = parseAutofindOnts(output)
          return onts && onts[0] ? onts[0] : null
        }
      },
      {
        step: "setup_ont",
        command: (ctx: CDataSetupFlowContext) => setupUserDevice(pon, String(ctx.ont?.number ?? 1), serial)
      },

      {
        step: "exit",
        command: () => "exit"
      },
      {
        step: "save",
        command: () => "save"
      }
    ])

    const { context: { ont } } = result
    Logger.info(`ONT TO HOOK: ${JSON.stringify(ont)}`)
  }

  async rebootOnt(_serial: string): Promise<void> {
    throw new Error("Method not implemented.")
  }

  async deleteOnt(_serial: string): Promise<void> {
    throw new Error("Method not implemented.")
  }
}