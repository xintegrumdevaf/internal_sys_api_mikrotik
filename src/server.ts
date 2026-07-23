import "dotenv/config"
import app from "./app.js"
import { Logger } from "./shared/utils/logger.js"

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`)
})
