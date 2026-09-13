import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { RefundReconciliationService } from "../apps/api/src/billing/refund-reconciliation.service";
import type { ResolveRefundDto } from "../packages/shared/src/schemas";

describe.skipIf(process.env.RUN_DB_TESTS !== "1")("audited refund reconciliation", () => {
  const ids: string[] = [], refunds: string[] = [], service = new RefundReconciliationService();
  const actor = { id: "operator-fixture", handle: "operator", role: "ADMIN", mfaVerified: true };
  beforeAll(() => { const url = new URL(process.env.DATABASE_URL ?? "invalid:"); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required"); });
  afterAll(async () => { await prisma.refundResolution.deleteMany({ where: { requestId: { in: refunds } } }); await prisma.refundRequest.deleteMany({ where: { id: { in: refunds } } }); await prisma.user.deleteMany({ where: { id: { in: ids } } }); await prisma.$disconnect(); });
  async function fixture(ledger = true) {
    const id = randomUUID(), starts = new Date(Date.now() - 86400_000), ends = new Date(Date.now() + 29 * 86400_000);
    const user = await prisma.user.create({ data: { handle: `refund_${id}`, email: `${id}@example.test`, plan: "PRO", planExpiresAt: new Date(+ends + 10 * 86400_000) } }); ids.push(user.id);
    const payment = await prisma.payment.create({ data: { userId: user.id, period: "MONTHLY", method: "ECPAY", ecpayMethod: "CREDIT", amountNtd: 200, merchantTradeNo: `R${id.replace(/-/g, "").slice(0, 19)}`, status: "APPROVED", ...(ledger ? { entitlementStartsAt: starts, entitlementEndsAt: ends } : {}) } });
    const refund = await prisma.refundRequest.create({ data: { userId: user.id, paymentId: payment.id, amountNtd: 200, merchantTradeNo: payment.merchantTradeNo!, status: "NEEDS_REVIEW", inFlightAction: "R" } }); refunds.push(refund.id);
    const dto: ResolveRefundDto = { clientRequestId: randomUUID(), expectedUpdatedAt: refund.updatedAt.toISOString(), merchantTradeNo: refund.merchantTradeNo, amountNtd: 200, decision: "CONFIRM_REFUNDED", evidenceReference: "ECPAY-CASE-123", reason: "Verified matching refund and cancellation with the gateway ledger.", cancellationConfirmed: true, noGatewayActionConfirmed: false, preserveUnattributedEntitlement: false };
    return { user, payment, refund, dto };
  }
  it("requires an MFA-verified administrator", async () => {
    const f = await fixture();
    await expect(service.resolve(f.refund.id, { ...actor, role: "USER" }, f.dto)).rejects.toThrow();
    await expect(service.resolve(f.refund.id, { ...actor, mfaVerified: false }, f.dto)).rejects.toThrow();
    expect(await service.history(f.refund.id)).toHaveLength(0);
  });
  it("deduplicates concurrent decisions and removes only the attributable entitlement", async () => {
    const f = await fixture();
    const results = await Promise.all([service.resolve(f.refund.id, actor, f.dto), service.resolve(f.refund.id, actor, f.dto)]);
    expect(results[0]).toEqual(results[1]); expect(results[0].status).toBe("COMPLETED"); expect(await service.history(f.refund.id)).toHaveLength(1);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } });
    expect(+user.planExpiresAt! - Date.now()).toBeGreaterThan(10 * 86400_000 - 2000);
    expect(+user.planExpiresAt! - Date.now()).toBeLessThan(10 * 86400_000 + 2000);
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: f.payment.id } })).status).toBe("REFUNDED");
  });
  it("rejects stale decisions, mismatched amounts and reused identities with changed content", async () => {
    const f = await fixture();
    await expect(service.resolve(f.refund.id, actor, { ...f.dto, expectedUpdatedAt: new Date(0).toISOString() })).rejects.toThrow();
    await expect(service.resolve(f.refund.id, actor, { ...f.dto, amountNtd: 1 })).rejects.toThrow();
    await service.resolve(f.refund.id, actor, f.dto);
    await expect(service.resolve(f.refund.id, actor, { ...f.dto, reason: "Different operator evidence" })).rejects.toThrow();
  });
  it("does not guess the allocation of legacy or administrator-granted entitlement", async () => {
    const f = await fixture(false);
    await expect(service.resolve(f.refund.id, actor, f.dto)).rejects.toThrow("cannot be attributed");
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).planExpiresAt).toEqual(f.user.planExpiresAt);
    await service.resolve(f.refund.id, actor, { ...f.dto, preserveUnattributedEntitlement: true });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).planExpiresAt).toEqual(f.user.planExpiresAt);
  });
  it("keeps a confirmed non-refund paused and never queues another bank action", async () => {
    const f = await fixture();
    const result = await service.resolve(f.refund.id, actor, { ...f.dto, decision: "CONFIRM_NO_ACTION", cancellationConfirmed: false, noGatewayActionConfirmed: true });
    expect(result.status).toBe("NEEDS_REVIEW");
    const saved = await prisma.refundRequest.findUniqueOrThrow({ where: { id: f.refund.id } });
    expect(saved.status).toBe("NEEDS_REVIEW"); expect(saved.refundConfirmedAt).toBeNull(); expect(saved.inFlightAction).toBe("R");
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: f.payment.id } })).status).toBe("APPROVED");
  });
  it("retains a usable audit record after an account and its payment have been deleted", async () => {
    const f = await fixture(); await prisma.user.delete({ where: { id: f.user.id } });
    expect((await service.resolve(f.refund.id, actor, f.dto)).status).toBe("COMPLETED");
    expect((await service.history(f.refund.id))[0].evidenceReference).toBe("ECPAY-CASE-123");
  });
});
