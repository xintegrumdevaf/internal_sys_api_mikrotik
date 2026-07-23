import express, { type Express, type Request, type Response } from "express"
import oltRoutes from "./presentation/routers/olt.routes.js"
import diagnosticRoutes from "./presentation/routers/diagnostic.routes.js"
import { errorHandler } from "./presentation/middlewares/error-handler.middleware.js"

const app: Express = express()

app.use(express.json())

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" })
})

app.use("/api/v1/olt", oltRoutes)
app.use("/api/v1/diagnostic", diagnosticRoutes)

app.use(errorHandler)

export default app
