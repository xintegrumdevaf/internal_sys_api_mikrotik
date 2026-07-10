import type { OltSession } from "../session/olt.session.js";
import { LegacyAdapter } from "./legacy/legacy.adapter.js";
import { NewAdapter } from "./new/new.adapter.js";



export class AdapterFactory {
    static create(profile: string, session: OltSession) {
        switch (profile) {
            case "legacy":
                return new LegacyAdapter(session, profile)
            case "new":
                return new NewAdapter(session, profile)
            default:
                throw new Error("Marca no soportada")
        }
    }
}