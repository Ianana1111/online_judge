import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { BillingService } from "../apps/api/src/billing/billing.service";
import { currentBillingCatalog } from "../apps/api/src/billing/pricing.config";
import { computeCheckMacValue, cancelEcpayPeriod } from "../apps/api/src/billing/ecpay.util";

// Published ECPay sandbox signing keys; no requests ever leave these tests.
const keys = { hashKey: "pwFHCqoQZGmho4w6", hashIv: "EkRm7iFT261dpevs" };
vi.mock("../apps/api/src/billing/ecpay.util", async (original) => ({
  ...await original<typeof import("../apps/api/src/billing/ecpay.util")>(),
  ecpayConfig: () => ({ merchantId: "3002607", hashKey: "pwFHCqoQZGmho4w6", hashIv: "EkRm7iFT261dpevs", isSandbox: true, checkoutUrl: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" }),
  cancelEcpayPeriod: vi.fn(),
}));
const billing = new BillingService(), accounts: string[] = [];
const startsAt = "2026-09-15T00:00:00+08:00", endsAt = "2026-10-15T00:00:00+08:00";
const sign = async (body: Record<string, string>) => ({ ...body, CheckMacValue: await computeCheckMacValue(body, keys) });
const gatewayDate = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
function quote(period: "MONTHLY" | "YEARLY") {
  const catalog = currentBillingCatalog();
  return { expectedAmountNtd: catalog.effectivePricing[period], pricingVersion: catalog.pricingVersion };
}
async function account() {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 16);
  const user = await prisma.user.create({ data: { handle: `launch_${suffix}`, email: `${suffix}@example.test` } });
  accounts.push(user.id); return user;
}
async function firstNotification(order: Awaited<ReturnType<BillingService["createEcpayOrder"]>>) {
  return sign({ MerchantID: "3002607", MerchantTradeNo: String(order.fields.MerchantTradeNo), TradeNo: `GW${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    TradeAmt: String(order.fields.TotalAmount), PaymentDate: gatewayDate(), RtnCode: "1" });
}
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("launch orders and renewals with PostgreSQL", () => {
  beforeAll(() => {
    const db = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (db.hostname !== "127.0.0.1" || db.port !== "55432" || db.pathname !== "/oj_test" || db.username !== "oj_test") throw new Error("Disposable local test database required");
  });
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date(startsAt));
    vi.stubEnv("LAUNCH_PROMO_STARTS_AT", startsAt); vi.stubEnv("LAUNCH_PROMO_ENDS_AT", endsAt); vi.stubEnv("PRO_REGULAR_YEARLY_PRICE_NTD", "4000");
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
  afterAll(async () => { await prisma.user.deleteMany({ where: { id: { in: accounts } } }); await prisma.$disconnect(); });

  it.each(["MONTHLY", "YEARLY"] as const)("locks %s checkout and renewals after the deadline, including a late first callback", async (period) => {
    const user = await account(), accepted = quote(period);
    const order = await billing.createEcpayOrder(user.id, period, accepted);
    expect(order.fields.TotalAmount).toBe(period === "MONTHLY" ? 200 : 2000);
    expect(order.fields.PeriodAmount).toBe(order.fields.TotalAmount);
    expect(order.fields.PeriodType).toBe(period === "MONTHLY" ? "M" : "Y");
    vi.setSystemTime(new Date(endsAt));
    await billing.handleEcpayReturn(await firstNotification(order));
    const subscription = await prisma.subscription.findFirstOrThrow({ where: { userId: user.id } });
    expect(subscription.pricingVersion).toBe(accepted.pricingVersion);
    expect(subscription.amountNtd).toBe(accepted.expectedAmountNtd);
    expect((await billing.status(user.id)).subscription?.launchPriceLocked).toBe(true);
    // Even a later configuration outage must not block or reprice a valid renewal.
    vi.stubEnv("PRO_REGULAR_YEARLY_PRICE_NTD", "");
    const renewal = { MerchantID: "3002607", MerchantTradeNo: subscription.merchantTradeNo,
      TradeNo: `GW${randomUUID().replace(/-/g, "").slice(0, 16)}`, amount: String(subscription.amountNtd), TotalSuccessTimes: "2", process_date: gatewayDate(), RtnCode: "1" };
    await expect(billing.handleEcpayPeriodReturn(await sign({ ...renewal, amount: period === "MONTHLY" ? "400" : "4000" }))).rejects.toThrow();
    await billing.handleEcpayPeriodReturn(await sign(renewal));
    await billing.handleEcpayPeriodReturn(await sign(renewal));
    const saved = await prisma.payment.findMany({ where: { subscriptionId: subscription.id }, orderBy: { cycleNumber: "asc" } });
    expect(saved).toHaveLength(2);
    expect(saved.every((p) => p.amountNtd === accepted.expectedAmountNtd && p.pricingVersion === accepted.pricingVersion)).toBe(true);
  });
  it("rejects stale, omitted and tampered quotes without creating payable orders", async () => {
    const user = await account(), old = quote("MONTHLY");
    vi.setSystemTime(new Date(endsAt));
    for (const supplied of [undefined, old, { ...quote("MONTHLY"), expectedAmountNtd: 1 }]) {
      await expect(billing.createEcpayOrder(user.id, "MONTHLY", supplied)).rejects.toMatchObject({ status: 409 });
    }
    expect(await prisma.payment.count({ where: { userId: user.id } })).toBe(0);
    const order = await billing.createEcpayOrder(user.id, "MONTHLY", quote("MONTHLY"));
    expect(order.fields.TotalAmount).toBe(400); expect(order.fields.PeriodAmount).toBe(400);
  });
  it("requires renewed consent when annual price stays the same but launch eligibility ends", async () => {
    vi.stubEnv("PRO_REGULAR_YEARLY_PRICE_NTD", "2000");
    const user = await account(), old = quote("YEARLY"); vi.setSystemTime(new Date(endsAt));
    await expect(billing.createEcpayOrder(user.id, "YEARLY", old)).rejects.toMatchObject({ status: 409 });
    expect(await prisma.payment.count({ where: { userId: user.id } })).toBe(0);
  });
  it("creates only one recurring order under concurrent clicks", async () => {
    const user = await account(), accepted = quote("MONTHLY");
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => billing.createEcpayOrder(user.id, "MONTHLY", accepted)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await prisma.payment.count({ where: { userId: user.id } })).toBe(1);
  });
  it.each(["MONTHLY", "YEARLY"] as const)("uses regular %s prices after cancellation and locks the new renewal amount", async (period) => {
    const user = await account(), order = await billing.createEcpayOrder(user.id, period, quote(period));
    await billing.handleEcpayReturn(await firstNotification(order));
    vi.mocked(cancelEcpayPeriod).mockResolvedValue({ RtnCode: 1, RtnMsg: "OK" } as never);
    await billing.cancelSubscription(user.id);
    vi.setSystemTime(new Date(endsAt));
    const newOrder = await billing.createEcpayOrder(user.id, period, quote(period));
    const amount = period === "MONTHLY" ? 400 : 4000;
    expect(newOrder.fields.PeriodAmount).toBe(amount);
    expect(newOrder.fields.TotalAmount).toBe(amount);
    await billing.handleEcpayReturn(await firstNotification(newOrder));
    expect((await billing.status(user.id)).subscription?.launchPriceLocked).toBe(false);
    // Changing today's catalog cannot lower or raise the accepted regular subscription price.
    vi.stubEnv("LAUNCH_PROMO_STARTS_AT", ""); vi.stubEnv("LAUNCH_PROMO_ENDS_AT", ""); vi.stubEnv("PRO_REGULAR_YEARLY_PRICE_NTD", "");
    const renewal = { MerchantID: "3002607", MerchantTradeNo: String(newOrder.fields.MerchantTradeNo),
      TradeNo: `GW${randomUUID().replace(/-/g, "").slice(0, 16)}`, amount: String(amount), TotalSuccessTimes: "2", process_date: gatewayDate(), RtnCode: "1" };
    await expect(billing.handleEcpayPeriodReturn(await sign({ ...renewal, amount: period === "MONTHLY" ? "200" : "2000" }))).rejects.toThrow();
    await billing.handleEcpayPeriodReturn(await sign(renewal));
    expect((await billing.status(user.id)).subscription?.amountNtd).toBe(amount);
  });
  it("preserves legacy subscription amounts without mislabelling them as launch purchases", async () => {
    vi.stubEnv("LAUNCH_PROMO_STARTS_AT", ""); vi.stubEnv("LAUNCH_PROMO_ENDS_AT", ""); vi.stubEnv("PRO_REGULAR_YEARLY_PRICE_NTD", "");
    const user = await account(), order = await billing.createEcpayOrder(user.id, "MONTHLY");
    await billing.handleEcpayReturn(await firstNotification(order));
    expect((await billing.status(user.id)).subscription).toMatchObject({ amountNtd: 200, launchPriceLocked: false });
  });
  it("does not create an order from a partially configured campaign", async () => {
    const user = await account(), accepted = quote("MONTHLY"); vi.stubEnv("LAUNCH_PROMO_ENDS_AT", "");
    await expect(billing.createEcpayOrder(user.id, "MONTHLY", accepted)).rejects.toMatchObject({ status: 503 });
    expect(await prisma.payment.count({ where: { userId: user.id } })).toBe(0);
  });
  // Under manual capture the first charge of a subscription is only ever seen as an authorization:
  // no ReturnURL webhook fires until someone captures, which for a subscription may be never. Pro
  // and the Subscription row both have to exist from the authorization alone, or the customer pays
  // and gets nothing, and the 2nd cycle has no row to correlate against.
  it("grants Pro and opens the subscription from the authorization alone, before any capture", async () => {
    const user = await account(), accepted = quote("MONTHLY");
    const order = await billing.createEcpayOrder(user.id, "MONTHLY", accepted);
    const merchantTradeNo = String(order.fields.MerchantTradeNo);

    await billing.markCreditAuthorized(merchantTradeNo, "163066184");

    const subscription = await prisma.subscription.findUniqueOrThrow({ where: { merchantTradeNo } });
    expect(subscription).toMatchObject({ status: "ACTIVE", totalSuccessTimes: 1, amountNtd: 200 });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe("PRO");
    expect(await prisma.payment.findFirstOrThrow({ where: { merchantTradeNo } })).toMatchObject({
      status: "AUTHORIZED", subscriptionId: subscription.id, cycleNumber: 1,
    });

    // Capture settles later; it must converge on the same row rather than making a second one.
    await billing.handleEcpayReturn(await firstNotification(order));
    expect(await prisma.subscription.count({ where: { userId: user.id } })).toBe(1);
    expect(await prisma.payment.findFirstOrThrow({ where: { merchantTradeNo } })).toMatchObject({
      status: "APPROVED", subscriptionId: subscription.id, cycleNumber: 1,
    });

    // The 2nd cycle now has something to correlate against instead of throwing "not found".
    await billing.handleEcpayPeriodReturn(await sign({
      MerchantID: "3002607", MerchantTradeNo: merchantTradeNo,
      TradeNo: `GW${randomUUID().replace(/-/g, "").slice(0, 16)}`,
      amount: String(subscription.amountNtd), TotalSuccessTimes: "2", process_date: gatewayDate(), RtnCode: "1",
    }));
    expect(await prisma.payment.count({ where: { subscriptionId: subscription.id } })).toBe(2);
  });
});
