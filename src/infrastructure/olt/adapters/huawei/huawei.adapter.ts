import type { DeviceStatusResponseDTO } from "../../../../application/olt/dto/device-status.response.dto.js";
import type { ReactivateDeviceResponseDTO } from "../../../../application/olt/dto/reactivate-device.response.dto.js";
import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";
import { DeviceAdministrativeStatus } from "../../../../domain/olt/enums/device-administrative-status.enum.js";
import { DeviceOperationalStatus } from "../../../../domain/olt/enums/device-operational-status.enum.js";
import { DeviceNotFoundError } from "../../../../domain/olt/exceptions/device-not-found.error.js";
import type { OltAdapterPort } from "../../../../application/ports/olt-adapter.port.js";
import { Logger } from "../../../../shared/utils/logger.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { OltSession } from "../../session/olt.session.js";
import { activateOnt } from "./commands/activate-ont.command.js";
import { deactivateOnt } from "./commands/deactivate-ont.command.js";
import { confirmOnuState } from "./commands/confirm-onu-state.command.js";
import { createService } from "./commands/create-service-port.command.js";
import { loginInterface } from "./commands/loginInterface.command.js";
import { setupUserDevice } from "./commands/setup-user-device.command.js";
import { showOntHookDevices } from "./commands/show-ont-hook-devices.command.js";
import { showOntInfo } from "./commands/showOntInfo.command.js";
import { showOntMac } from "./commands/showOntMac.command.js";
import { showOntPower } from "./commands/showOntPower.command.js";
import type { HuaweiOntInfo } from "./types/huawei-ont-info.type.js";
import { findMacByOntId, parseMacTable } from "./parsers/mac.parser.js";
import { parseOntInfo } from "./parsers/ont.parser.js";
import { parseRxOpticalPower } from "./parsers/power.parser.js";

interface HuaweiFlowContext {
    ont?: HuaweiOntInfo
    power?: number | null
    mac?: string | null
    [key: string]: unknown
}

export class HuaweiAdapter implements OltAdapterPort {
    constructor(private readonly session: OltSession, private readonly brand: Brand) { }

    async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {
        const executor = new CommandExecutor(this.session)
        const result = await executor.runFlow<HuaweiFlowContext>([
            {
                step: "ont",
                command: () => showOntInfo(serial),
                interactions: [
                    {
                        wait: /\{\s*<cr>\|\|<K>\s*\}:/i,
                        send: ""
                    },
                    {
                        wait: /----\s*More/i,
                        send: "q"
                    }
                ],
                parser: (output: string, ctx: HuaweiFlowContext) => {
                    const ont = parseOntInfo(output);
                    if (!ont) throw new Error("The required ONT does not exist");
                    ctx.ont = ont;
                    return ont;
                },
                required: true,
            },
            {
                step: "login",
                command: (ctx: HuaweiFlowContext) => loginInterface(String(ctx.ont?.slot ?? 0)),
            },
            {
                step: "power",
                command: (ctx: HuaweiFlowContext) => showOntPower(pon, ctx.ont?.id ?? 0),
                interactions: [
                    {
                        wait: /\{\s*<cr>/i,
                        send: ""
                    },
                    {
                        wait: /More/i,
                        send: "Q"
                    }
                ],
                parser: (out: string) => parseRxOpticalPower(out)
            },
            {
                step: "exit interface",
                command: () => "quit"
            },
            {
                step: "mac",
                command: (ctx: HuaweiFlowContext) =>
                    showOntMac(`${ctx.ont?.frame ?? 0}/${ctx.ont?.slot ?? 0}/${ctx.ont?.pon ?? 0}`),
                interactions: [
                    {
                        wait: /\{\s*<cr>\|ont<K>\|\|<K>\s*\}:/i,
                        send: ""
                    },
                    {
                        wait: /More\s*\( Press 'Q' to break \)/i,
                        send: " "
                    }
                ],
                parser: (out: string, ctx: HuaweiFlowContext) => {
                    const macs = parseMacTable(out);
                    Logger.info(`MACS HUAWEI ======= ${JSON.stringify(macs)}`)
                    return ctx.ont ? (findMacByOntId(macs, ctx.ont.id) ?? null) : null;
                }
            }
        ])

        const { history, failedStep, context: { ont, power, mac } } = result
        const lastFailed = history.find(h => !h.success)

        return {
            brand: this.brand,
            onu: ont ?? null,
            state: ont ? {
                "runState": ont.runState,
                "configState": ont.configState,
                "matchState": ont.matchState,
            } : null,
            mac: mac ?? null,
            power: typeof power === "number" ? power : null,
            _history: history,
            failedStep: failedStep ?? null,
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
                reason: "ONT no encontrada en la OLT con el serial provisto.",
                recommendation: "Verificar el serial y el puerto PON asignado al abonado.",
                _history: techData._history,
                failedStep: techData.failedStep
            }
        }

        const controlFlag = ont.controlFlag?.toLowerCase() ?? ""
        const runState = ont.runState?.toLowerCase() ?? ""
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
            reason = "ONT deshabilitada administrativamente en la OLT."
            recommendation = "Ejecutar la reactivación del equipo para habilitar el servicio del abonado."
        } else if (controlFlag === "active" || controlFlag === "enable") {
            if (runState === "online") {
                administrativeStatus = DeviceAdministrativeStatus.ENABLED
                operationalStatus = DeviceOperationalStatus.ONLINE
                canBeReactivated = false
                reason = "ONT habilitada administrativamente y en línea."
                recommendation = "El equipo se encuentra operando con normalidad."
            } else {
                operationalStatus = DeviceOperationalStatus.OFFLINE
                if (power == null || power <= -28) {
                    administrativeStatus = DeviceAdministrativeStatus.OPTICAL_FAULT
                    canBeReactivated = false
                    reason = "ONT fuera de línea por falla o corte en la señal óptica (LOS / atenuación crítica)."
                    recommendation = "Revisar la continuidad del cable de fibra óptica y la alimentación de la ONT."
                } else {
                    administrativeStatus = DeviceAdministrativeStatus.SUSPENDED
                    canBeReactivated = true
                    reason = "ONT administrativamente activa pero fuera de línea / desconectada."
                    recommendation = "Verificar conexión física o enviar orden de reactivación/reseteo."
                }
            }
        } else {
            administrativeStatus = DeviceAdministrativeStatus.UNKNOWN
            operationalStatus = runState === "online" ? DeviceOperationalStatus.ONLINE : DeviceOperationalStatus.OFFLINE
            canBeReactivated = true
            reason = `Estado de control no reconocido: ${ont.controlFlag}`
            recommendation = "Revisar logs detallados de la OLT."
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
            controlFlag: ont.controlFlag,
            rawRunState: ont.runState,
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

        const result = await executor.runFlow<HuaweiFlowContext>([
            {
                step: "ont_info",
                command: () => showOntInfo(serial),
                parser: (output: string, ctx: HuaweiFlowContext) => {
                    const ont = parseOntInfo(output);
                    if (ont) ctx.ont = ont;
                    return ont;
                },
                interactions: [
                    {
                        wait: /\{\s*<cr>\|\|<K>\s*\}:/i,
                        send: ""
                    },
                    {
                        wait: /----\s*More/i,
                        send: "q"
                    }
                ]
            },
            {
                step: "login_interface",
                command: (ctx: HuaweiFlowContext) => loginInterface(String(ctx.ont?.slot ?? 0)),
            },

            {
                step: "activate_ont",
                command: () => activateOnt(pon, ontId),

                interactions: [
                    {
                        wait: /\{\s*<cr>/i,
                        send: ""
                    }
                ]
            },
            {
                step: "exit_interface",
                command: () => "quit"
            }
        ])

        const newStatus = await this.getDeviceStatus(pon, serial)
        const isSuccess = newStatus.administrativeStatus === DeviceAdministrativeStatus.ENABLED ||
            newStatus.controlFlag?.toLowerCase() === "active"

        return {
            serial,
            brand: this.brand,
            pon,
            success: isSuccess,
            previousStatus: currentStatus.administrativeStatus,
            currentStatus: newStatus.administrativeStatus,
            message: isSuccess
                ? "Equipo reactivado exitosamente en la OLT Huawei."
                : "Se envió el comando de activación a la OLT Huawei. El equipo se encuentra sincronizando.",
            executedAt: new Date().toISOString(),
            _history: result.history
        }
    }

    async setupUserDevice(pon: string, serial: string): Promise<void> {
        const executor = new CommandExecutor(this.session)
        await executor.runFlow([
            {
                step: "ont_to_hook",
                command: () => showOntHookDevices(),
                interactions: [
                    {
                        wait: /\{\s*<cr>\|\|<K>\s*\}:/i,
                        send: ""
                    },
                    {
                        wait: /----\s*More/i,
                        send: "q"
                    }
                ],
            },
            {
                step: "quit",
                command: () => "quit",
            },
            {
                step: "quit",
                command: () => "quit",
            }
        ])

        throw new Error("Method not implemented.");
    }

    async rebootOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async deleteOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}