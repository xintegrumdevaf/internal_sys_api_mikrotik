// OltSession.ts

import type { Step } from "../../types/step.js";
import { Logger } from "../../utils/logger.js";
import { showOntSteps } from "../command/showOnt.steps.js";
import type { SSHService } from "../ssh/ssh.service.js";


export interface OltSession {
    run(command: Step[]): Promise<string>;
    close(): Promise<void>;
}

export class OltSession {

    constructor(
        private readonly ssh: SSHService
    ) { }

    async showOnt(pon: number, serial: string) {
        // await this.ssh.runCommand("end"); // salir de config mode
        // return this.ssh.runSteps(showOntSteps(serial));
        const result = this.ssh.runCommand(`show onu info ${pon}`)
        Logger.info(`RESULT: ${result}`)
        return result
    }

    async showOntState(pon: number, id: string) {
        // await this.ssh.runCommand("end"); // salir de config mode
        // return this.ssh.runSteps(showOntSteps(serial));
        const result = this.ssh.runCommand(`show onu state ${pon} ${id}`)
        Logger.info(`STATE RESULT: ${result}`)
        return result
    }

}