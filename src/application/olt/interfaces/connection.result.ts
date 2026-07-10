import type { ProfileType } from "../../../domain/olt/enums/profile.enum.js";
import type { OltSession } from "../../../infrastructure/session/olt.session.js";

export interface ConnectionResult {

    session: OltSession;

    profile: ProfileType;

}