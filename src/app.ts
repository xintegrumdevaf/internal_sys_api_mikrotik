import express from "express"
import oltRoutes from "../src/routes/otl.routes.js"

const app = express();

app.use(express.json())

// app.get("/health", (req, res) => {
//     res.json({ ok: true });
// });


app.use("/olt", oltRoutes)

export default app;