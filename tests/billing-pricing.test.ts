import { describe, expect, it } from "vitest";
import { billingCatalog, hasLaunchPriceLock, type LaunchPricingConfig } from "../packages/shared/src/billingPricing";

const launch: LaunchPricingConfig = { startsAt: "2026-09-15T00:00:00+08:00", endsAt: "2026-10-15T00:00:00+08:00", regularYearlyPriceNtd: "3500" };
describe("launch pricing and fixed renewal terms", () => {
  it("keeps existing prices without claiming an unconfigured campaign", () => {
    expect(billingCatalog()).toMatchObject({ pricingVersion: "legacy-v1", promo: null, refreshAt: null, effectivePricing: { MONTHLY: 200, YEARLY: 2000 } });
  });
  it("starts inclusively and ends exclusively using Taipei instants", () => {
    const before = billingCatalog(launch, new Date("2026-09-14T15:59:59.999Z"));
    expect(before.promo).toBeNull(); expect(hasLaunchPriceLock(before.pricingVersion)).toBe(false);
    expect(before.refreshAt).toBe("2026-09-14T16:00:00.000Z");
    for (const date of ["2026-09-14T16:00:00.000Z", "2026-10-14T15:59:59.999Z"]) {
      const active = billingCatalog(launch, new Date(date));
      expect(active.effectivePricing).toEqual({ MONTHLY: 200, YEARLY: 2000 });
      expect(active.pricing.MONTHLY.amountNtd).toBe(350);
      expect(active.pricing.YEARLY.amountNtd).toBe(3500);
      expect(hasLaunchPriceLock(active.pricingVersion)).toBe(true);
      expect(active.promo?.endsAt).toBe("2026-10-14T16:00:00.000Z");
    }
    const ended = billingCatalog(launch, new Date("2026-10-14T16:00:00.000Z"));
    expect(ended.effectivePricing).toEqual({ MONTHLY: 350, YEARLY: 3500 });
    expect(ended.promo).toBeNull(); expect(ended.refreshAt).toBeNull();
    expect(hasLaunchPriceLock(ended.pricingVersion)).toBe(false);
  });
  it("does not reset the offer when the process or clock date advances", () => {
    const later = billingCatalog(launch, new Date("2035-01-01T00:00:00Z"));
    expect(later.promo).toBeNull(); expect(later.effectivePricing.MONTHLY).toBe(350);
  });
  it("invalidates consent at expiry even if the regular annual price also happens to be 2000", () => {
    const config = { ...launch, regularYearlyPriceNtd: "2000" };
    const active = billingCatalog(config, new Date(launch.startsAt!)), ended = billingCatalog(config, new Date(launch.endsAt!));
    expect(active.effectivePricing.YEARLY).toBe(ended.effectivePricing.YEARLY);
    expect(active.pricingVersion).not.toBe(ended.pricingVersion);
  });
  it.each([
    { startsAt: launch.startsAt }, { ...launch, endsAt: undefined }, { ...launch, regularYearlyPriceNtd: "" },
    { ...launch, startsAt: "2026-09-15T00:00:00" }, { ...launch, endsAt: "2026-11-15T00:00:00+08:00" },
    { ...launch, startsAt: "2026-02-30T00:00:00+08:00", endsAt: "2026-04-02T00:00:00+08:00" },
    { ...launch, regularYearlyPriceNtd: "2000.50" }, { ...launch, regularYearlyPriceNtd: "-1" },
    { ...launch, regularYearlyPriceNtd: "10000000000000000" },
  ])("fails closed for incomplete or invalid operator configuration: %j", (config) => {
    expect(() => billingCatalog(config)).toThrow();
  });
  it("handles the end of a short month without extending the campaign", () => {
    const config = { ...launch, startsAt: "2028-01-31T00:00:00+08:00", endsAt: "2028-02-29T00:00:00+08:00" };
    expect(billingCatalog(config, new Date("2028-02-28T23:59:59+08:00")).promo).not.toBeNull();
    expect(billingCatalog(config, new Date(config.endsAt)).promo).toBeNull();
  });
});
