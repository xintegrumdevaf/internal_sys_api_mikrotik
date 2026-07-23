import { Router } from "express"
import { oltController } from "../../container/index.js"

const router: Router = Router()

router.post("/technical-data", oltController.collectData)

export default router
