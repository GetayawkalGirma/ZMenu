import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getClient = () => {
  console.log("Initializing Prisma Client with adapter-pg...");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set in environment!");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  console.log("Pool created and adapter initialized.");
  return new PrismaClient({
    adapter,
    log: ["error"],
  });
};

const prisma = global.prisma ?? getClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
