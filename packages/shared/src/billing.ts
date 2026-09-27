// Shared plan limits and historical prices. billingPricing.ts evaluates the current catalog;
// paid orders and recurring subscriptions retain the amounts originally saved in the database.

// FREE tier limits reset every calendar month (see billing.service.assertCanSubmit /
// assertCanStartVirtual) — these are the per-month allowances, not lifetime caps.
export const FREE_SUBMIT_QUOTA = 10; // submissions a FREE account may make per calendar month
export const FREE_VIRTUAL_ATTEMPTS = 1; // virtual/self-run CPE contests a FREE account may start per calendar month
export const FREE_RUN_QUOTA = 20; // test runs a FREE account may start per calendar month

export type BillingPeriod = "MONTHLY" | "YEARLY";

// Unconfigured-campaign prices and legacy grant durations. Recurring periods are calendar based.
export const PLAN_PRICING: Record<BillingPeriod, { amountNtd: number; days: number; label: string }> = {
  MONTHLY: { amountNtd: 200, days: 30, label: "月方案" },
  YEARLY: { amountNtd: 2000, days: 365, label: "年方案" },
};

export type EcpayMethod = "CREDIT" | "ATM";
