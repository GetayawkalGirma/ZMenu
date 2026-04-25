import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema",
  datasource: {
    // Switching to Session Mode (Port 5432 on the pooler) which handles Prisma CLI tasks much better
    url: (process.env.DATABASE_URL || "").replace(":6543/", ":5432/"),
  },
} as any);
