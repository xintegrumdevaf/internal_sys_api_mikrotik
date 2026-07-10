// OltSession.ts

import type { Step } from "../../shared/types/step.js";
import type { SSHService } from "../ssh/ssh.service.js";
import type { CommandResult } from "./command-result.js";


export interface OltSession {
    run(command: Step[]): Promise<string>;
    close(): Promise<void>;
}

export class OltSession {

    constructor(
        private readonly ssh: SSHService
    ) { }


    async execute(command: string): Promise<CommandResult> {

        const output = await this.ssh.runCommand(command);

        return {

            command,

            output

        };

    }

    executeSteps(steps: Step[]) {
        return this.ssh.runSteps(steps)
    }

    close() {
        return this.ssh.close()
    }

}