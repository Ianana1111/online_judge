// Single source of truth for plan limits and prices, shared by the API (enforcement) and the web
// app (pricing page / quota display) so the two never drift.

export const FREE_SUBMIT_QUOTA = 20; // lifetime submissions a FREE account may make
export const FREE_VIRTUAL_ATTEMPTS = 2; // lifetime virtual/self-run CPE contests a FREE account may start

export type BillingPeriod = "MONTHLY" | "YEARLY";

export const PLAN_PRICING: Record<BillingPeriod, { amountNtd: number; days: number; label: string }> = {
  MONTHLY: { amountNtd: 100, days: 30, label: "月方案" },
  YEARLY: { amountNtd: 1000, days: 365, label: "年方案" },
};
