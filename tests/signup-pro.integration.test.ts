import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { AuthService } from "../apps/api/src/auth/auth.service";
import { BillingService } from "../apps/api/src/billing/billing.service";

// The new-member Pro gift has ended (migration 20261112130000_end_signup_pro_gift). New accounts get
// no free Pro, while members who already received the gift keep it until it expires.
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("ended signup Pro gift", () => {
  const campaignId = `signup-pro-test-${randomUUID().slice(0, 8)}`, users: string[] = [], suffix = randomUUID().slice(0, 8);
  beforeAll(async () => {
    const url = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
    // Even a campaign row left enabled must not grant anything any more.
    await prisma.signupProCampaign.create({ data: { id: campaignId, startsAt: new Date(Date.now() - 86400000), baselineUserCount: 0 } });
  });
  afterAll(async () => {
    await prisma.signupProGrant.deleteMany({ where: { campaignId } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.signupProCampaign.deleteMany({ where: { id: campaignId } });
    await prisma.$disconnect();
  });

  it("gives new accounts no free Pro through either signup path", async () => {
    const notifications = { create: vi.fn() };
    const auth = new AuthService({} as never, notifications as never, {} as never);
    vi.spyOn(auth, "issueSession").mockImplementation(async id => ({ user: { id } }) as never);
    const password = await auth.register({ handle: `gift_${suffix}_password`, email: `gift_${suffix}_password@example.test`, password: "DisposablePass123!" });
    users.push(password.user.id);
    const google = await auth.loginWithGoogle(`gift-google-${suffix}`, `gift_${suffix}_google@example.test`, `gift_${suffix}_google`);
    users.push(google.user.id);
    for (const id of [password.user.id, google.user.id]) {
      const user = await prisma.user.findUniqueOrThrow({ where: { id } });
      expect(user.plan).toBe("FREE"); expect(user.planExpiresAt).toBeNull();
      expect(await prisma.signupProGrant.count({ where: { userId: id } })).toBe(0);
      expect(await prisma.notification.count({ where: { userId: id, title: { contains: "註冊禮" } } })).toBe(0);
      const status = await new BillingService().status(id);
      expect(status.plan).toBe("FREE"); expect(status.signupGift).toBeNull(); expect(status.submits.limit).not.toBeNull();
    }
    const [{ exists }] = await prisma.$queryRaw<{ exists: boolean }[]>`SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'grant_signup_pro') AS exists`;
    expect(exists).toBe(false);
  });

  it("keeps the gift of members who already received it until it expires", async () => {
    const expiresAt = new Date(Date.now() + 20 * 86400000);
    const user = await prisma.user.create({ data: { handle: `gift_${suffix}_earlier`, email: `gift_${suffix}_earlier@example.test`, plan: "PRO", planExpiresAt: expiresAt } });
    users.push(user.id);
    await prisma.signupProGrant.create({ data: { campaignId, slot: 1, userId: user.id, emailHash: `test-${suffix}`, grantedAt: new Date(Date.now() - 10 * 86400000), expiresAt } });
    const status = await new BillingService().status(user.id);
    expect(status.plan).toBe("PRO");
    expect(status.signupGift?.expiresAt).toEqual(expiresAt);
    expect(status.submits.limit).toBeNull();
  });
});
