"use client";

import type { BillingPeriod } from "@oj/shared";
import type { BillingPlans } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

type Prices = BillingPlans["effectivePricing"];

export function BillingPeriodPicker({ period, prices, onChange, disabled = false }: {
  period: BillingPeriod;
  prices: Prices;
  onChange: (period: BillingPeriod) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const saving = prices.MONTHLY * 12 - prices.YEARLY;
  return (
    <div role="group" aria-label={t("Billing period")} className="grid grid-cols-2 gap-1 rounded-xl border border-ink-700 bg-ink-900/50 p-1">
      {(["MONTHLY", "YEARLY"] as const).map((choice) => (
        <button key={choice} type="button" aria-pressed={period === choice} disabled={disabled}
          onClick={() => { if (choice !== period) onChange(choice); }}
          className={`min-h-14 rounded-lg px-2 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${period === choice ? "bg-brand text-onbrand shadow-sm" : "text-ink-300 hover:bg-ink-800 hover:text-ink-50"}`}>
          <span className="block">{choice === "MONTHLY" ? t("Monthly subscription") : t("Annual subscription")}</span>
          <span className="mt-0.5 block text-[11px] font-medium">
            {choice === "YEARLY" && saving > 0
              ? t("Save NT${amount}/year", { amount: saving.toLocaleString() })
              : choice === "MONTHLY" ? t("Pay one month at a time") : t("One payment per year")}
          </span>
        </button>
      ))}
    </div>
  );
}

export function BillingPriceDetails({ period, prices }: { period: BillingPeriod; prices: Prices }) {
  const t = useT();
  const annual = period === "YEARLY";
  const saving = prices.MONTHLY * 12 - prices.YEARLY;
  const amount = prices[period].toLocaleString();
  return (
    <div aria-live="polite" aria-atomic="true" className="min-h-40 pt-4">
      <p className="text-xs text-ink-400">
        {annual && saving > 0 ? <>{t("12 monthly payments total")} <s className="ml-1">NT${(prices.MONTHLY * 12).toLocaleString()}</s></> : t("A steady habit, at your own pace.")}
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-display text-4xl font-bold tracking-tight text-ink-50">NT${amount}</span>
        <span className="text-sm text-ink-400">/ {annual ? t("year") : t("month")}</span>
      </p>
      <p className="mt-2 text-xs leading-relaxed text-ink-300">
        {annual
          ? t("NT${total} billed yearly, about NT${average}/month.", { total: amount, average: Math.round(prices.YEARLY / 12).toLocaleString() })
          : t("NT${amount} billed monthly. Cancel renewal anytime.", { amount })}
      </p>
      {saving > 0 && <p className="mt-3 inline-flex rounded-md border border-brand/25 bg-brand/10 px-2 py-1 text-xs font-medium text-ink-100">
        {t("Annual billing saves NT${amount} compared with 12 monthly payments.", { amount: saving.toLocaleString() })}
      </p>}
    </div>
  );
}
