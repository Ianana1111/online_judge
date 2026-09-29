import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { AnalyticsService } from "../apps/api/src/analytics/analytics.service";
import { signAnalyticsContext } from "../packages/shared/src/analyticsContext";
import type { AudienceDashboard } from "../apps/web/lib/types";
const secret = "local-analytics-fixture-secret-at-least-32-chars";
const path = `/analytics-fixture-${randomUUID()}`;
const ua = "Mozilla/5.0 Chrome/140.0 Safari/537.36";
let userId: string;
function context(id: string, country = "TW", region = "TPE") {
  const issuedAt = Math.floor(Date.now() / 1000);
  return signAnalyticsContext({ visitorId: createHash("sha256").update(id).digest("hex"), country, region, issuedAt, expiresAt: issuedAt + 3600 }, secret);
}
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("audience analytics with PostgreSQL", () => {
  beforeAll(async () => {
    const url = new URL(process.env.DATABASE_URL!);
    if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable DB required");
    vi.stubEnv("ANALYTICS_CONTEXT_SECRET", secret);
    userId = (await prisma.user.create({ data: { handle: `analytics_${randomUUID()}`, email: `${randomUUID()}@example.test` } })).id;
  });
  afterAll(async () => { await prisma.pageView.deleteMany({ where: { path } }); await prisma.user.delete({ where: { id: userId } }); await prisma.$disconnect(); vi.unstubAllEnvs(); });
  it("deduplicates views, enforces elapsed time, records authoritative membership, and aggregates anonymous Taiwan visitors", async () => {
    const service = new AnalyticsService();
    const guest = { path, eventId: randomUUID(), sessionId: randomUUID(), context: context(randomUUID()) };
    await Promise.all([service.recordPageview(guest, ua, null), service.recordPageview(guest, ua, null)]);
    expect(await prisma.pageView.count({ where: { path } })).toBe(1);
    await service.recordPageview({ ...guest, engaged: true, interacted: true, activeMs: 10000 }, ua, null);
    expect((await prisma.pageView.findFirstOrThrow({ where: { path } })).engaged).toBe(false);
    await prisma.pageView.updateMany({ where: { path }, data: { createdAt: new Date(Date.now() - 12000) } });
    await service.recordPageview({ ...guest, engaged: true, interacted: true, activeMs: 10000 }, ua, null);
    const member = { path, eventId: randomUUID(), sessionId: randomUUID(), context: context(randomUUID(), "TW", "KHH"), referrer: "https://search.example/path?token=secret" };
    await service.recordPageview(member, ua, userId);
    await prisma.pageView.updateMany({ where: { path, userId }, data: { createdAt: new Date(Date.now() - 12000) } });
    await service.recordPageview({ ...member, engaged: true, interacted: true, activeMs: 10000 }, ua, userId);
    const rows = await prisma.pageView.findMany({ where: { path } });
    expect(rows.find(row => row.userId)?.audience).toBe("FREE");
    expect(rows.find(row => row.userId)?.referrer).toBe("https://search.example");
    const result = await service.audienceDashboard(1, "all") as AudienceDashboard;
    expect(result.totals.engaged).toBeGreaterThanOrEqual(2);
    expect(result.totals.anonymous).toBeGreaterThanOrEqual(1);
    expect(result.totals.free).toBeGreaterThanOrEqual(1);
    expect(result.regions.find(row => row.region === "TPE")?.anonymous).toBeGreaterThanOrEqual(1);
    const direct = await service.audienceDashboard(1, "direct") as AudienceDashboard;
    expect(direct.sources.every(row => row.source === "DIRECT")).toBe(true);
    // Once the same browser is observed signed in, it is not counted as unregistered.
    await service.recordPageview({ ...guest, eventId: randomUUID() }, ua, userId);
    const after = await new AnalyticsService().audienceDashboard(1, "all") as AudienceDashboard;
    expect(after.totals.anonymous).toBe(result.totals.anonymous - 1);
  });
  it("uses Taiwan calendar dates and hours for UTC-stored timestamps", async () => {
    const at = new Date(); at.setUTCDate(at.getUTCDate() - 1); at.setUTCHours(20, 0, 0, 0);
    await prisma.pageView.create({ data: { path, eventKey: randomUUID(), visitorId: createHash("sha256").update(randomUUID()).digest("hex"), audience: "ANONYMOUS", engaged: true, acquisition: "DIRECT", createdAt: at } });
    const expected = new Date(at.getTime() + 8 * 3600000).toISOString().slice(0, 10);
    const service = new AnalyticsService();
    const report = await service.audienceDashboard(7, "all") as AudienceDashboard;
    expect(report.daily.find(row => row.date === expected)?.visitors).toBeGreaterThanOrEqual(1);
    expect((await service.dailyTraffic(7)).find(row => row.date === expected)?.count).toBeGreaterThanOrEqual(1);
    expect((await service.productDashboard(7)).hourlyTraffic.find(row => row.hour === 4)?.views).toBeGreaterThanOrEqual(1);
  });
  it("excludes bots and forged geography, keeping legacy views out of unique visitor counts", async () => {
    const service = new AnalyticsService();
    const before = await prisma.pageView.count({ where: { path } });
    await service.recordPageview({ path }, "Googlebot", null);
    await service.recordPageview({ path, referrer: "https://darodar.com/spam" }, ua, null);
    expect(await prisma.pageView.count({ where: { path } })).toBe(before);
    await service.recordPageview({ path, eventId: randomUUID(), sessionId: randomUUID(), context: "forged" }, ua, null);
    const legacy = await prisma.pageView.findFirstOrThrow({ where: { path, eventKey: null } });
    expect(legacy.visitorId).toBeNull(); expect(legacy.country).toBeNull(); expect(legacy.engaged).toBe(false);
  });
});
