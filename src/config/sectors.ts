import type { SectorConfig } from "../domain/olt/entities/sector.entity.js";
import { FALLBACK_MIKROTIK_CREDENTIALS, FALLBACK_SECTORS } from "./fallback-sectors.js";
import { NetworkTopologyService } from "../infrastructure/network/network-topology.service.js";

export const MIKROTIK_CREDENTIALS = FALLBACK_MIKROTIK_CREDENTIALS;

/**
 * Topología dinámica de Routers y OLTs.
 * Lee desde la base de datos PostgreSQL con credenciales descifradas vía VaultService (AES-256-GCM).
 * Si la base de datos aún no ha cargado o falla, devuelve la topología de respaldo estática de forma transparente.
 */
export const SECTORS: SectorConfig = new Proxy(FALLBACK_SECTORS, {
  get(target, prop: string | symbol) {
    if (typeof prop !== "string") {
      return Reflect.get(target, prop);
    }
    const dynamicTopology = NetworkTopologyService.getCachedTopology();
    if (dynamicTopology && prop in dynamicTopology) {
      return dynamicTopology[prop];
    }
    return target[prop];
  },
  ownKeys(target) {
    const dynamicTopology = NetworkTopologyService.getCachedTopology();
    if (dynamicTopology) {
      return Object.keys(dynamicTopology);
    }
    return Reflect.ownKeys(target);
  },
  getOwnPropertyDescriptor(target, prop) {
    const dynamicTopology = NetworkTopologyService.getCachedTopology();
    if (dynamicTopology && typeof prop === "string" && prop in dynamicTopology) {
      return {
        configurable: true,
        enumerable: true,
        value: dynamicTopology[prop],
        writable: false,
      };
    }
    return Reflect.getOwnPropertyDescriptor(target, prop);
  },
});
