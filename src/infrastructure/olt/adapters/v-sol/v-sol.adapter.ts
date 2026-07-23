
import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";
import type { OltAdapterPort } from "../../../../application/ports/olt-adapter.port.js";
import { Logger } from "../../../../shared/utils/logger.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { OltSession } from "../../session/olt.session.js";
import { loginInterface } from "./commands/loginInterface.command.js";
import { showOnuInfo } from "./commands/showOnuInfo.command.js";
import { showOnuMacTable } from "./commands/showOnuMacTable.command.js";
import { showOnuState } from "./commands/showOnuState.command.js";
import { showPower } from "./commands/showPower.command.js";
import { findMacByOnuId, parseMacTable } from "./parsers/mac.parser.js";
import { findByAuthInfo, parseOnuTable } from "./parsers/onu.parser.js";
import { parseOnuRxPower } from "./parsers/power.parser.js";
import { parseOnuState } from "./parsers/state.parser.js";

export class VSolAdapter implements OltAdapterPort {

    constructor(private readonly session: OltSession, private readonly brand: Brand) { }

    async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {

        const executor = new CommandExecutor(this.session);

        const result = await executor.runFlow([
            // =========================
            // LOGIN
            // =========================
            {
                step: "login",
                command: () => loginInterface(pon),
                parser: () => true
            },

            // =========================
            // ONU LIST
            // =========================
            {
                step: "rows",
                command: () => showOnuInfo(),
                parser: (output) => parseOnuTable(output),
                interactions: [
                    {
                        wait: /--More--/i,
                        send: " "
                    }
                ],
            },

            // =========================
            // FILTER ONU (DEPENDENCIA REAL)
            // =========================
            {
                step: "onu",
                command: () => "", // no ejecuta comando real
                parser: (_, ctx) => {

                    const rows = ctx.rows;
                    const onu = findByAuthInfo(rows, serial);

                    // if (!onu) {
                    //     throw new AdapterExecutionError(
                    //         "ONU no encontrada",
                    //         executor.getHistory()
                    //     );
                    // }

                    return onu;
                }
            },

            // =========================
            // STATE
            // =========================
            {
                step: "state",
                command: (ctx) => showOnuState(ctx.onu.id),
                parser: (output) => parseOnuState(output),
                required: true
            },

            // =========================
            // POWER
            // =========================
            {
                step: "power",
                command: (ctx) => showPower(ctx.onu.id),
                parser: (output) => parseOnuRxPower(output)
            },
            {
                step: "exit interface",
                command: (ctx: any) => "quit"
            },

            // =========================
            // MAC
            // =========================
            {
                step: "mac",
                command: (ctx) => showOnuMacTable(pon),
                parser: (out: any, ctx: any) => {
                    const macs = parseMacTable(out);
                    return findMacByOnuId(macs, ctx.onu.id) ?? null;
                }
            }
        ]);

        // =========================
        // FINAL SAFE RETURN
        // =========================

        const onu = result.context.onu;
        const state = result.context.state;
        const power = result.context.power;
        const mac = result.context.mac

        // if (!onu) {
        //     throw new AdapterExecutionError(
        //         "ONU no encontrada (final check)",
        //         result.history
        //     );
        // }

        // if (!state) {
        //     throw new AdapterExecutionError(
        //         "Estado de la ONU no encontrado",
        //         result.history
        //     );
        // }


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

    setupUserDevice(pon: string, serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    rebootOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    deleteOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}