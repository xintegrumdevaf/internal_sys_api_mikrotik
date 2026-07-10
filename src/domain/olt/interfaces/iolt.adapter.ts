import type { TechnicalDataResponseDTO } from "../../../application/olt/dto/technical-data.response.dto.js";


export interface IOltAdapter {

    showOnu(pon: string, serial: string): Promise<TechnicalDataResponseDTO>;

    rebootOnt(serial: string): Promise<void>;

    deleteOnt(serial: string): Promise<void>;

}