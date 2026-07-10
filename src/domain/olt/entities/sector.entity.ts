import type { Brand } from "../enums/brand.enum.js";

export type SectorConfig = Record<string, LocationConfig>

export interface Olt {
    ip: string;
    username: string;
    password: string
    brand: Brand
}

export interface LocationConfig {
    host: string;
    olts: Record<string, Olt>
}