import { Router } from "express"
import { oltController } from "../../container/olt.container.js"

const router: Router = Router()

router.post("/showTechnicalData", oltController.collectData)

export default router