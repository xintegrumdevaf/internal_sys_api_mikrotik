import type { Brand } from "../../../domain/olt/enums/brand.enum.js";
import type { OltSession } from "../../../infrastructure/olt/session/olt.session.js";

export interface ConnectionResult {

    session: OltSession;

    brand: Brand;

}