import express from "express"

import { showOntController } from "../controllers/otl.controller.js"

const router = express.Router()

router.post("/show-ont", showOntController)

export default router