import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getClient = () => {
  const rawConnectionString = process.env.DATABASE_URL;
  if (!rawConnectionString) {
    throw new Error("DATABASE_URL is not set in environment!");
  }

  const connectionUrl = new URL(rawConnectionString);
  const sslMode = connectionUrl.searchParams.get("sslmode");
  const shouldUseSSL = sslMode !== "disable";

  // node-postgres can override ssl options from URL params (sslmode/sslcert/sslrootcert).
  // Remove them so we fully control TLS behavior from runtime config.
  connectionUrl.searchParams.delete("sslmode");
  connectionUrl.searchParams.delete("sslcert");
  connectionUrl.searchParams.delete("sslkey");
  connectionUrl.searchParams.delete("sslrootcert");

  const connectionString = connectionUrl.toString();
  const rejectUnauthorized =
    process.env.DB_SSL_REJECT_UNAUTHORIZED != null
      ? process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false"
      : false;

  console.log(
    `PRISMA: Initializing pg Pool (ssl=${shouldUseSSL ? "on" : "off"}, rejectUnauthorized=${rejectUnauthorized})`,
  );

  const pool = new pg.Pool({
    connectionString,
    ssl: shouldUseSSL ? { rejectUnauthorized } : undefined,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
};

const prisma = global.prisma ?? getClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
