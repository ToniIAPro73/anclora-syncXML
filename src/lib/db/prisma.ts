import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(
  databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined,
);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function hasDatabase() {
  return Boolean(databaseUrl);
}
