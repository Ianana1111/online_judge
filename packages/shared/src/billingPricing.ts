import { PLAN_PRICING, type BillingPeriod } from "./billing.js";
import { billingCycleEnd } from "./billingPolicy.js";
import { z } from "zod";

export const LAUNCH_RENEWAL_PRICING = { MONTHLY: 200, YEARLY: 2000 } as const;
export const REGULAR_MONTHLY_PRICE_NTD = 400;
export interface LaunchPricingConfig {
  startsAt?: string;
  endsAt?: string;
  regularYearlyPriceNtd?: string;
}
export interface BillingCatalog {
  pricing: typeof PLAN_PRICING;
  effectivePricing: Record<BillingPeriod, number>;
  pricingVersion: string;
  serverNow: string;
  refreshAt: string | null;
  promo: { startsAt: string; endsAt: string; renewalPricing: Record<BillingPeriod, number> } | null;
}

/** Fixed operator-approved dates only. Empty configuration preserves existing prices; partial or
 * invalid configuration must stop NEW checkout, never silently pick a different charge amount.
 * Webhooks deliberately do not call this: paid orders and renewals retain their saved terms. */
export function billingCatalog(config: LaunchPricingConfig = {}, now = new Date()): BillingCatalog {
  if (!Number.isFinite(+now)) throw new Error("Invalid pricing timestamp");
  const values = [config.startsAt, config.endsAt, config.regularYearlyPriceNtd];
  if (values.every((value) => !value)) return {
    pricing: PLAN_PRICING,
    effectivePricing: { MONTHLY: PLAN_PRICING.MONTHLY.amountNtd, YEARLY: PLAN_PRICING.YEARLY.amountNtd },
    pricingVersion: "legacy-v1", serverNow: now.toISOString(), refreshAt: null, promo: null,
  };
  const iso = z.string().datetime({ offset: true });
  const start = new Date(config.startsAt ?? ""), end = new Date(config.endsAt ?? "");
  const annual = Number(config.regularYearlyPriceNtd);
  if (!values.every(Boolean) || !iso.safeParse(config.startsAt).success || !iso.safeParse(config.endsAt).success ||
    !Number.isFinite(+start) || !Number.isFinite(+end) || +end !== +billingCycleEnd(start, "MONTHLY") ||
    !/^\d+$/.test(config.regularYearlyPriceNtd!) || !Number.isSafeInteger(annual) || annual < 2000 || annual > 100_000) {
    throw new Error("Launch pricing requires one fixed calendar month and an approved regular annual price");
  }
  const phase = +now < +start ? "before" : +now < +end ? "active" : "ended";
  const pricing = {
    MONTHLY: { ...PLAN_PRICING.MONTHLY, amountNtd: REGULAR_MONTHLY_PRICE_NTD },
    YEARLY: { ...PLAN_PRICING.YEARLY, amountNtd: annual },
  };
  return {
    // Before the launch, preserve the existing public price without claiming launch eligibility.
    pricing: phase === "before" ? PLAN_PRICING : pricing,
    effectivePricing: phase === "ended" ? { MONTHLY: REGULAR_MONTHLY_PRICE_NTD, YEARLY: annual } : { ...LAUNCH_RENEWAL_PRICING },
    pricingVersion: `launch-v2/${+start}/${+end}/${REGULAR_MONTHLY_PRICE_NTD}/${annual}/${phase}`,
    serverNow: now.toISOString(),
    refreshAt: phase === "before" ? start.toISOString() : phase === "active" ? end.toISOString() : null,
    promo: phase === "active" ? { startsAt: start.toISOString(), endsAt: end.toISOString(), renewalPricing: { ...LAUNCH_RENEWAL_PRICING } } : null,
  };
}

export function hasLaunchPriceLock(pricingVersion: string): boolean {
  return /^launch-v1\/\d+\/\d+\/\d+\/active$/.test(pricingVersion) ||
    /^launch-v2\/\d+\/\d+\/\d+\/\d+\/active$/.test(pricingVersion);
}
