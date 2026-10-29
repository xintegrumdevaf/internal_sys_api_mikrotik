import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../infrastructure/db/prisma/prisma-client.js";
import { VaultService } from "../../infrastructure/security/vault.service.js";
import { NetworkTopologyService } from "../../infrastructure/network/network-topology.service.js";
import { Logger } from "../../shared/utils/logger.js";

export class NetworkController {
  /**
   * GET /api/v1/network/routers
   * Lista todos los routers y sus OLTs con contraseñas enmascaradas.
   */
  listRouters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const routers = await prisma.networkRouter.findMany({
        orderBy: { name: "asc" },
        include: {
          olts: {
            orderBy: { name: "asc" },
          },
        },
      });

      const response = routers.map((r) => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        host: r.host,
        port: r.port,
        username: r.username,
        password: VaultService.mask(),
        hasPassword: Boolean(r.passwordEnc),
        isActive: r.isActive,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        olts: r.olts.map((o) => ({
          id: o.id,
          routerId: o.routerId,
          name: o.name,
          displayName: o.displayName,
          ip: o.ip,
          brand: o.brand,
          username: o.username,
          password: VaultService.mask(),
          hasPassword: Boolean(o.passwordEnc),
          slot: o.slot,
          isActive: o.isActive,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        })),
      }));

      res.json({
        success: true,
        count: response.length,
        routers: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/network/routers/:id
   */
  getRouterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const router = await prisma.networkRouter.findUnique({
        where: { id },
        include: { olts: true },
      });

      if (!router) {
        res.status(404).json({ success: false, message: "Router no encontrado" });
        return;
      }

      res.json({
        success: true,
        router: {
          id: router.id,
          name: router.name,
          displayName: router.displayName,
          host: router.host,
          port: router.port,
          username: router.username,
          password: VaultService.mask(),
          hasPassword: Boolean(router.passwordEnc),
          isActive: router.isActive,
          createdAt: router.createdAt,
          updatedAt: router.updatedAt,
          olts: router.olts.map((o) => ({
            id: o.id,
            routerId: o.routerId,
            name: o.name,
            displayName: o.displayName,
            ip: o.ip,
            brand: o.brand,
            username: o.username,
            password: VaultService.mask(),
            hasPassword: Boolean(o.passwordEnc),
            slot: o.slot,
            isActive: o.isActive,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/network/routers
   * Registra un nuevo router con contraseña cifrada en AES-256-GCM.
   */
  createRouter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, displayName, host, port, username, password } = req.body;

      if (!name || !displayName || !host || !username || !password) {
        res.status(400).json({
          success: false,
          message: "Los campos name, displayName, host, username y password son obligatorios",
        });
        return;
      }

      const slug = String(name).trim().toLowerCase();
      const existing = await prisma.networkRouter.findUnique({ where: { name: slug } });
      if (existing) {
        res.status(409).json({ success: false, message: `El router '${slug}' ya existe` });
        return;
      }

      const enc = VaultService.encrypt(password);
      const created = await prisma.networkRouter.create({
        data: {
          name: slug,
          displayName: String(displayName).trim(),
          host: String(host).trim(),
          port: Number(port) || 8322,
          username: String(username).trim(),
          passwordEnc: enc.ciphertext,
          passwordIv: enc.iv,
          passwordTag: enc.tag,
          isActive: true,
        },
      });

      NetworkTopologyService.invalidateCache();
      Logger.info(`Router '${created.name}' registrado exitosamente`, "NetworkController");

      res.status(201).json({
        success: true,
        message: "Router creado exitosamente",
        router: {
          id: created.id,
          name: created.name,
          displayName: created.displayName,
          host: created.host,
          port: created.port,
          username: created.username,
          password: VaultService.mask(),
          isActive: created.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/network/routers/:id
   * Actualiza datos de un router. Si la contraseña viene vacía, no se sobrescribe.
   */
  updateRouter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { displayName, host, port, username, password, isActive } = req.body;

      const existing = await prisma.networkRouter.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, message: "Router no encontrado" });
        return;
      }

      const updateData: Record<string, unknown> = {};
      if (displayName !== undefined) updateData.displayName = String(displayName).trim();
      if (host !== undefined) updateData.host = String(host).trim();
      if (port !== undefined) updateData.port = Number(port);
      if (username !== undefined) updateData.username = String(username).trim();
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      if (password && typeof password === "string" && password.trim().length > 0) {
        const enc = VaultService.encrypt(password.trim());
        updateData.passwordEnc = enc.ciphertext;
        updateData.passwordIv = enc.iv;
        updateData.passwordTag = enc.tag;
      }

      const updated = await prisma.networkRouter.update({
        where: { id },
        data: updateData,
      });

      NetworkTopologyService.invalidateCache();
      Logger.info(`Router '${updated.name}' actualizado`, "NetworkController");

      res.json({
        success: true,
        message: "Router actualizado exitosamente",
        router: {
          id: updated.id,
          name: updated.name,
          displayName: updated.displayName,
          host: updated.host,
          port: updated.port,
          username: updated.username,
          password: VaultService.mask(),
          isActive: updated.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/network/routers/:id
   */
  deleteRouter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await prisma.networkRouter.delete({ where: { id } });
      NetworkTopologyService.invalidateCache();
      Logger.info(`Router '${id}' eliminado`, "NetworkController");
      res.json({ success: true, message: "Router eliminado exitosamente" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/network/routers/:routerId/olts
   * Agrega una OLT asociada a un router.
   */
  createOlt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const routerId = req.params.routerId as string;
      const { name, displayName, ip, brand, username, password, slot } = req.body;

      if (!name || !ip || !brand || !password) {
        res.status(400).json({
          success: false,
          message: "Los campos name, ip, brand y password son obligatorios",
        });
        return;
      }

      const router = await prisma.networkRouter.findUnique({ where: { id: routerId } });
      if (!router) {
        res.status(404).json({ success: false, message: "Router asociado no encontrado" });
        return;
      }

      const slug = String(name).trim();
      const enc = VaultService.encrypt(password);

      const created = await prisma.networkOlt.create({
        data: {
          routerId: router.id,
          name: slug,
          displayName: displayName ? String(displayName).trim() : `OLT ${slug}`,
          ip: String(ip).trim(),
          brand: String(brand).trim().toLowerCase(),
          username: username ? String(username).trim() : "admin",
          passwordEnc: enc.ciphertext,
          passwordIv: enc.iv,
          passwordTag: enc.tag,
          slot: slot ? String(slot).trim() : null,
          isActive: true,
        },
      });

      NetworkTopologyService.invalidateCache();
      Logger.info(`OLT '${created.name}' registrada en router '${router.name}'`, "NetworkController");

      res.status(201).json({
        success: true,
        message: "OLT registrada exitosamente",
        olt: {
          id: created.id,
          routerId: created.routerId,
          name: created.name,
          displayName: created.displayName,
          ip: created.ip,
          brand: created.brand,
          username: created.username,
          password: VaultService.mask(),
          isActive: created.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/network/routers/:routerId/olts/:oltId
   */
  updateOlt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const oltId = req.params.oltId as string;
      const { displayName, ip, brand, username, password, slot, isActive } = req.body;

      const existing = await prisma.networkOlt.findUnique({ where: { id: oltId } });
      if (!existing) {
        res.status(404).json({ success: false, message: "OLT no encontrada" });
        return;
      }

      const updateData: Record<string, unknown> = {};
      if (displayName !== undefined) updateData.displayName = String(displayName).trim();
      if (ip !== undefined) updateData.ip = String(ip).trim();
      if (brand !== undefined) updateData.brand = String(brand).trim().toLowerCase();
      if (username !== undefined) updateData.username = String(username).trim();
      if (slot !== undefined) updateData.slot = slot ? String(slot).trim() : null;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      if (password && typeof password === "string" && password.trim().length > 0) {
        const enc = VaultService.encrypt(password.trim());
        updateData.passwordEnc = enc.ciphertext;
        updateData.passwordIv = enc.iv;
        updateData.passwordTag = enc.tag;
      }

      const updated = await prisma.networkOlt.update({
        where: { id: oltId },
        data: updateData,
      });

      NetworkTopologyService.invalidateCache();
      Logger.info(`OLT '${updated.name}' actualizada`, "NetworkController");

      res.json({
        success: true,
        message: "OLT actualizada exitosamente",
        olt: {
          id: updated.id,
          name: updated.name,
          displayName: updated.displayName,
          ip: updated.ip,
          brand: updated.brand,
          username: updated.username,
          password: VaultService.mask(),
          isActive: updated.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/network/routers/:routerId/olts/:oltId
   */
  deleteOlt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const oltId = req.params.oltId as string;
      await prisma.networkOlt.delete({ where: { id: oltId } });
      NetworkTopologyService.invalidateCache();
      res.json({ success: true, message: "OLT eliminada exitosamente" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/network/test-connection
   * Realiza un handshake de conectividad SSH en vivo contra un router para validar estado y latencia.
   */
  testConnection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, host, port, username, password, routerId, routerName, oltId, oltName } = req.body;

      // Si se solicita probar una OLT
      if (type === "olt" || oltId || oltName) {
        const rIdentifier = routerId || routerName;
        const oIdentifier = oltId || oltName;
        if (!rIdentifier || !oIdentifier) {
          res.status(400).json({
            success: false,
            message: "Se requiere router y OLT para probar la autenticación",
          });
          return;
        }

        const result = await NetworkTopologyService.testOltConnection(rIdentifier, oIdentifier);
        res.json(result);
        return;
      }

      if (!host && !routerId && !routerName) {
        res.status(400).json({
          success: false,
          message: "Se requiere al menos 'host' o 'routerId'/'routerName' para probar la conexión",
        });
        return;
      }

      let effectiveHost = host;
      let effectivePort = port !== undefined ? Number(port) : undefined;
      let effectiveUsername = username;
      let effectivePassword = password;
      let lookupName = routerName;

      const lookupCondition = routerId ? { id: routerId } : routerName ? { name: routerName } : null;
      if (lookupCondition) {
        const found = await prisma.networkRouter.findUnique({ where: lookupCondition as any });
        if (found) {
          effectiveHost = effectiveHost || found.host;
          effectivePort = effectivePort !== undefined ? effectivePort : found.port;
          effectiveUsername = effectiveUsername || found.username;
          lookupName = found.name;
        }
      }
      effectivePort = effectivePort || 8322;

      const result = await NetworkTopologyService.testRouterConnection(
        effectiveHost,
        effectivePort,
        effectiveUsername,
        effectivePassword,
        lookupName
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/network/routers/:id/password
   * Obtiene la contraseña descifrada de un router (solo para administradores autorizados).
   */
  getRouterPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const router = await prisma.networkRouter.findUnique({ where: { id } });
      if (!router) {
        res.status(404).json({ success: false, message: "Router no encontrado" });
        return;
      }
      const password = VaultService.decrypt({
        ciphertext: router.passwordEnc,
        iv: router.passwordIv,
        tag: router.passwordTag,
      });
      res.json({ success: true, password });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/network/routers/:routerId/olts/:oltId/password
   * Obtiene la contraseña descifrada de una OLT.
   */
  getOltPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const oltId = req.params.oltId as string;
      const olt = await prisma.networkOlt.findUnique({ where: { id: oltId } });
      if (!olt) {
        res.status(404).json({ success: false, message: "OLT no encontrada" });
        return;
      }
      const password = VaultService.decrypt({
        ciphertext: olt.passwordEnc,
        iv: olt.passwordIv,
        tag: olt.passwordTag,
      });
      res.json({ success: true, password });
    } catch (error) {
      next(error);
    }
  };

}
