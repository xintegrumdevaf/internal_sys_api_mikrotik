import { Router } from "express"
import { diagnosticController } from "../../container/index.js"

const router: Router = Router()

router.post("/", diagnosticController.analyze)
router.post("/continue", diagnosticController.continue)

export default router
