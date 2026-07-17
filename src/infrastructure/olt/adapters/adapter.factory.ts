import { Brand } from "../../../domain/olt/enums/brand.enum.js";
import type { OltSession } from "../session/olt.session.js";
import { CDataAdapter } from "./c-data/c-data.adapter.js";
import { HuaweiAdapter } from "./huawei/huawei.adapter.js";
import { KingtypeAdapter } from "./kingtype/kingtype.adapter.js";
import { VSolAdapter } from "./v-sol/v-sol.adapter.js";

export class AdapterFactory {
    static create(session: OltSession, brand: string) {
        switch (brand) {
            case Brand.VSOL:
                return new VSolAdapter(session, brand)
            case Brand.CDATA:
                return new CDataAdapter(session, brand)
            case Brand.HUAWEI:
                return new HuaweiAdapter(session, brand)
            case Brand.KINGTYPE:
                return new KingtypeAdapter(session, brand)
            default:
                throw new Error("Marca no soportada")
        }
    }
}