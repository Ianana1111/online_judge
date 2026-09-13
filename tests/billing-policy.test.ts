import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { billingCycleEnd, parseEcpayPaymentDate, refundDeadline, withinRefundWindow } from "../packages/shared/src/billingPolicy";

describe("first-payment refund guarantee", () => {
  it("counts exactly 168 hours from payment and accepts the deadline itself", () => {
    const paid = new Date("2026-09-12T23:30:00+08:00");
    const deadline = refundDeadline(paid);
    expect(deadline.toISOString()).toBe("2026-09-19T15:30:00.000Z");
    expect(withinRefundWindow(paid, deadline, deadline)).toBe(true);
    expect(withinRefundWindow(paid, deadline, new Date(+deadline + 1))).toBe(false);
    expect(withinRefundWindow(paid, deadline, new Date(+paid - 1))).toBe(false);
    expect(withinRefundWindow(null, deadline, paid)).toBe(false);
  });
  it("preserves a stored historical deadline rather than recalculating it with new policy", () => {
    const paid = new Date("2026-08-29T00:00:00Z");
    expect(withinRefundWindow(paid, new Date("2026-09-28T00:00:00Z"), new Date("2026-09-15T00:00:00Z"))).toBe(true);
  });
  it("has timezone-independent boundaries for every valid payment instant", () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 2_000_000_000_000 }), (ms) => {
      const paid = new Date(ms);
      expect(+refundDeadline(paid) - ms).toBe(604_800_000);
    }));
  });
});

describe("calendar billing", () => {
  it("clamps short months without drifting the original billing day", () => {
    const anchor = new Date("2027-01-31T23:30:00+08:00");
    expect(billingCycleEnd(anchor, "MONTHLY", 1).toISOString()).toBe("2027-02-28T15:30:00.000Z");
    expect(billingCycleEnd(anchor, "MONTHLY", 2).toISOString()).toBe("2027-03-31T15:30:00.000Z");
  });
  it("handles leap-year annual subscriptions", () => {
    const anchor = new Date("2024-02-29T00:00:00+08:00");
    expect(billingCycleEnd(anchor, "YEARLY").toISOString()).toBe("2025-02-27T16:00:00.000Z");
    expect(billingCycleEnd(anchor, "YEARLY", 4).toISOString()).toBe("2028-02-28T16:00:00.000Z");
  });
  it("rejects invalid gateway dates instead of using the webhook delivery time", () => {
    expect(parseEcpayPaymentDate("2026/09/12 00:00:00").toISOString()).toBe("2026-09-11T16:00:00.000Z");
    for (const value of ["", "2026/02/30 10:00:00", "2026/09/12 24:00:00", "2026-09-12"]) {
      expect(() => parseEcpayPaymentDate(value)).toThrow();
    }
  });
});
