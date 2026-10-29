import { OltConnectionManager } from "../olt/connection/olt-connection-manager.js";
import { DomainError } from "../../shared/errors/domain-error.js";
import { prisma } from "../db/prisma/prisma-client.js";
import { VaultService } from "../security/vault.service.js";
import { Logger } from "../../shared/utils/logger.js";
import { SSHService } from "../ssh/ssh.service.js";
import type { LocationConfig, Olt, SectorConfig } from "../../domain/olt/entities/sector.entity.js";
import { Brand } from "../../domain/olt/enums/brand.enum.js";
import { FALLBACK_SECTORS, FALLBACK_MIKROTIK_CREDENTIALS as FALLBACK_CREDENTIALS } from "../../config/fallback-sectors.js";

export interface TestConnectionResult {
  success: boolean;
  latencyMs: number;
  message: string;
  error?: string | undefined;
  details?: {
    router?: { success: boolean; latencyMs: number };
    olts?: Array<{
      id: string;
      name: string;
      displayName?: string | null;
      success: boolean;
      latencyMs: number;
      error?: string;
    }>;
  };
}

export class NetworkTopologyService {
  private static cachedTopology: SectorConfig | null = null;
  private static cachedRouterCredentials: Record<string, { username: string; password: string }> = {};
  private static lastCacheUpdate = 0;
  private static readonly CACHE_TTL_MS = 60 * 1000; // 1 minuto de cache

  /**
   * Obtiene la topología completa de red (Routers y sus OLTs) desde PostgreSQL,
   * descifrando contraseñas en memoria de manera segura.
   */
  static async getTopology(forceRefresh = false): Promise<SectorConfig> {
    const now = Date.now();
    if (!forceRefresh && this.cachedTopology && (now - this.lastCacheUpdate < this.CACHE_TTL_MS)) {
      return this.cachedTopology;
    }

    try {
      const routers = await prisma.networkRouter.findMany({
        where: { isActive: true },
        include: {
          olts: {
            where: { isActive: true },
          },
        },
      });

      if (!routers || routers.length === 0) {
        Logger.warn("No hay routers en BD; utilizando topología de respaldo en memoria", "NetworkTopologyService");
        return FALLBACK_SECTORS;
      }

      const topology: SectorConfig = {};
      const routerCredentials: Record<string, { username: string; password: string }> = {};

      for (const r of routers) {
        const decryptedRouterPassword = VaultService.decrypt({
          ciphertext: r.passwordEnc,
          iv: r.passwordIv,
          tag: r.passwordTag,
        });

        routerCredentials[r.name] = {
          username: r.username,
          password: decryptedRouterPassword || FALLBACK_CREDENTIALS.password,
        };

        const oltsMap: Record<string, Olt> = {};
        for (const o of r.olts) {
          const decryptedOltPassword = VaultService.decrypt({
            ciphertext: o.passwordEnc,
            iv: o.passwordIv,
            tag: o.passwordTag,
          });

          oltsMap[o.name] = {
            ip: o.ip,
            username: o.username,
            password: decryptedOltPassword,
            brand: o.brand as Brand,
          };
        }

        topology[r.name] = {
          host: r.host,
          port: r.port,
          olts: oltsMap,
        };
      }

      this.cachedTopology = topology;
      this.cachedRouterCredentials = routerCredentials;
      this.lastCacheUpdate = now;
      return topology;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Logger.error(`Error cargando topología desde BD: ${msg}; utilizando respaldo`, "NetworkTopologyService");
      return this.cachedTopology || FALLBACK_SECTORS;
    }
  }

  /**
   * Obtiene credenciales descifradas de un router específico.
   */
  static async getRouterCredentials(routerName: string): Promise<{ username: string; password: string }> {
    await this.getTopology();
    if (this.cachedRouterCredentials[routerName]) {
      return this.cachedRouterCredentials[routerName]!;
    }
    return {
      username: FALLBACK_CREDENTIALS.username,
      password: FALLBACK_CREDENTIALS.password,
    };
  }

  /**
   * Obtiene la configuración de un router específico por su slug (ej. 'pomasqui').
   */
  /**
   * Obtiene la configuración de un sector de forma asíncrona asegurando datos frescos desde BD.
   */
  static async getSector(sectorName: string): Promise<LocationConfig | null> {
    const topology = await this.getTopology();
    return topology[sectorName] ?? FALLBACK_SECTORS[sectorName] ?? null;
  }

  /**
   * Obtiene credenciales de un router buscando por su host IP.
   */
  static async getRouterCredentialsByHost(host: string): Promise<{ username: string; password: string } | null> {
    await this.getTopology();
    if (this.cachedTopology) {
      for (const [routerName, config] of Object.entries(this.cachedTopology)) {
        if (config.host === host && this.cachedRouterCredentials[routerName]) {
          return this.cachedRouterCredentials[routerName]!;
        }
      }
    }
    return null;
  }

  static async getRouter(routerName: string): Promise<LocationConfig | null> {
    const topology = await this.getTopology();
    return topology[routerName] ?? null;
  }

  /**
   * Invalida la caché en memoria cuando se agregan, editan o eliminan routers/OLTs.
   */
  /**
   * Retorna la topología en caché sincrónicamente.
   * Si la caché aún no está cargada, dispara la recarga asíncrona de fondo.
   */
  static getCachedTopology(): SectorConfig | null {
    if (this.cachedTopology) {
      return this.cachedTopology;
    }
    this.getTopology().catch(() => {});
    return null;
  }

  static invalidateCache(): void {
    this.cachedTopology = null;
    this.cachedRouterCredentials = {};
    this.lastCacheUpdate = 0;
    this.getTopology(true).catch(() => {});
  }

  /**
   * Prueba conectividad SSH contra un router MikroTik en tiempo real.
   */
  static async testRouterConnection(
    host: string,
    port: number,
    username: string,
    password?: string,
    existingRouterNameOrId?: string,
    validateOlts: boolean = true
  ): Promise<TestConnectionResult> {
    let effectivePassword = password;
    let existingRouter: any = null;

    if (existingRouterNameOrId) {
      existingRouter = await prisma.networkRouter.findFirst({
        where: {
          OR: [{ id: existingRouterNameOrId }, { name: existingRouterNameOrId }],
        },
        include: { olts: true },
      });
      if (existingRouter && !effectivePassword) {
        effectivePassword = VaultService.decrypt({
          ciphertext: existingRouter.passwordEnc,
          iv: existingRouter.passwordIv,
          tag: existingRouter.passwordTag,
        });
      }
    }

    if (!effectivePassword) {
      return {
        success: false,
        latencyMs: 0,
        message: "No se proporcionó contraseña para probar la conexión",
      };
    }

    const start = Date.now();
    const ssh = new SSHService(
      {
        host,
        port,
        username,
        password: effectivePassword,
      },
      { timeout: 7000 }
    );

    let routerLatencyMs = 0;
    try {
      await ssh.connect();
      routerLatencyMs = Date.now() - start;
      await ssh.close();
    } catch (err) {
      const latencyMs = Date.now() - start;
      const rawMsg = err instanceof Error ? err.message : String(err);
      let humanError = rawMsg;
      if (rawMsg.includes("All configured authentication methods failed")) {
        humanError = `Credenciales SSH inválidas: El router MikroTik en ${host}:${port} rechazó el usuario '${username}' o su contraseña.`;
      } else if (rawMsg.includes("ECONNREFUSED")) {
        humanError = `Conexión rechazada: El puerto ${port} está cerrado o el router no acepta conexiones SSH en ${host}:${port}.`;
      } else if (rawMsg.includes("ETIMEDOUT") || rawMsg.includes("Timed out") || rawMsg.includes("timed out")) {
        humanError = `Tiempo de espera agotado (Timeout): El router en ${host}:${port} no responde. Revisa la IP pública, VPN o firewall.`;
      } else if (rawMsg.includes("ENOTFOUND")) {
        humanError = `Host no encontrado: No se pudo resolver la dirección '${host}'.`;
      } else if (rawMsg.includes("EHOSTUNREACH")) {
        humanError = `Host inalcanzable: No hay ruta hacia ${host}. Revisa la conectividad de red o VPN.`;
      }
      return {
        success: false,
        latencyMs,
        message: "Fallo de conexión o autenticación con el Router MikroTik",
        error: humanError,
      };
    }

    // Si no se deben validar OLTs o el router no tiene OLTs registradas
    if (!validateOlts || !existingRouter || !existingRouter.olts || existingRouter.olts.length === 0) {
      return {
        success: true,
        latencyMs: routerLatencyMs,
        message: `Conexión y autenticación SSH exitosa con Router (${routerLatencyMs}ms)`,
        details: {
          router: { success: true, latencyMs: routerLatencyMs },
        },
      };
    }

    // Validar cada OLT registrada en el router
    const oltResults: any[] = [];

    let anyOltFailed = false;
    let firstOltError = "";

    for (const olt of existingRouter.olts) {
      const oltTest = await this.testOltConnection(existingRouter.id, olt.id);
      oltResults.push({
        id: olt.id,
        name: olt.name,
        displayName: olt.displayName,
        success: oltTest.success,
        latencyMs: oltTest.latencyMs,
        error: oltTest.error,
      });

      if (!oltTest.success && !anyOltFailed) {
        anyOltFailed = true;
        firstOltError = oltTest.error || oltTest.message;
      }
    }

    const totalLatencyMs = Date.now() - start;

    if (anyOltFailed) {
      return {
        success: false,
        latencyMs: totalLatencyMs,
        message: `Router SSH OK (${routerLatencyMs}ms), pero falló la autenticación con OLT`,
        error: `Fallo en cabecera óptica: ${firstOltError}`,
        details: {
          router: { success: true, latencyMs: routerLatencyMs },
          olts: oltResults,
        },
      };
    }

    return {
      success: true,
      latencyMs: totalLatencyMs,
      message: `Conexión y autenticación exitosas con Router (${routerLatencyMs}ms) y ${existingRouter.olts.length} OLT(s)`,
      details: {
        router: { success: true, latencyMs: routerLatencyMs },
        olts: oltResults,
      },
    };
  }

  static async testOltConnection(
    routerNameOrId: string,
    oltNameOrId: string
  ): Promise<TestConnectionResult> {
    const start = Date.now();
    try {
      const router = await prisma.networkRouter.findFirst({
        where: {
          OR: [{ id: routerNameOrId }, { name: routerNameOrId }],
        },
        include: { olts: true },
      });

      if (!router) {
        return {
          success: false,
          latencyMs: 0,
          message: "Router no encontrado",
          error: `No se encontró el router '${routerNameOrId}'`,
        };
      }

      const olt = router.olts.find(
        (o) => o.id === oltNameOrId || o.name === oltNameOrId
      );

      if (!olt) {
        return {
          success: false,
          latencyMs: 0,
          message: "OLT no encontrada",
          error: `No se encontró la OLT '${oltNameOrId}' en el router '${router.displayName}'`,
        };
      }

      // Si la marca es 's/m' (Sin Marca) o vacía, fallar explícitamente: no existe secuencia de login
      const brandNormalized = (olt.brand || "").toLowerCase().trim();
      if (!brandNormalized || brandNormalized === "s/m" || brandNormalized === Brand.SM) {
        return {
          success: false,
          latencyMs: 0,
          message: "Fallo de autenticación con la OLT",
          error: `La OLT '${olt.displayName || olt.name}' tiene marca 'S/M' (Sin Marca) y no tiene secuencia de login configurada. Selecciona una marca válida (V-SOL, HUAWEI, C-DATA, KINGTYPE) para realizar el login en la terminal.`,
        };
      }

      const routerPassword = VaultService.decrypt({
        ciphertext: router.passwordEnc,
        iv: router.passwordIv,
        tag: router.passwordTag,
      });

      const oltPassword = VaultService.decrypt({
        ciphertext: olt.passwordEnc,
        iv: olt.passwordIv,
        tag: olt.passwordTag,
      });

      const oltEntity: Olt = {
        ip: olt.ip,
        username: olt.username,
        password: oltPassword,
        brand: olt.brand as Brand,
      };

      const manager = new OltConnectionManager();
      const session = await manager.connect(router.host, router.port, oltEntity, {
        username: router.username,
        password: routerPassword,
      });
      const latencyMs = Date.now() - start;
      await session.close();

      return {
        success: true,
        latencyMs,
        message: `Autenticación exitosa con OLT ${olt.displayName || olt.name} (${latencyMs}ms)`,
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      let errorMsg = err instanceof Error ? err.message : String(err);
      if (err instanceof DomainError) {
        errorMsg = err.message;
      }
      return {
        success: false,
        latencyMs,
        message: "Fallo de autenticación con la OLT",
        error: errorMsg,
      };
    }
  }

}
