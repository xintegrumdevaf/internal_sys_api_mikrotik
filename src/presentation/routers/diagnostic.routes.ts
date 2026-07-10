import { Router } from "express";
import { diagnosticController } from "../../container/diagnostic.container.js";

const router: Router = Router()

router.post("/", diagnosticController.performDiagnostic)
// router.post("/check")
// router.post("/media")

export default router