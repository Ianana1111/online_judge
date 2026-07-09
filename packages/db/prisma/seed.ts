import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Minimal seed: just the two bootstrap accounts. Real problems come entirely from
 * packages/db/scripts/scrape-cpe.ts (334+ real UVa/CPE problems with real statements) — every
 * submission is judged by proxying to the real UVa Online Judge (see apps/judge/src/remote), so
 * there's no local test data to seed, and no value in synthetic demo problems that lack a real
 * UVa id to submit against.
 */
async function main() {
  const adminPasswordHash = await argon2.hash("Admin123!");
  const admin = await prisma.user.upsert({
    where: { handle: "admin" },
    update: {},
    create: {
      handle: "admin",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`Seeded admin user (handle=admin, password=Admin123!)`);

  const demoPasswordHash = await argon2.hash("Demo1234!");
  await prisma.user.upsert({
    where: { handle: "demo" },
    update: {},
    create: {
      handle: "demo",
      email: "demo@example.com",
      passwordHash: demoPasswordHash,
      role: "USER",
    },
  });
  console.log(`Seeded demo user (handle=demo, password=Demo1234!)`);

  console.log(`\nDone. Admin user id=${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
