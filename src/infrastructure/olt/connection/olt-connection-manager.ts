import { MIKROTIK_CREDENTIALS } from "../../../config/sectors.js";
import { Logger } from "../../../shared/utils/logger.js";
import { OltSession } from "../session/olt.session.js";
import { SSHService } from "../../ssh/ssh.service.js";
import type { Olt } from "../../../domain/olt/entities/sector.entity.js";
import { Brand } from "../../../domain/olt/enums/brand.enum.js";
import { loginSteps as cdataLoginSteps } from "../adapters/c-data/steps/login.steps.js";
import { loginSteps as vsolLoginSteps } from "../adapters/v-sol/steps/login.steps.js";
import { loginSteps as huaweiLoginSteps } from "../adapters/huawei/steps/login.steps.js";

const LOGIN_STEPS = {
    [Brand.CDATA]: cdataLoginSteps,
    [Brand.HUAWEI]: huaweiLoginSteps,
    [Brand.VSOL]: vsolLoginSteps,
    [Brand.KINGTYPE]: () => [],
    [Brand.SM]: () => []
}

export class OltConnectionManager {

    async connect(
        host: string,
        olt: Olt
    ): Promise<OltSession> {
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
        // await ssh.runSteps(initialLoginSteps(olt));

        // const type = await ssh.waitForAny([
        //     /login:/i,
        //     /User name:/i
        // ]);
        // Logger.info(`-------------- TYPE:  ${type}`)
        // const brand = type === 0
        //     ? Brand.VSOL
        //     : Brand.CDATA;
        Logger.info(`-------------- BRAND:  ${olt.brand}`)
        const loginSteps = LOGIN_STEPS[olt.brand]
        await ssh.runSteps(
            loginSteps(olt)
        );

        // return {
        //     session: new OltSession(ssh),
        //     brand: olt.brand
        // };

        return new OltSession(ssh)
    }

}

