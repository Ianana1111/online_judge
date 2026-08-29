// Single source of truth for plan limits and prices, shared by the API (enforcement) and the web
// app (pricing page / quota display) so the two never drift.

// FREE tier limits reset every calendar month (see billing.service.assertCanSubmit /
// assertCanStartVirtual) — these are the per-month allowances, not lifetime caps.
export const FREE_SUBMIT_QUOTA = 10; // submissions a FREE account may make per calendar month
export const FREE_VIRTUAL_ATTEMPTS = 1; // virtual/self-run CPE contests a FREE account may start per calendar month
// Runs are cheap, high-frequency "test before you submit" iteration (each spins up its own
// sandbox microVM though, so still real compute cost) — set well above realistic even-heavy-study
// usage, existing only as an abuse/cost backstop rather than a business-model lever like the
// submit quota above.
export const FREE_RUN_QUOTA = 300; // test runs a FREE account may start per calendar month

export type BillingPeriod = "MONTHLY" | "YEARLY";

// Real launch prices. `days` is each plan's NORMAL per-charge length — a brand new YEARLY
// subscription's first charge additionally grants a one-time +30-day bonus on top of this
// (see billing.service's FIRST_YEARLY_SUBSCRIPTION_BONUS_DAYS), so the "2000 NTD for 13 months"
// promise doesn't need its own separate constant here.
export const PLAN_PRICING: Record<BillingPeriod, { amountNtd: number; days: number; label: string }> = {
  MONTHLY: { amountNtd: 200, days: 30, label: "月方案" },
  YEARLY: { amountNtd: 2000, days: 365, label: "年方案" },
};

/** Launch promo: 50% off the monthly plan for judge.tw's first month of real operation. A fixed
 * end date (not "30 days from whenever the server happens to restart") so the discount doesn't
 * silently extend itself on every deploy. Currently inactive — the first-month refund guarantee
 * (billing.service.requestRefund) is judge.tw's actual new-user incentive now; leaving this false
 * rather than deleting it in case a separate future promo period wants the same mechanism. */
export const LAUNCH_PROMO = {
  active: false,
  period: "MONTHLY" as const,
  discountPct: 50,
  endsAt: "2026-08-26T00:00:00+08:00",
};

export function isLaunchPromoActive(now: Date = new Date()): boolean {
  return LAUNCH_PROMO.active && now.getTime() < new Date(LAUNCH_PROMO.endsAt).getTime();
}

/** The real, current NTD amount a purchase of this period should charge right now — the single
 * place that ever needs to know about the launch promo, so billing.service (charging real money)
 * and the pricing UI (displaying it) can never disagree about what today's price actually is. */
export function effectivePriceNtd(period: BillingPeriod, now: Date = new Date()): number {
  const base = PLAN_PRICING[period].amountNtd;
  if (period === LAUNCH_PROMO.period && isLaunchPromoActive(now)) {
    return Math.round(base * (1 - LAUNCH_PROMO.discountPct / 100));
  }
  return base;
}

export type EcpayMethod = "CREDIT" | "ATM";
