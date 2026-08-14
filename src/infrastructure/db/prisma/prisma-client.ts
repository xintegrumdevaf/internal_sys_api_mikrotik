import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Logger } from "../../../shared/utils/logger.js";
import { PrismaClient } from "./generated/client.js";

// Cargar .env del proyecto mikrotik_api con override: si el proceso quedó
// con DATABASE_URL vieja (usuario postgres), el archivo gana.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
loadEnv({ path: path.join(projectRoot, ".env"), override: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
}

Logger.info("DATABASE:", databaseUrl.replace(/:[^:@/]+@/, ":***@"));

const adapter = new PrismaPg({
    connectionString: databaseUrl,
});

export const prisma = new PrismaClient({
    adapter,
});
