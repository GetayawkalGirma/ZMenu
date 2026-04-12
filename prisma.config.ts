import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema",
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
});
