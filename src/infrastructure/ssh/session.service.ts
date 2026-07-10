import { MIKROTIK_CREDENTIALS } from "../../config/sectors.js";
import type { Olt } from "../../shared/types/sector.js";
import { Logger } from "../../shared/utils/logger.js";
import { OltSession } from "../session/olt.session.js";
import { SSHService } from "./ssh.service.js";
import { initialLoginSteps } from "../login/login.initial.steps.js";
import { buildLoginSteps } from "../login/login.builder.js";

export const open = async (host: string, olt: Olt) => {

    const sshConfig = {
        host: host,
        port: MIKROTIK_CREDENTIALS.port ?? 22,
        username: MIKROTIK_CREDENTIALS.username,
        password: MIKROTIK_CREDENTIALS.password
    };
    Logger.info(`SSH CONFIG: ${JSON.stringify(sshConfig)}`)

    const ssh = new SSHService(sshConfig);

    await ssh.connect();
    await ssh.openShell();
    Logger.info("-------------- BEGIN LOGIN STEPS ------------------")
    await ssh.runSteps(initialLoginSteps(olt));

    const type = await ssh.waitForAny([
        /login:/i,
        /User name:/i
    ]);
    Logger.info(`-------------- TYPE:  ${type}`)
    const profile = type === 0
        ? "legacy"
        : "new";
    Logger.info(`-------------- PROFILE:  ${profile}`)
    await ssh.runSteps(
        buildLoginSteps(profile, olt)
    );

    return {
        session: new OltSession(ssh),
        profile
    };
}