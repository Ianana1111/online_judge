/** Read current provider usage with already-authenticated CLIs. No credentials or raw billing JSON are logged.
 * Preview: pnpm exec tsx scripts/operations/sync-service-costs.ts
 * Save: DATABASE_URL=... pnpm exec tsx scripts/operations/sync-service-costs.ts --apply
 * Workspace/team are explicit; existing manually maintained fees are never overwritten.
 */
import { execFileSync } from "node:child_process";
import { prisma } from "../../packages/db/src/index";
import { railwaySnapshot, vercelSnapshot } from "../../packages/shared/src/provider-billing";
const args = new Set(process.argv.slice(2));
if ([...args].some(arg => arg !== "--apply")) throw new Error("Only --apply is supported");
function report(command: string, params: string[]) {
  return JSON.parse(execFileSync(command, params, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 90000, maxBuffer: 5 * 1024 * 1024 }));
}
async function main() {
  const snapshots = [
    { key: "railway", billingSnapshot: railwaySnapshot(report("railway", ["usage", "--workspace", "ad91a4f4-fe08-4366-8a5e-1922f635dd0f", "--json"])) },
    { key: "vercel", billingSnapshot: vercelSnapshot(report("vercel", ["usage", "--scope", "ianana1111s-projects", "--format", "json"])) },
  ];
  if (args.has("--apply")) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
    const billingCheckedAt = new Date();
    await prisma.$transaction(snapshots.map(({ key, billingSnapshot }) => prisma.externalServiceRecord.upsert({ where: { key }, create: { key, billingSnapshot, billingCheckedAt }, update: { billingSnapshot, billingCheckedAt } })));
  }
  console.log(JSON.stringify({ saved: args.has("--apply"), reports: snapshots.map(({ key, billingSnapshot: s }) => ({ key, scope: s.scope, currency: s.currency, usageMinor: s.usageMinor, billedMinor: s.billedMinor, periodStart: s.periodStart, periodEnd: s.periodEnd })) }, null, 2));
}
main().catch(() => { console.error("Usage sync failed. Check CLI authentication, workspace access and DATABASE_URL. No partial snapshot update was saved."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
