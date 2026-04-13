import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema",
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-ignore - directUrl is required by Prisma CLI but currently missing from the defineConfig types
    directUrl: process.env.DIRECT_URL,
  },
} as any);
