import type { Olt } from "../../domain/olt/entities/sector.entity.js"
import type { OltSessionPort } from "./olt-session.port.js"

export interface OltConnectionPort {
  connect(host: string, port: number, olt: Olt): Promise<OltSessionPort>
}
