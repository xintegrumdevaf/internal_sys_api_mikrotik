import type { TechnicalDataResponseDTO } from "../../../../application/olt/dto/technical-data.response.dto.js";
import type { Brand } from "../../../../domain/olt/enums/brand.enum.js";
import type { IOltAdapter } from "../../../../domain/olt/interfaces/iolt.adapter.js";
import { CommandExecutor } from "../../session/command-executor.js";
import type { OltSession } from "../../session/olt.session.js";
import { showOntInfo } from "./commands/showOntInfo.command.js";

export class HuaweiAdapter implements IOltAdapter {
    constructor(private readonly session: OltSession, private readonly brand: Brand) { }


    async showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO> {
        const executor = new CommandExecutor(this.session)
        const result = await executor.runFlow([
            {
                step: "ont",
                command: () => showOntInfo(serial)
            }
        ])

        const { history, failedStep, context: { ont } } = result

        return {
            brand: this.brand,
            onu: ont,
            state: {},
            mac: { mac: "" },
            power: 0,
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