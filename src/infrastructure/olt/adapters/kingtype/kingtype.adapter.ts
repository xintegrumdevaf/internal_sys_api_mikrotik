import type { DeviceStatusResponseDTO } from "../../../../application/olt/dto/device-status.response.dto.js"
import type { ReactivateDeviceResponseDTO } from "../../../../application/olt/dto/reactivate-device.response.dto.js"
import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js"
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js"
import { DeviceAdministrativeStatus } from "../../../../domain/olt/enums/device-administrative-status.enum.js"
import { DeviceOperationalStatus } from "../../../../domain/olt/enums/device-operational-status.enum.js"
import { DeviceNotFoundError } from "../../../../domain/olt/exceptions/device-not-found.error.js"
import type { OltAdapterPort } from "../../../../application/ports/olt-adapter.port.js"
import { Logger } from "../../../../shared/utils/logger.js"
import { CommandExecutor } from "../../session/command-executor.js"
import type { OltSession } from "../../session/olt.session.js"
import { activateOnt } from "./command/activate-ont.command.js"
import { deactivateOnt } from "./command/deactivate-ont.command.js"
import { showOnuInfoTable } from "./command/showOntInfoTable.command.js"
import { showOntPower } from "./command/showOntPower.command.js"
import { showOnuMac } from "./command/showOnuMac.command.js"
import { parseOnuMac } from "./parsers/mac.parser.js"
import { findOnuBySerial, parseOnuTable, type OnuTableRow } from "./parsers/onu.parser.js"
import { parseOnuRxPower } from "./parsers/power.parser.js"

interface KingtypeFlowContext {
  rows?: OnuTableRow[]
  onu?: OnuTableRow | null
  power?: number | null
  mac?: string | null
  [key: string]: unknown
}

export class KingtypeAdapter implements OltAdapterPort {
  constructor(
    private readonly session: OltSession,
    private readonly brand: Brand
  ) {}

  async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {
    const executor = new CommandExecutor(this.session)
    const result = await executor.runFlow<KingtypeFlowContext>([
      {
        step: "rows",
        command: () => showOnuInfoTable(pon),
        parser: (output: string) => parseOnuTable(output)
      },
      {
        step: "onu",
        command: () => "",
        parser: (_: string, ctx: KingtypeFlowContext) => {
          const rows = ctx.rows ?? []
          const onu = findOnuBySerial(rows, serial)
          Logger.info(`ONU FOUND: ${JSON.stringify(onu)}`)
          return onu ?? null
        }
      },
      {
        step: "power",
        command: (ctx: KingtypeFlowContext) => (ctx.onu ? showOntPower(pon, ctx.onu.id) : ""),
        parser: (output: string) => parseOnuRxPower(output)
      },
      {
        step: "mac",
        command: (ctx: KingtypeFlowContext) => (ctx.onu ? showOnuMac(pon, ctx.onu.id) : ""),
        parser: (output: string) => parseOnuMac(output)
      }
    ])

    const { history, failedStep, context: { onu, power, mac } } = result
    const lastFailed = history.find(h => !h.success)

    return {
      brand: this.brand,
      onu: onu ? { id: onu.id, serial: onu.serial, pon: Number(pon) } : null,
      state: onu ? { runState: onu.mibReady ? "Online" : "Offline" } : null,
      mac: mac ?? null,
      power: typeof power === "number" ? power : null,
      _history: history,
      failedStep: failedStep ?? (onu ? null : "onu"),
      error: onu ? null : (lastFailed?.error ?? "ONU no encontrada")
    }
  }

  async getDeviceStatus(pon: string, serial: string): Promise<DeviceStatusResponseDTO> {
    const techData = await this.showOnu(pon, serial)
    const onu = techData.onu

    if (!onu) {
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
        reason: "ONT no encontrada en la OLT Kingtype con el serial provisto.",
        recommendation: "Verificar el serial y el puerto PON asignado.",
        _history: techData._history,
        failedStep: techData.failedStep
      }
    }

    const state = techData.state
    const runState = (state?.runState ?? "").toLowerCase()
    const power = typeof techData.power === "number" ? techData.power : null
    const mac = techData.mac ?? null

    let administrativeStatus = DeviceAdministrativeStatus.UNKNOWN
    let operationalStatus = DeviceOperationalStatus.UNKNOWN
    let canBeReactivated = false
    let reason = ""
    let recommendation = ""

    if (runState === "online" || runState === "ready" || runState === "active") {
      administrativeStatus = DeviceAdministrativeStatus.ENABLED
      operationalStatus = DeviceOperationalStatus.ONLINE
      canBeReactivated = false
      reason = "ONT activa y en línea en la OLT Kingtype."
      recommendation = "El equipo opera con normalidad."
    } else {
      operationalStatus = DeviceOperationalStatus.OFFLINE
      if (power == null || power <= -28) {
        administrativeStatus = DeviceAdministrativeStatus.OPTICAL_FAULT
        canBeReactivated = false
        reason = "ONT fuera de línea por pérdida de potencia óptica (LOS / fibra desconectada)."
        recommendation = "Revisar la potencia y el conector de fibra óptica."
      } else {
        administrativeStatus = DeviceAdministrativeStatus.SUSPENDED
        canBeReactivated = true
        reason = "ONT fuera de línea / deshabilitada en la OLT Kingtype."
        recommendation = "Enviar orden de reactivación a la OLT."
      }
    }

    return {
      brand: this.brand,
      serial,
      pon,
      ontId: onu.id,
      administrativeStatus,
      operationalStatus,
      opticalPower: power,
      mac,
      controlFlag: null,
      rawRunState: state?.runState ?? null,
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

    await executor.run("reactivate_kingtype", activateOnt(ontId))

    const updatedStatus = await this.getDeviceStatus(pon, serial)
    const isSuccess =
      updatedStatus.administrativeStatus === DeviceAdministrativeStatus.ENABLED ||
      updatedStatus.operationalStatus === DeviceOperationalStatus.ONLINE

    return {
      brand: this.brand,
      serial,
      pon,
      success: isSuccess,
      previousStatus: currentStatus.administrativeStatus,
      currentStatus: updatedStatus.administrativeStatus,
      message: isSuccess
        ? `ONT ${serial} reactivada exitosamente en OLT Kingtype.`
        : `Se envió el comando de activación a la OLT Kingtype pero el estado actual es ${updatedStatus.administrativeStatus}.`,
      executedAt: new Date().toISOString(),
      _history: executor.getHistory()
    }
  }

  async setupUserDevice(): Promise<void> {
    throw new Error("setupUserDevice no implementado para Kingtype.")
  }

  async rebootOnt(_serial: string): Promise<void> {
    throw new Error("rebootOnt no implementado para Kingtype.")
  }

  async deleteOnt(_serial: string): Promise<void> {
    throw new Error("deleteOnt no implementado para Kingtype.")
  }
}