import { z } from "zod";

export const SERVICE_KEYS = ["railway", "vercel", "resend", "domain", "ecpay", "google", "github", "discord", "sentry"] as const;
export const serviceKeySchema = z.enum(SERVICE_KEYS);
export type ServiceKey = z.infer<typeof serviceKeySchema>;
export const serviceCostSchema = z.object({
  plan: z.string().trim().max(80),
  currency: z.enum(["USD", "TWD"]),
  billingCycle: z.enum(["UNKNOWN", "MONTHLY", "YEARLY", "USAGE", "FREE"]),
  amountMinor: z.number().int().min(0).max(100_000_000).nullable(),
  budgetMinor: z.number().int().min(1).max(100_000_000).nullable(),
  renewsAt: z.string().datetime().nullable(),
  notes: z.string().trim().max(1000),
  managementUrl: z.string().url().startsWith("https://").max(500).nullable(),
}).strict().superRefine((v, ctx) => {
  if (v.billingCycle === "FREE" && v.amountMinor !== 0) ctx.addIssue({ code: "custom", path: ["amountMinor"], message: "Free plans must explicitly record zero" });
  if (["MONTHLY", "YEARLY"].includes(v.billingCycle) && v.amountMinor === null) ctx.addIssue({ code: "custom", path: ["amountMinor"], message: "Recurring plans need an amount" });
  if (["UNKNOWN", "USAGE"].includes(v.billingCycle) && v.amountMinor !== null) ctx.addIssue({ code: "custom", path: ["amountMinor"], message: "No fixed amount for unknown or usage-only plans" });
});
export type ServiceCostInput = z.infer<typeof serviceCostSchema>;
export const providerBillingSnapshotSchema = z.object({
  currency: z.literal("USD"), scope: z.string().max(120), source: z.string().max(120),
  periodStart: z.string().datetime(), periodEnd: z.string().datetime(),
  usageMinor: z.number().int().nonnegative(), billedMinor: z.number().int().nonnegative().nullable(), forecastMinor: z.number().int().nonnegative().nullable(),
  note: z.string().max(600), breakdown: z.array(z.object({ label: z.string().max(100), amountMinor: z.number().int().nonnegative() })).max(40),
}).strict();
export type ProviderBillingSnapshot = z.infer<typeof providerBillingSnapshotSchema>;
export type ServiceCost = ServiceCostInput & { updatedAt: string | null; billingSnapshot: ProviderBillingSnapshot | null; billingCheckedAt: string | null };
export type ExternalServiceRow = {
  key: ServiceKey; name: string; category: string; description: string; dashboardUrl: string; pricingUrl: string;
  status: "ok" | "attention" | "configured" | "unknown" | "inactive"; statusLabel: string;
  facts: { label: string; value: string }[]; cost: ServiceCost;
};
export type ExternalServicesDashboard = { measuredAt: string; services: ExternalServiceRow[] };
export function monthlyEquivalent(cost: Pick<ServiceCostInput, "billingCycle" | "amountMinor">): number | null {
  if (cost.billingCycle === "FREE") return 0;
  if (cost.amountMinor === null) return null;
  if (cost.billingCycle === "YEARLY") return cost.amountMinor / 12;
  return cost.billingCycle === "MONTHLY" ? cost.amountMinor : null;
}
export type AdminOverview = {
  measuredAt: string; accounts: number; newAccounts30d: number; activePro: number; activeSubscriptions: number;
  confirmedGross30d: number; refunds30d: number; cancelledSubscriptions30d: number;
  pendingPosts: number; pendingComments: number; pendingSchools: number; pendingRefunds: number;
  problems: number; visibleProblems: number; contests: number; assignments: number; liveExams: number;
};
