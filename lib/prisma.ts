import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment!");
  }

  const pool = new pg.Pool({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

const prisma = global.prisma ?? getClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
