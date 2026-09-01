import express, { type Express, type Request, type Response } from "express"
import cors from "cors"
import oltRoutes from "./presentation/routers/olt.routes.js"
import mikrotikRoutes from "./presentation/routers/mikrotik.routes.js"
import diagnosticRoutes from "./presentation/routers/diagnostic.routes.js"
import { errorHandler } from "./presentation/middlewares/error-handler.middleware.js"
import { metricsMiddleware, getMetricsHandler } from "./shared/monitoring/metrics.js"

const app: Express = express()

app.use(cors())
app.use(express.json())
app.use(metricsMiddleware)

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" })
})

app.get("/metrics", getMetricsHandler)

app.use("/api/v1/olt", oltRoutes)

app.use("/api/v1/mikrotik", mikrotikRoutes)
app.use("/api/v1/diagnostic", diagnosticRoutes)

app.use(errorHandler)

export default app

