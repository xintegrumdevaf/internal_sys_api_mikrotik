import type { OltConnectionPort } from "../../../application/ports/olt-connection.port.js";
import { MIKROTIK_CREDENTIALS } from "../../../config/sectors.js";
import { NetworkTopologyService } from "../../network/network-topology.service.js";
import { Logger } from "../../../shared/utils/logger.js";
import { OltSession } from "../session/olt.session.js";
import { SSHService } from "../../ssh/ssh.service.js";
import type { Olt } from "../../../domain/olt/entities/sector.entity.js";
import { Brand } from "../../../domain/olt/enums/brand.enum.js";
import { OltAuthError } from "../../../domain/olt/exceptions/olt-auth.error.js";
import { loginSteps as cdataLoginSteps } from "../adapters/c-data/steps/login.steps.js";
import { loginSteps as vsolLoginSteps } from "../adapters/v-sol/steps/login.steps.js";
import { loginSteps as huaweiLoginSteps } from "../adapters/huawei/steps/login.steps.js";
import { loginSteps as kingtypeLoginSteps } from "../adapters/kingtype/steps/login.steps.js";

export const LOGIN_STEPS = {
    [Brand.CDATA]: cdataLoginSteps,
    [Brand.HUAWEI]: huaweiLoginSteps,
    [Brand.VSOL]: vsolLoginSteps,
    [Brand.KINGTYPE]: kingtypeLoginSteps,
    [Brand.SM]: () => []
}

export class OltConnectionManager implements OltConnectionPort {

    async connect(
        host: string,
        port: number,
        olt: Olt,
        routerCredentials?: { username: string; password?: string }
    ): Promise<OltSession> {
        let username = routerCredentials?.username;
        let password = routerCredentials?.password;

        if (!username || !password) {
            const dbCreds = await NetworkTopologyService.getRouterCredentialsByHost(host);
            if (dbCreds) {
                username = username || dbCreds.username;
                password = password || dbCreds.password;
            }
        }

        username = username || MIKROTIK_CREDENTIALS.username;
        password = password || MIKROTIK_CREDENTIALS.password;

        const sshConfig = {
            host: host,
            port,
            username,
            password
        };
        Logger.info(`SSH CONFIG: ${JSON.stringify({ ...sshConfig, password: "••••" })}`);

        const getSteps = LOGIN_STEPS[olt.brand];
        const steps = getSteps ? getSteps(olt) : [];

        if (!steps || steps.length === 0) {
            throw new OltAuthError(
                "OLT_UNSUPPORTED_BRAND",
                `La OLT '${olt.ip}' tiene marca '${olt.brand || "Sin Marca"}' (S/M) y no cuenta con una secuencia de login terminal configurada. Selecciona un fabricante soportado (V-SOL, HUAWEI, C-DATA, KINGTYPE) para realizar el login en la terminal.`
            );
        }

        const ssh = new SSHService(sshConfig);

        await ssh.connect();
        await ssh.openShell();
        Logger.info("-------------- BEGIN LOGIN STEPS ------------------");
        Logger.info(`-------------- BRAND:  ${olt.brand}`);

        try {
            await ssh.runSteps(steps);
        } catch (err) {
            await ssh.close().catch(() => {});
            throw err;
        }

        return new OltSession(ssh);
    }
}
