import { describe, expect, it } from "vitest";
import { monthlyEquivalent, serviceCostSchema, serviceKeySchema } from "../packages/shared/src/operations";
import { railwaySnapshot, vercelSnapshot } from "../packages/shared/src/provider-billing";
const base = { plan: "Test", currency: "USD", billingCycle: "UNKNOWN", amountMinor: null, budgetMinor: null, renewsAt: null, notes: "", managementUrl: null };
describe("external service costs", () => {
  it("separates unknown, usage-only and verified zero fees; amortizes annual fees", () => {
    expect(monthlyEquivalent(serviceCostSchema.parse(base))).toBeNull();
    expect(monthlyEquivalent({ billingCycle: "USAGE", amountMinor: null })).toBeNull();
    expect(monthlyEquivalent({ billingCycle: "FREE", amountMinor: 0 })).toBe(0);
    expect(monthlyEquivalent({ billingCycle: "YEARLY", amountMinor: 12000 })).toBe(1000);
    expect(monthlyEquivalent({ billingCycle: "MONTHLY", amountMinor: 2000 })).toBe(2000);
  });
  it("rejects inconsistent amounts, untrusted fields and non-HTTPS management URLs", () => {
    for (const patch of [{ amountMinor: 1 }, { billingCycle: "FREE", amountMinor: null }, { billingCycle: "YEARLY" }, { billingCycle: "MONTHLY", amountMinor: -1 }, { budgetMinor: 0 }, { budgetMinor: 1.5 }, { currency: "EUR" }, { billingSnapshot: {} }, { updatedById: "spoofed" }, { managementUrl: "javascript:alert(1)" }, { managementUrl: "http://example.com" }]) {
      expect(serviceCostSchema.safeParse({ ...base, ...patch }).success).toBe(false);
    }
    expect(serviceKeySchema.safeParse("arbitrary-service").success).toBe(false);
  });
  it("records workspace scope and keeps usage, billed amount and forecast separate", () => {
    const data = railwaySnapshot({ billingPeriod: { start: "2026-09-12T00:00:00+00:00", end: "2026-10-12T00:00:00+00:00" }, workspace: { name: "Test" }, currentUsageDollars: 3.33, currentBillDollars: 0, estimatedBillDollars: 5.78, lineItems: [{ label: "Memory", currentUsageDollars: 3.33 }], customer: { secret: "never copy" } });
    expect(data).toMatchObject({ usageMinor: 333, billedMinor: 0, forecastMinor: 578 });
    expect(JSON.stringify(data)).not.toContain("never copy");
  });
  it("rounds totals after summing and does not treat a prorated Pro charge as a monthly fee", () => {
    const data = vercelSnapshot({ period: { from: "2026-09-01T00:00:00Z", to: "2026-09-30T00:00:00Z" }, context: "Test", pricingUnit: "USD", services: [{ name: "Pro", pricingUnit: "USD", effectiveCost: 2, billedCost: 0 }, { name: "CPU", pricingUnit: "USD", effectiveCost: 0.004, billedCost: 0.000000001 }, { name: "Memory", pricingUnit: "USD", effectiveCost: 0.004, billedCost: 0 }] });
    expect(data).toMatchObject({ usageMinor: 201, billedMinor: 0, forecastMinor: null });
    expect(data).not.toHaveProperty("amountMinor");
    expect(() => vercelSnapshot({ services: [] })).toThrow();
  });
});
