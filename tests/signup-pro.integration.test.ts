import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { AuthService } from "../apps/api/src/auth/auth.service";
import { BillingService, isProActive } from "../apps/api/src/billing/billing.service";

describe.skipIf(process.env.RUN_DB_TESTS !== "1")("limited signup Pro gift with real PostgreSQL concurrency", () => {
  const campaignId = "signup-pro-20261003", users: string[] = [], suffix = randomUUID().slice(0, 8);
  let existingId: string;
  let ownsCampaign = false;
  beforeAll(async () => {
    const url = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
    if (await prisma.signupProCampaign.count()) throw new Error("Campaign fixture must start empty");
    existingId = (await account("existing")).id;
    await prisma.signupProCampaign.create({ data: { id: campaignId, startsAt: new Date(), baselineUserCount: 1 } });
    ownsCampaign = true;
  });
  afterAll(async () => {
    if (!ownsCampaign) { await prisma.$disconnect(); return; }
    await prisma.signupProCampaign.updateMany({ where: { id: campaignId }, data: { enabled: false } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.signupProGrant.deleteMany({ where: { campaignId } });
    await prisma.signupProCampaign.deleteMany({ where: { id: campaignId } });
    await prisma.$disconnect();
  });
  async function account(label: string, extra = {}) {
    const user = await prisma.user.create({ data: { handle: `gift_${suffix}_${label}`, email: `gift_${suffix}_${label}@example.test`, ...extra } });
    users.push(user.id); return user;
  }
  async function grant(userId: string) { return (await prisma.$queryRaw<{ granted: boolean }[]>`SELECT grant_signup_pro(${userId}) AS granted`)[0].granted; }

  it("excludes existing accounts and administrators", async () => {
    expect(await grant(existingId)).toBe(false);
    const admin = await account("admin", { role: "ADMIN" });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: admin.id } })).plan).toBe("FREE");
    expect((await prisma.signupProCampaign.findUniqueOrThrow({ where: { id: campaignId } })).grantedCount).toBe(0);
  });
  it("grants through both real signup paths and never extends on login/retry", async () => {
    const auth = new AuthService({} as never, { create: vi.fn() } as never, {} as never);
    vi.spyOn(auth, "issueSession").mockImplementation(async id => ({ user: { id } }) as never);
    const email = `gift_${suffix}_password@example.test`;
    const password = await auth.register({ handle: `gift_${suffix}_password`, email, password: "DisposablePass123!" }); users.push(password.user.id);
    const googleId = `gift-google-${suffix}`;
    const google = await auth.loginWithGoogle(googleId, `gift_${suffix}_google@example.test`, `gift_${suffix}_google`); users.push(google.user.id);
    for (const id of [password.user.id, google.user.id]) {
      const gift = await prisma.signupProGrant.findFirstOrThrow({ where: { userId: id } });
      const user = await prisma.user.findUniqueOrThrow({ where: { id } });
      expect(user.plan).toBe("PRO"); expect(user.planExpiresAt).toEqual(gift.expiresAt);
      expect(+gift.expiresAt - +gift.grantedAt).toBe(30 * 86400000);
      expect(await grant(id)).toBe(false);
      expect(await prisma.notification.count({ where: { userId: id, title: "註冊禮已到帳：免費 Pro 30 天" } })).toBe(1);
      const status = await new BillingService().status(id);
      expect(status.signupGift?.expiresAt).toEqual(gift.expiresAt);
      expect(status.subscription).toBeNull(); expect(status.refundEligibleUntil).toBeNull();
      expect(status.submits.limit).toBeNull(); expect(status.virtualContests.limit).toBeNull();
      expect(await prisma.payment.count({ where: { userId: id } })).toBe(0);
    }
    await auth.loginWithGoogle(googleId, `gift_${suffix}_google@example.test`, "ignored");
    expect((await prisma.signupProCampaign.findUniqueOrThrow({ where: { id: campaignId } })).grantedCount).toBe(2);
  });
  it("rolls back the slot, benefit and notification when registration fails", async () => {
    const before = (await prisma.signupProCampaign.findUniqueOrThrow({ where: { id: campaignId } })).grantedCount;
    await expect(prisma.$transaction(async tx => { await tx.user.create({ data: { handle: `gift_${suffix}_rollback`, email: `gift_${suffix}_rollback@example.test` } }); throw new Error("rollback"); })).rejects.toThrow("rollback");
    expect((await prisma.signupProCampaign.findUniqueOrThrow({ where: { id: campaignId } })).grantedCount).toBe(before);
  });
  it("retains consumed slots after deletion and refuses the same email twice", async () => {
    const original = await account("deleted");
    await prisma.user.delete({ where: { id: original.id } });
    const retry = await account("recreated", { email: original.email.toUpperCase() });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: retry.id } })).plan).toBe("FREE");
    expect((await prisma.signupProCampaign.findUniqueOrThrow({ where: { id: campaignId } })).grantedCount).toBe(3);
  });
  it("automatically returns expired gifts to Free without a payment or renewal", async () => {
    const user = await account("expiry");
    await prisma.user.update({ where: { id: user.id }, data: { planExpiresAt: new Date(Date.now() - 1) } });
    expect(isProActive(await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))).toBe(false);
    const status = await new BillingService().status(user.id);
    expect(status.plan).toBe("FREE"); expect(status.signupGift).toBeNull(); expect(status.submits.limit).not.toBeNull();
    expect(await grant(user.id)).toBe(false);
  });
  it("never awards more than 50 gifts under 60 concurrent registrations", async () => {
    const before = (await prisma.signupProCampaign.findUniqueOrThrow({ where: { id: campaignId } })).grantedCount;
    const registrations = await Promise.all(Array.from({ length: 60 }, (_, i) => account(`concurrent_${i}`)));
    const awarded = await prisma.signupProGrant.count({ where: { userId: { in: registrations.map(u => u.id) } } });
    expect(awarded).toBe(50 - before);
    const campaign = await prisma.signupProCampaign.findUniqueOrThrow({ where: { id: campaignId } });
    expect(campaign.grantedCount).toBe(50);
    expect(await prisma.signupProGrant.count({ where: { campaignId } })).toBe(50);
    const after = await account("fifty_first");
    expect((await prisma.user.findUniqueOrThrow({ where: { id: after.id } })).plan).toBe("FREE");
  });
});
