import { MIKROTIK_CREDENTIALS, SECTORS } from "../../config/sectors.js";
import { Logger } from "../../utils/logger.js";
import { loginSteps } from "../command/login.step.js";
import { OltSession } from "../otl/oltSession.js";
import { SSHService } from "./ssh.service.js";

export const open = async (sector: string, oltKey: string) => {
    const sectorConfig = SECTORS[sector];
    Logger.info(sector)

    if (!sectorConfig) {
        throw new Error(`Sector ${sector} no existe`);
    }

    const olt = sectorConfig.olts[oltKey];
    Logger.info(`OLT: ${JSON.stringify(olt)}`)

    if (!olt) {
        throw new Error(`OLT ${oltKey} no existe en ${sector}`);
    }

    const sshConfig = {
        host: sectorConfig.host,
        port: MIKROTIK_CREDENTIALS.port ?? 22,
        username: MIKROTIK_CREDENTIALS.username,
        password: MIKROTIK_CREDENTIALS.password
    };
    Logger.info(`SSH CONFIG: ${JSON.stringify(sshConfig)}`)

    const ssh = new SSHService(sshConfig);

    await ssh.connect();
    await ssh.openShell();
    Logger.info("-------------- BEGIN LOGIN STEPS ------------------")
    await ssh.runSteps(loginSteps(olt));

    return new OltSession(ssh);
}