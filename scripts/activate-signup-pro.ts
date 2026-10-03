/** Explicit, idempotent activation; never run by deploy/seed. Capture the baseline
 * with database time before implementation, then pass it here. Default is preview.
 * --starts-at=<ISO> --baseline-count=<integer> [--apply]
 */
import { prisma } from "../packages/db/src/index";

async function main() {
  const option = (key: string) => process.argv.find(s => s.startsWith(`--${key}=`))?.slice(key.length + 3);
  const startsAt = new Date(option("starts-at") ?? ""), baselineUserCount = Number(option("baseline-count"));
  if (!Number.isFinite(+startsAt) || +startsAt > Date.now() || !Number.isSafeInteger(baselineUserCount) || baselineUserCount < 0) throw new Error("Explicit baseline timestamp and count required");
  const apply = process.argv.includes("--apply"), id = "signup-pro-20261003";
  const result = await prisma.$transaction(async tx => {
    // Registration inserts and backfill cannot pass each other at activation.
    // Once released, every insert is covered by the trigger, including old API workers.
    if (apply) await tx.$executeRawUnsafe("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");
    else await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    let campaign = await tx.signupProCampaign.findUnique({ where: { id } });
    if (campaign && (+campaign.startsAt !== +startsAt || campaign.baselineUserCount !== baselineUserCount || campaign.capacity !== 50 || campaign.durationDays !== 30)) throw new Error("Campaign baseline differs; refusing to reset or overwrite it");
    const candidates = await tx.user.findMany({ where: { role: "USER", createdAt: { gte: startsAt }, deletionRequestedAt: null }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: { id: true } });
    if (!apply) return { apply, startsAt, baselineUserCount, capacity: 50, granted: campaign?.grantedCount ?? 0, registrationsSinceBaseline: candidates.length };
    campaign ??= await tx.signupProCampaign.create({ data: { id, startsAt, baselineUserCount } });
    let granted = campaign.grantedCount;
    for (const user of candidates) {
      if (granted >= campaign.capacity) break;
      const [result] = await tx.$queryRaw<{ granted: boolean }[]>`SELECT grant_signup_pro(${user.id}) AS granted`;
      if (result.granted) granted++;
    }
    return { apply, startsAt, baselineUserCount, capacity: campaign.capacity, granted, remaining: campaign.capacity - granted, enabled: campaign.enabled };
  }, { timeout: 30_000 });
  console.log(JSON.stringify(result, null, 2));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Campaign activation failed"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
