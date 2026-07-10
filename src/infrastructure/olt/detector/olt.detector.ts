
import { Brand } from "../../../domain/olt/enums/brand.enum.js";
import { Logger } from "../../../shared/utils/logger.js";
import type { SSHService } from "../../ssh/ssh.service.js";



export class OltDetector {

    constructor(private ssh: SSHService) { }


    async detect(): Promise<Brand> {
        Logger.info(` ------ BEGIN OLT DETECTOR ---------------`)
        const version = await this.ssh.runCommand("show ont ?");
        Logger.info(` ------ OLT DATA : ${version}`)
        if (!version.includes("Unknown command") || !version.includes("There is no matched command")) {
            return Brand.CDATA;
        }

        return Brand.VSOL


    }
}