import type { OltSession } from "../../session/olt.session.js";
import { loginInterface } from "./commands/loginInterface.command.js";
import { showOntMac } from "./commands/showOntMac.command.js";
import { showOntInfo } from "./commands/showOntInfo.command.js";
import { showOntPower } from "./commands/showOntPower.command.js";
import { findOntBySN, parseAutofindOnts, parseOntInfo } from "./parsers/ont.parser.js";
import { parseOntRxPower } from "./parsers/power.parser.js";
import { parseMacTable } from "./parsers/mac.parser.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { OltAdapterPort } from "../../../../application/ports/olt-adapter.port.js";
import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";
import { showOntHookDevices } from "./commands/show-ont-hook-devices.command.js";
import { Logger } from "../../../../shared/utils/logger.js";
import { setupUserDevice } from "./commands/setup-user-device.command.js";
import { showOntHookBySn } from "./commands/show-ont-hook-by-sn.command.js";

export class CDataAdapter implements OltAdapterPort {
    constructor(private readonly session: OltSession, private readonly brand: Brand) { }

    async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {

        const executor = new CommandExecutor(this.session);

        const result = await executor.runFlow([
            {
                step: "login",
                command: () => loginInterface(),
            },

            {
                step: "ont",
                command: () => showOntInfo(serial),
                parser: (_: any, ctx: any) => {
                    const ont = parseOntInfo(_);

                    if (!ont) throw new Error("ONT no encontrada");

                    ctx.ont = ont; // 👈 guardas contexto
                    return ont;
                },
                required: true
            },

            {
                step: "power",
                command: (ctx: any) => showOntPower(pon, ctx.ont.id),
                parser: (out: any, ctx: any) => parseOntRxPower(out)
            },

            {
                step: "exit",
                command: (ctx: any) => "exit",
            },

            {
                step: "mac",
                command: (ctx: any) =>
                    showOntMac(`${ctx.ont.frame}/${ctx.ont.slot}/${ctx.ont.pon}`),

                parser: (out: any, ctx: any) => {
                    const macs = parseMacTable(out);
                    return macs.find(m => m.onu === ctx.ont.id)?.mac ?? null;
                }
            }
        ]);

        const ont = result.context.ont;

        return {
            brand: this.brand,

            onu: ont ?? null,

            state: ont ? {
                adminState: ont?.adminState ?? "unknown",
                runState: ont?.runState ?? "unknown",
                configState: ont?.configState ?? "unknown",
                matchState: ont?.matchState ?? "unknown"
            } : null,

            power: result.context.power ?? null,

            mac: result.context.mac ?? null,

            _history: result.history,

            failedStep: result.failedStep ?? null
        };
    }

    async setupUserDevice(pon: string, serial: string): Promise<void> {
        const executor = new CommandExecutor(this.session)
        const result = await executor.runFlow([
            {
                step: "login",
                command: () => loginInterface(),
            },
            {
                step: "ont",
                command: () => showOntHookBySn(pon, serial),
                // parser: (output) => parseAutofindOnts(output)
                parser: (output) => {
                    const ont = parseAutofindOnts(output);
                    // Logger.info(`ONTS: ${JSON.stringify(ont)}`)
                    return ont ? ont[0] : null;
                },
                // command: () => showOntHookDevices(),
                // parser: (output) => {
                //     const onts = parseAutofindOnts(output);
                //     Logger.info(`ONTS: ${JSON.stringify(onts)}`)
                //     return findOntBySN(onts, serial) ?? null;
                // },
                // interactions: [
                //     {

                //         wait: /More\s*\( Press 'Q' to break \)/i,
                //         send: " "

                //     }

                // ],
            },
            // {
            //     step: "ont",
            //     command: () => "",
            //     parser: (_, ctx) => findOntBySN(ctx.ont_to_hook, serial) ?? null
            // }
            // {
            //     step: "ont",
            //     command: () => showOntInfo(serial),
            //     parser: (_: any, ctx: any) => {
            //         const ont = parseOntInfo(_);

            //         if (!ont) throw new Error("ONT no encontrada");

            //         ctx.ont = ont; // 👈 guardas contexto
            //         return ont;
            //     },
            //     required: true
            // },
            // {
            //     step: "login",
            //     command: () => loginInterface(),
            // },
            {
                step: "setup_ont",
                command: (ctx) => setupUserDevice(pon, ctx.ont?.number, serial),
            },
            {
                step: "exit",
                command: () => "exit",
            },
            {
                step: "save",
                command: () => "save",
            },
        ])

        const { context: { ont } } = result
        Logger.info(`ONT TO HOOK: ${JSON.stringify(ont)}`)
    }

    rebootOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    deleteOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}