import { Router } from "express";
import { NetworkController } from "../controllers/network.controller.js";

const router: Router = Router();
const controller = new NetworkController();

// CRUD Routers
router.get("/routers", controller.listRouters);
router.get("/routers/:id", controller.getRouterById);
router.post("/routers", controller.createRouter);
router.put("/routers/:id", controller.updateRouter);
router.delete("/routers/:id", controller.deleteRouter);
router.get("/routers/:id/password", controller.getRouterPassword);

// CRUD OLTs
router.post("/routers/:routerId/olts", controller.createOlt);
router.put("/routers/:routerId/olts/:oltId", controller.updateOlt);
router.delete("/routers/:routerId/olts/:oltId", controller.deleteOlt);
router.get("/routers/:routerId/olts/:oltId/password", controller.getOltPassword);

// Test Connection
router.post("/test-connection", controller.testConnection);

export default router;
