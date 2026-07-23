// OltSession.ts

import type { OltSessionPort } from "../../../application/ports/olt-session.port.js";
import type { Step } from "../../../domain/olt/entities/step.entity.js";
import type { SSHService } from "../../ssh/ssh.service.js";
import type { CommandInteraction } from "./command-interaction.js";

import type { CommandResult } from "./command-result.js";


export interface OltSession {
    run(command: Step[]): Promise<string>;
    close(): Promise<void>;
}

export class OltSession implements OltSessionPort {

    constructor(
        private readonly ssh: SSHService
    ) { }


    async execute(command: string, interactions?: CommandInteraction[]): Promise<CommandResult> {

        const output = await this.ssh.runCommand(command, interactions);

        return {

            command,

            output

        };

    }

    // async send(command: string) {
    //     return this.ssh.send(command);
    // }

    // async waitFor(regex: RegExp) {
    //     return this.ssh.waitFor(regex);
    // }

    // getBuffer() {
    //     return this.ssh.getBuffer();
    // }

    // clearBuffer() {
    //     return this.ssh.clearBuffer();
    // }

    executeSteps(steps: Step[]) {
        return this.ssh.runSteps(steps);
    }

    close() {
        return this.ssh.close();
    }

}