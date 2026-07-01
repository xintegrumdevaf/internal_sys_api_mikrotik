import { open } from "../ssh/session.service.js"

export class OltService {
    async showOnt(sector: string, olt: string, pon: number, serial: string) {
        const ssh = await open(sector, olt)

        return await ssh.showOnt(pon, serial)
    }
}