import express, { type Express } from "express"
import oltRoutes from "./presentation/routers/otl.routes.js"
import diagnosticRoutes from "./presentation/routers/diagnostic.routes.js"


const app: Express = express();

app.use(express.json())

// app.get("/health", (req, res) => {
//     res.json({ ok: true });
// });


app.use("/olt", oltRoutes)
app.use("/diagnostic", diagnosticRoutes)

export default app;