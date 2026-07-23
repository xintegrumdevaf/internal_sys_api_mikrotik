import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";
import type { OltAdapterPort } from "../../../../application/ports/olt-adapter.port.js";
import { Logger } from "../../../../shared/utils/logger.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { OltSession } from "../../session/olt.session.js";
import { confirmOnuState } from "./commands/confirm-onu-state.command.js";
import { createService } from "./commands/create-service-port.command.js";
import { loginInterface } from "./commands/loginInterface.command.js";
import { setupUserDevice } from "./commands/setup-user-device.command.js";
import { showOntHookDevices } from "./commands/show-ont-hook-devices.command.js";
import { showOntInfo } from "./commands/showOntInfo.command.js";
import { showOntMac } from "./commands/showOntMac.command.js";
import { showOntPower } from "./commands/showOntPower.command.js";
import { findMacByOntId, parseMacTable } from "./parsers/mac.parser.js";
import { parseOntInfo } from "./parsers/ont.parser.js";
import { parseRxOpticalPower } from "./parsers/power.parser.js";

export class HuaweiAdapter implements OltAdapterPort {
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

    async setupUserDevice(pon: string, serial: string): Promise<void> {
        const executor = new CommandExecutor(this.session)
        const result = await executor.runFlow([
            {
                step: "ont_to_hook",
                command: () => showOntHookDevices(),
                // parser: (output) => {
                //     const onts = parseAutofindOnts(output);
                //     Logger.info(`ONTS: ${JSON.stringify(onts)}`)
                //     return findOntBySN(onts, serial) ?? null;
                // },
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
            // {
            //     step: "setup_ont",
            //     command: (ctx) => setupUserDevice(ctx.ont_to_hook?.port, ctx.ont?.id, pon, serial),
            // },
            {
                step: "quit",
                command: () => "quit",
            },
            {
                step: "quit",
                command: () => "quit",
            },
            // {
            //     step: "create_service",
            //     command: (ctx) => createService(),
            // },
            // {
            //     step: "confirm_state",
            //     command: (ctx) => confirmOnuState(),
            // },
        ])

        // const { history, failedStep, context: { ont_to_hook, ont } } = result
        // Logger.info(`ONT TO HOOK: ${ont_to_hook}`)
        // Logger.info(`ONT: ${ont}`)

        throw new Error("Method not implemented.");
    }


    rebootOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deleteOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}