import { Router } from "express";
import { diagnosticController } from "../../container/diagnostic.container.js";

const router: Router = Router()

router.post("/", diagnosticController.analyze)
router.post("/continue", diagnosticController.continue)
// router.post("/check")
// router.post("/media")

export default router