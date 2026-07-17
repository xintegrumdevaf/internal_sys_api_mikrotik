import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";
import type { IOltAdapter } from "../../../../domain/olt/interfaces/iolt.adapter.js";
import { Logger } from "../../../../shared/utils/logger.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { OltSession } from "../../session/olt.session.js";
import { loginInterface } from "./commands/loginInterface.command.js";
import { showOntInfo } from "./commands/showOntInfo.command.js";
import { showOntMac } from "./commands/showOntMac.command.js";
import { showOntPower } from "./commands/showOntPower.command.js";
import { findMacByOntId, parseMacTable } from "./parsers/mac.parser.js";
import { parseOntInfo } from "./parsers/ont.parser.js";
import { parseRxOpticalPower } from "./parsers/power.parser.js";

export class HuaweiAdapter implements IOltAdapter {
    constructor(private readonly session: OltSession, private readonly brand: Brand) { }


    async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {
        const executor = new CommandExecutor(this.session)
        const result = await executor.runFlow([
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
                parser: (_: any, ctx: any) => {
                    const ont = parseOntInfo(_);

                    if (!ont) throw new Error("ONT no encontrada");

                    ctx.ont = ont; // 👈 guardas contexto
                    return ont;
                },
                required: true,
            },

            {
                step: "login",
                command: (ctx: any) => loginInterface(ctx?.ont?.slot),
            },
            {
                step: "power",
                command: (ctx: any) => showOntPower(pon, ctx.ont.id),
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
                parser: (out: any) => parseRxOpticalPower(out)
                // parser: (out: any, ctx: any) => parseOntRxPower(out)
            },
            {
                step: "exit interface",
                command: (ctx: any) => "quit"
            },
            {
                step: "mac",
                command: (ctx: any) =>
                    showOntMac(`${ctx.ont.frame}/${ctx.ont.slot}/${ctx.ont.pon}`),
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
                parser: (out: any, ctx: any) => {
                    const macs = parseMacTable(out);
                    Logger.info(`MACS HUAWEI ======= ${macs}`)
                    return findMacByOntId(macs, ctx.ont.id) ?? null;
                }

            }
        ])

        const { history, failedStep, context: { ont, power, mac } } = result

        return {
            brand: this.brand,
            onu: ont,
            state: ont ? {
                "runState": ont.runState,
                "configState": ont.configState,
                "matchState": ont.matchState,
            } : null,
            mac,
            power,
            _history: history,
            failedStep: failedStep ?? null
        }
    }
    rebootOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deleteOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}