import { Router } from "express"
import { mikrotikController } from "../../container/index.js"

const router: Router = Router()

router.post("/client-status", mikrotikController.getStatus)
router.post("/client-queue", mikrotikController.getQueue)
router.post("/client-bandwidth", mikrotikController.getQueue)
router.post("/reactivate", mikrotikController.reactivate)
router.post("/cut", mikrotikController.cut)

export default router
