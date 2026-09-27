import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Keep 50 concurrent judge jobs from multiplying database connections with the host CPU count.
function pooledDatabaseUrl() {
  if (!process.env.DATABASE_URL) return undefined;
  const url = new URL(process.env.DATABASE_URL);
  if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "10");
  if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "5");
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: pooledDatabaseUrl(),
    errorFormat: "minimal",
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
