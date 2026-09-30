import { z } from "zod";
import { providerBillingSnapshotSchema } from "./operations.js";
const dollars = z.number().finite().nonnegative();
const iso = z.string().refine(s => Number.isFinite(Date.parse(s))).transform(s => new Date(s).toISOString());
const minor = (value: number) => Math.round(value * 100);
export function railwaySnapshot(input: unknown) {
  const data = z.object({
    billingPeriod: z.object({ start: iso, end: iso }), workspace: z.object({ name: z.string() }),
    currentUsageDollars: dollars, currentBillDollars: dollars.nullable(), estimatedBillDollars: dollars.nullable(),
    lineItems: z.array(z.object({ label: z.string(), currentUsageDollars: dollars })),
  }).parse(input);
  return providerBillingSnapshotSchema.parse({
    currency: "USD", scope: `Railway Workspace · ${data.workspace.name}`, source: "Railway CLI usage",
    periodStart: data.billingPeriod.start, periodEnd: data.billingPeriod.end,
    usageMinor: minor(data.currentUsageDollars), billedMinor: data.currentBillDollars === null ? null : minor(data.currentBillDollars),
    forecastMinor: data.estimatedBillDollars === null ? null : minor(data.estimatedBillDollars),
    breakdown: data.lineItems.filter(row => row.currentUsageDollars > 0).map(row => ({ label: row.label, amountMinor: minor(row.currentUsageDollars) })),
    note: "工作區整體用量，可能含其他專案。計費與預估以 Railway 回報為準；方案底費、抵扣與稅額請核對帳單，勿與月均固定費直接相加。",
  });
}
export function vercelSnapshot(input: unknown) {
  const data = z.object({
    period: z.object({ from: iso, to: iso }), context: z.string(), pricingUnit: z.literal("USD"),
    services: z.array(z.object({ name: z.string(), pricingUnit: z.literal("USD"), effectiveCost: dollars, billedCost: dollars })),
  }).parse(input);
  return providerBillingSnapshotSchema.parse({
    currency: "USD", scope: `Vercel Team · ${data.context}`, source: "Vercel CLI usage",
    periodStart: data.period.from, periodEnd: data.period.to,
    usageMinor: minor(data.services.reduce((sum, row) => sum + row.effectiveCost, 0)),
    billedMinor: minor(data.services.reduce((sum, row) => sum + row.billedCost, 0)), forecastMinor: null,
    breakdown: data.services.filter(row => row.effectiveCost > 0).map(row => ({ label: row.name, amountMinor: minor(row.effectiveCost) })).sort((a, b) => b.amountMinor - a.amountMinor),
    note: "團隊範圍的用量原價，可能包含其他專案及按天計算的方案費。來源回報計費為抵扣後資料，並非信用卡最終帳單；不可把本期 Pro 項目當成每月訂閱價。",
  });
}
