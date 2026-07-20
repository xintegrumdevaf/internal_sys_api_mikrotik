import { Logger } from "../../../shared/utils/logger.js";
import { PrismaClient } from "./generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

Logger.info("DATABASE:", process.env.DATABASE_URL);

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
    adapter,
});