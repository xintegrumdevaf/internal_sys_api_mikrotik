
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
import { loginInterface } from "./commands/loginInterface.command.js";
import { showOnuInfo } from "./commands/showOnuInfo.command.js";
import { showOnuMacTable } from "./commands/showOnuMacTable.command.js";
import { showOnuState } from "./commands/showOnuState.command.js";
import { showPower } from "./commands/showPower.command.js";
import { findMacByOnuId, parseMacTable } from "./parsers/mac.parser.js";
import { findByAuthInfo, parseOnuTable } from "./parsers/onu.parser.js";
import { parseOnuRxPower } from "./parsers/power.parser.js";
import { parseOnuState } from "./parsers/state.parser.js";

import type { Onu } from "../../../../domain/olt/entities/onu.entity.js";
import type { OnuState } from "../../../../domain/olt/entities/onu-state.entity.js";
import type { OnuRxPower } from "../../../../domain/olt/entities/onu-rx-power.entity.js";

interface VSolFlowContext {
    rows?: Onu[]
    onu?: Onu
    state?: OnuState
    power?: OnuRxPower
    mac?: string | null
    [key: string]: unknown
}

export class VSolAdapter implements OltAdapterPort {


    constructor(private readonly session: OltSession, private readonly brand: Brand) { }

    async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {

        const executor = new CommandExecutor(this.session);

        const result = await executor.runFlow<VSolFlowContext>([
            {
                step: "login",
                command: () => loginInterface(pon),
                parser: () => true
            },
            {
                step: "rows",
                command: () => showOnuInfo(),
                parser: (output: string) => parseOnuTable(output),
                interactions: [
                    {
                        wait: /--More--/i,
                        send: " "
                    }
                ],
            },
            {
                step: "onu",
                command: () => "",
                parser: (_: string, ctx: VSolFlowContext) => {
                    const rows = ctx.rows ?? [];
                    const onu = findByAuthInfo(rows, serial);
                    return onu;
                }
            },
            {
                step: "state",
                command: (ctx: VSolFlowContext) => ctx.onu ? showOnuState(ctx.onu.id) : "",
                parser: (output: string) => parseOnuState(output),
                required: true
            },
            {
                step: "power",
                command: (ctx: VSolFlowContext) => ctx.onu ? showPower(ctx.onu.id) : "",
                parser: (output: string) => parseOnuRxPower(output)
            },
            {
                step: "exit interface",
                command: () => "quit"
            },
            {
                step: "mac",
                command: () => showOnuMacTable(pon),
                parser: (out: string, ctx: VSolFlowContext) => {
                    const macs = parseMacTable(out);
                    return ctx.onu ? (findMacByOnuId(macs, ctx.onu.id) ?? null) : null;
                }
            }
        ]);


        const onu = result.context.onu;
        const state = result.context.state;
        const power = result.context.power;
        const mac = result.context.mac

        if (!onu) {
            return {
                brand: this.brand,
                onu: null,
                state: null,
                power: null,
                failedStep: "onu",
                error: "ONU no encontrada",
                _history: executor.getHistory()
            };
        }

        if (!state) {
            return {
                brand: this.brand,
                onu,
                state: null,
                power: null,
                failedStep: "state",
                error: "Estado ONU no disponible",
                _history: result.history
            };
        }

        return {
            brand: this.brand,
            onu,
            state: { ...state, runState: state.omccState !== "disable" ? "Online" : "Offline" },
            power: power?.rxPower ?? null,
            mac: mac ?? null,
            _history: result.history,
            failedStep: result.failedStep ?? null
        };

    }

    async getDeviceStatus(pon: string, serial: string): Promise<DeviceStatusResponseDTO> {
        const techData = await this.showOnu(pon, serial);
        const onu = techData.onu;
        const state = techData.state;

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
                reason: "ONT no encontrada en la OLT VSOL con el serial provisto.",
                recommendation: "Verificar el serial y el puerto PON asignado.",
                _history: techData._history,
                failedStep: techData.failedStep
            };
        }

        const adminState = state?.adminState?.toLowerCase() ?? "";
        const omccState = state?.omccState?.toLowerCase() ?? "";
        const phaseState = state?.phaseState?.toLowerCase() ?? "";
        const power = typeof techData.power === "number" ? techData.power : null;
        const mac = techData.mac ?? null;

        let administrativeStatus = DeviceAdministrativeStatus.UNKNOWN;
        let operationalStatus = DeviceOperationalStatus.UNKNOWN;
        let canBeReactivated = false;
        let reason = "";
        let recommendation = "";

        if (adminState === "disable" || omccState === "disable") {
            administrativeStatus = DeviceAdministrativeStatus.DISABLED;
            operationalStatus = phaseState === "online" || phaseState === "working" ? DeviceOperationalStatus.ONLINE : DeviceOperationalStatus.OFFLINE;
            canBeReactivated = true;
            reason = "ONT deshabilitada administrativamente en la OLT VSOL.";
            recommendation = "Ejecutar la reactivación del equipo para habilitar el tráfico de la ONT.";
        } else if (phaseState === "online" || phaseState === "working") {
            administrativeStatus = DeviceAdministrativeStatus.ENABLED;
            operationalStatus = DeviceOperationalStatus.ONLINE;
            canBeReactivated = false;
            reason = "ONT habilitada administrativamente y en línea en la OLT VSOL.";
            recommendation = "El equipo se encuentra funcionando normalmente.";
        } else if (phaseState === "los") {
            administrativeStatus = DeviceAdministrativeStatus.OPTICAL_FAULT;
            operationalStatus = DeviceOperationalStatus.LOS;
            canBeReactivated = false;
            reason = "Pérdida de señal óptica en la ONT (LOS / corte de fibra).";
            recommendation = "Revisar empalmes, conectores y continuidad de la fibra óptica.";
        } else {
            operationalStatus = DeviceOperationalStatus.OFFLINE;
            if (power == null || power <= -28) {
                administrativeStatus = DeviceAdministrativeStatus.OPTICAL_FAULT;
                canBeReactivated = false;
                reason = "ONT fuera de línea por potencia óptica nula o insuficiente.";
                recommendation = "Verificar nivel de señal óptica y encendido de la ONT.";
            } else {
                administrativeStatus = DeviceAdministrativeStatus.SUSPENDED;
                canBeReactivated = true;
                reason = `ONT administrativamente activa pero en estado ${phaseState || "offline"}.`;
                recommendation = "Verificar servicio o enviar orden de reactivación.";
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
            controlFlag: adminState || omccState || null,
            rawRunState: phaseState || state?.runState || null,
            canBeReactivated,
            reason,
            recommendation,
            _history: techData._history,
            failedStep: techData.failedStep
        };
    }

    async reactivateOnt(pon: string, serial: string): Promise<ReactivateDeviceResponseDTO> {
        const currentStatus = await this.getDeviceStatus(pon, serial);
        if (currentStatus.administrativeStatus === DeviceAdministrativeStatus.NOT_FOUND || !currentStatus.ontId) {
            throw new DeviceNotFoundError(serial, pon);
        }

        const ontId = currentStatus.ontId;
        const executor = new CommandExecutor(this.session);

        const result = await executor.runFlow([
            {
                step: "login",
                command: () => loginInterface(pon),
                parser: () => true
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
                step: "exit_interface",
                command: () => "quit"
            }
        ]);

        const newStatus = await this.getDeviceStatus(pon, serial);
        const isSuccess = newStatus.administrativeStatus === DeviceAdministrativeStatus.ENABLED ||
            newStatus.operationalStatus === DeviceOperationalStatus.ONLINE ||
            newStatus.administrativeStatus !== DeviceAdministrativeStatus.DISABLED;

        return {
            serial,
            brand: this.brand,
            pon,
            success: isSuccess,
            previousStatus: currentStatus.administrativeStatus,
            currentStatus: newStatus.administrativeStatus,
            message: isSuccess
                ? "Equipo reactivado exitosamente en la OLT VSOL."
                : "Se envió el comando de activación a la OLT VSOL. El equipo se encuentra sincronizando.",
            executedAt: new Date().toISOString(),
            _history: result.history
        };
    }

    async setupUserDevice(pon: string, serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async rebootOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async deleteOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}