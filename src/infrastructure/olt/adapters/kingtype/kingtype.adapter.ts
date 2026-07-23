import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";
import type { IOltAdapter } from "../../../../domain/olt/interfaces/iolt.adapter.js";
import { Logger } from "../../../../shared/utils/logger.js";
import { AdapterExecutionError } from "../../session/adapter-execution.error.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { OltSession } from "../../session/olt.session.js";
import { showOnuInfoTable } from "./command/showOntInfoTable.command.js";
import { showOntPower } from "./command/showOntPower.command.js";
import { showOnuMac } from "./command/showOnuMac.command.js";
import { parseOnuMac } from "./parsers/mac.parser.js";
import { findOnuBySerial, parseOnuTable } from "./parsers/onu.parser.js";
import { parseOnuRxPower } from "./parsers/power.parser.js";

export class KingtypeAdapter implements IOltAdapter {

    constructor(private readonly session: OltSession, private readonly brand: Brand) { }

    async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {
        const executor = new CommandExecutor(this.session)
        const result = await executor.runFlow([
            // =========================
            // ONU LIST
            // =========================
            {
                step: "rows",
                command: () => showOnuInfoTable(pon),
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
                    const onu = findOnuBySerial(rows, serial);
                    Logger.info(`ONU FOUND: ${onu}`)

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
            // POWER
            // =========================
            {
                step: "power",
                command: (ctx) => showOntPower(ctx.onu.id),
                parser: (output) => parseOnuRxPower(output)
            },
            // =========================
            // MAC
            // =========================
            {
                step: "mac",
                command: (ctx) => showOnuMac(pon, ctx.onu.id),
                parser: (output) => parseOnuMac(output)
            }
        ])

        const { history, failedStep, context: { onu, power, mac } } = result

        return {
            brand: this.brand,
            onu,
            state: { runState: onu?.mibReady ? "Online" : "Offline" },
            mac,
            power,
            _history: history,
            failedStep: failedStep ?? null
        }
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