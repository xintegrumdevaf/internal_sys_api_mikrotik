import "dotenv/config";
import app from "./app.js"


// Logger.info(process.cwd());
// Logger.info(process.env.DATABASE_URL);

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
