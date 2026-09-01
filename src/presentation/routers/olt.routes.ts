import { Router } from "express"
import { oltController } from "../../container/index.js"

const router: Router = Router()

router.post("/technical-data", oltController.collectData)
router.post("/device-status", oltController.getStatus)
router.post("/reactivate", oltController.reactivate)

export default router

