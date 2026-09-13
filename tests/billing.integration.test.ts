import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { BillingService } from "../apps/api/src/billing/billing.service";
import { RefundReconciliationService } from "../apps/api/src/billing/refund-reconciliation.service";
import { cancelEcpayPeriod, computeCheckMacValue, doCreditCardAction, queryEcpayCreditTrade, queryEcpayOrder } from "../apps/api/src/billing/ecpay.util";

vi.mock("../apps/api/src/billing/ecpay.util", async (importOriginal) => ({
  ...await importOriginal<typeof import("../apps/api/src/billing/ecpay.util")>(),
  ecpayConfig: () => ({ merchantId: "3002607", hashKey: "pwFHCqoQZGmho4w6", hashIv: "EkRm7iFT261dpevs", isSandbox: false }),
  queryEcpayOrder: vi.fn(), queryEcpayCreditTrade: vi.fn(), doCreditCardAction: vi.fn(), cancelEcpayPeriod: vi.fn(),
}));

const billing = new BillingService();
const accountIds: string[] = [];
const config = { hashKey: "pwFHCqoQZGmho4w6", hashIv: "EkRm7iFT261dpevs" };
function gatewayDate(date: Date) { return new Date(+date + 8 * 3600_000).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " "); }
async function sign(body: Record<string, string>) { return { ...body, CheckMacValue: await computeCheckMacValue(body, config) }; }

describe.skipIf(process.env.RUN_DB_TESTS !== "1")("billing with real PostgreSQL transactions", () => {
  beforeAll(() => {
    const url = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test" || url.username !== "oj_test") {
      throw new Error("Integration tests only run against the disposable local oj_test database");
    }
  });
  beforeEach(() => vi.clearAllMocks());
  afterAll(async () => {
    await prisma.refundResolution.deleteMany({ where: { request: { userId: { in: accountIds } } } });
    await prisma.refundRequest.deleteMany({ where: { userId: { in: accountIds } } });
    await prisma.user.deleteMany({ where: { id: { in: accountIds } } });
    await prisma.$disconnect();
  });

  async function purchase(period: "MONTHLY" | "YEARLY" = "MONTHLY", paid = new Date(Date.now() - 10_000)) {
    const suffix = randomUUID().replace(/-/g, "").slice(0, 16);
    const user = await prisma.user.create({ data: { handle: `test_${suffix}`, email: `${suffix}@example.test` } });
    accountIds.push(user.id);
    const payment = await prisma.payment.create({ data: { userId: user.id, period, amountNtd: period === "MONTHLY" ? 200 : 2000,
      method: "ECPAY", ecpayMethod: "CREDIT", merchantTradeNo: `JT${suffix}`, isRecurring: true } });
    const notification = await sign({ MerchantID: "3002607", MerchantTradeNo: payment.merchantTradeNo!, TradeNo: `GW${suffix}`,
      TradeAmt: String(payment.amountNtd), PaymentDate: gatewayDate(paid), RtnCode: "1" });
    return { user, payment, notification };
  }

  it("a late worker cannot overwrite an operator's confirmed resolution or debit twice", async () => {
    const { user, payment, notification } = await purchase(); await billing.handleEcpayReturn(notification);
    const request = await billing.requestRefund(user.id);
    vi.mocked(queryEcpayOrder).mockResolvedValue(notification);
    vi.mocked(queryEcpayCreditTrade).mockResolvedValue({ RtnMsg: "", TradeID: "AUTH123", Amount: 200, Status: "Captured" });
    vi.mocked(cancelEcpayPeriod).mockResolvedValue({ RtnCode: 1, RtnMsg: "OK", MerchantID: "3002607", MerchantTradeNo: payment.merchantTradeNo! });
    let notifySent!: () => void, release!: () => void;
    const sent = new Promise<void>((resolve) => { notifySent = resolve; }), delayed = new Promise<void>((resolve) => { release = resolve; });
    vi.mocked(doCreditCardAction).mockImplementationOnce(async () => { notifySent(); await delayed; return { ...notification, RtnCode: 1, RtnMsg: "OK" } as never; });
    const worker = billing.processRefund(request.id);
    await sent;
    try {
      const stale = await prisma.refundRequest.update({ where: { id: request.id }, data: { status: "NEEDS_REVIEW", processingToken: null } });
      await new RefundReconciliationService().resolve(request.id, { id: "operator", role: "ADMIN", handle: "operator", mfaVerified: true }, {
        clientRequestId: randomUUID(), expectedUpdatedAt: stale.updatedAt.toISOString(), merchantTradeNo: stale.merchantTradeNo, amountNtd: 200,
        decision: "CONFIRM_REFUNDED", evidenceReference: "gateway-confirmed", reason: "Gateway confirms refund and recurring cancellation complete.", cancellationConfirmed: true, noGatewayActionConfirmed: false, preserveUnattributedEntitlement: false,
      });
      const before = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
      release(); await worker;
      expect((await prisma.refundRequest.findUniqueOrThrow({ where: { id: request.id } })).status).toBe("COMPLETED");
      expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).planExpiresAt).toEqual(before.planExpiresAt);
      expect(doCreditCardAction).toHaveBeenCalledTimes(1);
    } finally { release(); await worker; }
  });

  it("credits simultaneous repeated first-charge notifications exactly once", async () => {
    const { user, payment, notification } = await purchase();
    await Promise.all(Array.from({ length: 8 }, () => billing.handleEcpayReturn(notification)));
    const saved = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
    const account = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(saved.status).toBe("APPROVED");
    expect(saved.refundDeadlineAt!.getTime() - saved.paidAt!.getTime()).toBe(168 * 3600_000);
    expect(account.planExpiresAt).toEqual(saved.entitlementEndsAt);
    expect(await prisma.subscription.count({ where: { userId: user.id } })).toBe(1);
  });
  it("does not give new annual subscriptions a bonus month", async () => {
    const { payment, notification } = await purchase("YEARLY");
    await billing.handleEcpayReturn(notification);
    const saved = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
    const days = (+saved.entitlementEndsAt! - +saved.entitlementStartsAt!) / 86400_000;
    expect(days).toBeGreaterThanOrEqual(365); expect(days).toBeLessThanOrEqual(366);
  });
  it("rejects forged and mismatched-merchant notifications without granting access", async () => {
    const { payment, notification } = await purchase();
    await expect(billing.handleEcpayReturn({ ...notification, TradeAmt: "1" })).rejects.toThrow();
    await expect(billing.handleEcpayReturn(await sign({ ...notification, MerchantID: "OTHER" }))).rejects.toThrow();
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe("PENDING");
  });
  it("persists only one refund request under concurrent clicks", async () => {
    const { user, notification } = await purchase(); await billing.handleEcpayReturn(notification);
    const results = await Promise.all(Array.from({ length: 8 }, () => billing.requestRefund(user.id)));
    expect(new Set(results.map((result) => result.id)).size).toBe(1);
    expect(doCreditCardAction).not.toHaveBeenCalled();
  });
  it("rejects an expired first purchase even if a newer payment is eligible", async () => {
    const { user, payment, notification } = await purchase("MONTHLY", new Date(Date.now() - 8 * 86400_000));
    await billing.handleEcpayReturn(notification);
    await prisma.payment.create({ data: { userId: user.id, period: "MONTHLY", amountNtd: 200, method: "ECPAY", ecpayMethod: "CREDIT", status: "APPROVED",
      paidAt: new Date(), refundDeadlineAt: new Date(Date.now() + 7 * 86400_000), merchantTradeNo: `${payment.merchantTradeNo}B` } });
    await expect(billing.requestRefund(user.id)).rejects.toThrow();
  });
  it("processes a refund only once across concurrent workers and stops renewals first", async () => {
    const { user, payment, notification } = await purchase(); await billing.handleEcpayReturn(notification);
    const request = await billing.requestRefund(user.id);
    vi.mocked(queryEcpayOrder).mockResolvedValue(notification);
    vi.mocked(queryEcpayCreditTrade).mockResolvedValue({ RtnMsg: "", TradeID: "AUTH123", Amount: 200, Status: "Captured" });
    vi.mocked(cancelEcpayPeriod).mockResolvedValue({ RtnCode: 1, RtnMsg: "OK", MerchantID: "3002607", MerchantTradeNo: payment.merchantTradeNo! });
    vi.mocked(doCreditCardAction).mockResolvedValue({ ...notification, RtnCode: 1, RtnMsg: "OK" } as never);
    await Promise.all(Array.from({ length: 5 }, () => billing.processRefund(request.id)));
    expect(doCreditCardAction).toHaveBeenCalledTimes(1);
    expect(vi.mocked(doCreditCardAction).mock.calls[0][1]).toBe(notification.TradeNo);
    expect(cancelEcpayPeriod).toHaveBeenCalledTimes(1);
    expect(vi.mocked(cancelEcpayPeriod).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(doCreditCardAction).mock.invocationCallOrder[0]);
    expect((await prisma.refundRequest.findUniqueOrThrow({ where: { id: request.id } })).status).toBe("COMPLETED");
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe("REFUNDED");
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe("FREE");
  });
  it("does not blindly repeat a refund whose external outcome is unknown", async () => {
    const { user, payment, notification } = await purchase(); await billing.handleEcpayReturn(notification);
    const request = await billing.requestRefund(user.id);
    vi.mocked(queryEcpayOrder).mockResolvedValue(notification);
    vi.mocked(queryEcpayCreditTrade).mockResolvedValue({ RtnMsg: "", TradeID: "AUTH123", Amount: 200, Status: "Captured" });
    vi.mocked(cancelEcpayPeriod).mockResolvedValue({ RtnCode: 1, RtnMsg: "OK", MerchantID: "3002607", MerchantTradeNo: payment.merchantTradeNo! });
    vi.mocked(doCreditCardAction).mockRejectedValue(new Error("connection interrupted after send"));
    await billing.processRefund(request.id); await billing.processRefund(request.id);
    expect(doCreditCardAction).toHaveBeenCalledTimes(1);
    expect((await prisma.refundRequest.findUniqueOrThrow({ where: { id: request.id } })).status).toBe("NEEDS_REVIEW");
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe("APPROVED");
  });
  it("accepts late lower-numbered renewal notifications without losing or duplicating a charge", async () => {
    const { user, notification } = await purchase(); await billing.handleEcpayReturn(notification);
    for (const cycle of [3, 2, 3, 2]) {
      await billing.handleEcpayPeriodReturn(await sign({ ...notification, TradeNo: `${notification.TradeNo}${cycle}`, TotalSuccessTimes: String(cycle), amount: "200" }));
    }
    expect(await prisma.payment.count({ where: { userId: user.id } })).toBe(3);
    expect((await prisma.subscription.findFirstOrThrow({ where: { userId: user.id } })).totalSuccessTimes).toBe(3);
  });
  it("preserves the original month-end anchor with actual out-of-order payment dates", async () => {
    const { user, notification } = await purchase("MONTHLY", new Date("2026-01-31T02:30:00+08:00"));
    await billing.handleEcpayReturn(notification);
    for (const [cycle, paid] of [[3, "2026/03/31 02:30:00"], [2, "2026/02/28 02:30:00"]] as const) {
      await billing.handleEcpayPeriodReturn(await sign({ ...notification, TradeNo: `${notification.TradeNo}${cycle}`, TotalSuccessTimes: String(cycle), amount: "200", PaymentDate: paid }));
    }
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).planExpiresAt).toEqual(new Date("2026-04-30T02:30:00+08:00"));
    expect((await billing.status(user.id)).subscription?.nextChargeAt).toEqual(new Date("2026-04-30T02:30:00+08:00"));
  });
  it("pages retained refund records without exposing account secrets or losing a removed cursor row", async () => {
    const { user, payment } = await purchase();
    const prefix = `r${randomUUID().replaceAll("-", "")}`;
    const ids = Array.from({ length: 28 }, (_, index) => `${prefix}${String(index).padStart(2, "0")}`);
    try {
      await prisma.refundRequest.createMany({ data: ids.map((id, index) => ({ id,
        userId: index === 0 ? user.id : id, paymentId: index === 0 ? payment.id : id,
        merchantTradeNo: `TEST${index}`, amountNtd: 200, requestedAt: new Date("1990-01-01T00:00:00Z"),
        status: index === 27 ? "COMPLETED" : "NEEDS_REVIEW",
      })) });
      const first = await billing.pendingRefunds({ status: "NEEDS_REVIEW" });
      expect(first.items.map((item) => item.id)).toEqual(ids.slice(0, 25));
      expect(first.items[0].user).toEqual({ id: user.id, handle: user.handle, email: user.email });
      expect(first.items[1].user).toBeNull();
      expect(first.counts.NEEDS_REVIEW).toBeGreaterThanOrEqual(27);
      await prisma.refundRequest.delete({ where: { id: ids[24] } });
      const second = await billing.pendingRefunds({ status: "NEEDS_REVIEW", cursor: first.nextCursor! });
      expect(second.items.slice(0, 2).map((item) => item.id)).toEqual(ids.slice(25, 27));
      expect((await billing.pendingRefunds()).items.some((item) => item.id === ids[27])).toBe(false);
      expect((await billing.pendingRefunds({ status: "COMPLETED" })).items.some((item) => item.id === ids[27])).toBe(true);
    } finally { await prisma.refundRequest.deleteMany({ where: { id: { in: ids } } }); }
  });
  it("rejects malformed refund cursors", async () => {
    for (const cursor of ["not-json", Buffer.from(JSON.stringify({ at: "invalid", id: "abc" })).toString("base64url")]) {
      await expect(billing.pendingRefunds({ cursor })).rejects.toThrow("Invalid page cursor");
    }
  });
});
