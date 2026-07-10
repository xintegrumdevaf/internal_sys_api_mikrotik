import type { OnuResponse } from "../../shared/types/onu.js";

export interface OltAdapter {

    showOnu(pon: string, serial: string): Promise<OnuResponse>;

    rebootOnt(serial: string): Promise<void>;

    deleteOnt(serial: string): Promise<void>;

}