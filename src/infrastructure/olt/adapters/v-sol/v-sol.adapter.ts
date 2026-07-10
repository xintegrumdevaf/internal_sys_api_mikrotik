
import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";
import type { IOltAdapter } from "../../../../domain/olt/interfaces/iolt.adapter.js";
import { AdapterExecutionError } from "../../session/adapter-execution.error.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { OltSession } from "../../session/olt.session.js";
import { loginInterface } from "./commands/loginInterface.command.js";
import { showOnuInfo } from "./commands/showOnuInfo.command.js";
import { showOnuState } from "./commands/showOnuState.command.js";
import { showPower } from "./commands/showPower.command.js";
import { findByAuthInfo, parseOnuTable } from "./parsers/onu.parser.js";
import { parseOnuRxPower } from "./parsers/power.parser.js";
import { parseOnuState } from "./parsers/state.parser.js";

export class VSolAdapter implements IOltAdapter {

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
                parser: (output) => parseOnuTable(output)
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

                    if (!onu) {
                        throw new AdapterExecutionError(
                            "ONU no encontrada",
                            executor.getHistory()
                        );
                    }

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
            }
        ]);

        // =========================
        // FINAL SAFE RETURN
        // =========================

        const onu = result.context.onu;
        const state = result.context.state;
        const power = result.context.power;

        if (!onu) {
            throw new AdapterExecutionError(
                "ONU no encontrada (final check)",
                result.history
            );
        }

        if (!state) {
            throw new AdapterExecutionError(
                "Estado de la ONU no encontrado",
                result.history
            );
        }

        return {
            brand: this.brand,

            onu,

            state,

            power: power?.rxPower ?? null,

            _history: result.history,

            failedStep: result.failedStep ?? null
        };
    }

    // async showOnu(pon: string, serial: string): Promise<OnuResponse> {
    //     await this.session.execute(loginInterface(pon))
    //     const executor = new CommandExecutor(this.session);

    //     await executor.run(
    //         "loginInterface",
    //         loginInterface(pon),
    //         () => true
    //     );

    //     const rows = await executor.run(
    //         "showOnuInfo",
    //         showOnuInfo(),
    //         parseOnuTable
    //     );

    //     const onu = findByAuthInfo(rows, serial);

    //     if (!onu) {
    //         throw new AdapterExecutionError(
    //             "ONU no encontrada",
    //             executor.getHistory()
    //         );
    //     }

    //     const state = await executor.run(
    //         "showOnuState",
    //         showOnuState(onu.id),
    //         parseOnuState
    //     );

    //     if (!state) {
    //         throw new AdapterExecutionError(
    //             "Estado de la ONU no encontrado",
    //             executor.getHistory()
    //         );
    //     }

    //     const power = await executor.run(
    //         "showPower",
    //         showPower(onu.id),
    //         parseOnuRxPower
    //     );

    //     return {
    //         profile: this.profile,
    //         onu,
    //         state,
    //         power: power?.rxPower ?? null
    //     };
    //     // const raw = await this.session.execute(showOnuInfo())
    //     // const rows = parseOnuTable(raw)

    //     // const onu = findByAuthInfo(rows, serial)

    //     // Logger.info(`ONT: ${JSON.stringify(onu)}`)

    //     // if (!onu) {
    //     //     throw new Error("ONU no encontrada")
    //     // }

    //     // const stateRaw = await this.session.execute(showOnuState(onu.id))

    //     // const state = parseOnuState(stateRaw)

    //     // Logger.info(`STATE: ${JSON.stringify(state)}`)

    //     // if (!state) {
    //     //     throw new Error("Estado de la ONU no encontrada")
    //     // }

    //     // const powerRaw = await this.session.execute(showPower(onu.id))
    //     // Logger.info(`POWER RAW: ${JSON.stringify(powerRaw)}`)
    //     // const power = parseOnuRxPower(powerRaw)

    //     // Logger.info(`POWER: ${JSON.stringify(power)}`)

    //     // return {
    //     //     profile: this.profile,
    //     //     onu,
    //     //     state,
    //     //     power: power?.rxPower
    //     // }

    // }

    rebootOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    deleteOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}