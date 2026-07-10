import type { ConnectionResult } from "../../../application/olt/interfaces/connection.result.js";
import { MIKROTIK_CREDENTIALS } from "../../../config/sectors.js";
import { ProfileType } from "../../../domain/olt/enums/profile.enum.js";
import type { Olt } from "../../../shared/types/sector.js";
import { Logger } from "../../../shared/utils/logger.js";
import { buildLoginSteps } from "../../login/login.builder.js";
import { initialLoginSteps } from "../../login/login.initial.steps.js";
import { OltSession } from "../../session/olt.session.js";
import { SSHService } from "../../ssh/ssh.service.js";

export class OltConnectionManager {

    async connect(
        host: string,
        olt: Olt
    ): Promise<ConnectionResult> {
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
            ? ProfileType.LEGACY
            : ProfileType.NEW;
        Logger.info(`-------------- PROFILE:  ${profile}`)
        await ssh.runSteps(
            buildLoginSteps(profile, olt)
        );

        return {
            session: new OltSession(ssh),
            profile
        };
    }

}

