import path from "node:path";
import { defineConfig } from "prisma/config";

// DIRECT_DATABASE_URL is the plain Postgres URL used by Prisma Migrate.
// DATABASE_URL is the Prisma Accelerate URL used at runtime by PrismaClient.
export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || "",
  },
});
