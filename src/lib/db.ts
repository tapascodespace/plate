import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof makePrismaClient> };

function makePrismaClient() {
  // Prisma 7 passes the Accelerate URL via the `accelerateUrl` constructor option.
  // Fall back to the direct URL for local utility scripts that bypass Accelerate.
  const accelerateUrl =
    process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;
  return new PrismaClient({ accelerateUrl }).$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma || makePrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
