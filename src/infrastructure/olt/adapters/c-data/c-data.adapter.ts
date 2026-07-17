import type { OltSession } from "../../session/olt.session.js";
import { loginInterface } from "./commands/loginInterface.command.js";
import { showOntMac } from "./commands/showOntMac.command.js";
import { showOntInfo } from "./commands/showOntInfo.command.js";
import { showOntPower } from "./commands/showOntPower.command.js";
import { parseOntInfo } from "./parsers/ont.parser.js";
import { parseOntRxPower } from "./parsers/power.parser.js";
import { parseMacTable } from "./parsers/mac.parser.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { IOltAdapter } from "../../../../domain/olt/interfaces/iolt.adapter.js";
import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";

export class CDataAdapter implements IOltAdapter {
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

            onu: ont,

            state: {
                adminState: ont?.adminState ?? "unknown",
                runState: ont?.runState ?? "unknown",
                configState: ont?.configState ?? "unknown",
                matchState: ont?.matchState ?? "unknown"
            },

            power: result.context.power ?? null,

            mac: result.context.mac ?? null,

            _history: result.history,

            failedStep: result.failedStep ?? null
        };
    }

    // async showOnu(pon: string, serial: string): Promise<OnuResponse> {
    //     await this.session.execute(loginInterface())
    //     const raw = await this.session.execute(showOntInfo(serial))
    //     const ont = parseOntInfo(raw)

    //     Logger.info(`ONT: ${JSON.stringify(ont)}`)
    //     const powerRaw = await this.session.execute(showOntPower(pon, ont?.id!))
    //     const power = parseOntRxPower(powerRaw)
    //     Logger.info(`POWER : ${power}`)
    //     await this.session.execute("exit")
    //     const macRaw = await this.session.execute(showOntMac(`${ont?.frame}/${ont?.slot}/${ont?.pon}`))
    //     const macs = parseMacTable(macRaw)

    //     const mac = macs.find(mac => mac.onu === ont?.id)
    //     Logger.info(`MAC : ${JSON.stringify(mac)}`)

    //     return {} as OnuResponse

    // }
    rebootOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deleteOnt(serial: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}