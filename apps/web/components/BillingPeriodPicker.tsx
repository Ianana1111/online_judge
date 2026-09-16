"use client";

import type { BillingPeriod } from "@oj/shared";
import type { BillingPlans } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";
import styles from "./PricingDesign.module.css";

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
    <div role="group" aria-label={t("Billing period")} className={`${styles.picker} grid grid-cols-[1fr_1.3fr] gap-1 p-1`}>
      {(["MONTHLY", "YEARLY"] as const).map((choice) => (
        <button key={choice} type="button" aria-label={choice === "MONTHLY" ? t("Monthly subscription") : t("Annual subscription")} aria-pressed={period === choice} disabled={disabled}
          onClick={() => { if (choice !== period) onChange(choice); }}
          className={`flex min-h-9 flex-wrap items-center justify-center gap-x-2 rounded-lg px-2 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${period === choice ? styles.selected : "text-ink-300 hover:text-ink-50"}`}>
          <span>{choice === "MONTHLY" ? t("Monthly") : t("Yearly")}</span>
          {choice === "YEARLY" && saving > 0 && <span className="text-[10px] text-ink-300">{t("Save NT${amount}", { amount: saving.toLocaleString() })}</span>}
        </button>
      ))}
    </div>
  );
}

export function BillingPriceDetails({ period, prices, promo, pricing }: {
  period: BillingPeriod; prices: Prices; promo?: BillingPlans["promo"]; pricing?: BillingPlans["pricing"];
}) {
  const t = useT();
  const annual = period === "YEARLY";
  const saving = prices.MONTHLY * 12 - prices.YEARLY;
  const amount = prices[period].toLocaleString();
  const comparison = promo && pricing && pricing[period].amountNtd > prices[period] ? pricing[period].amountNtd : null;
  return (
    <div aria-live="polite" aria-atomic="true" className="min-h-[156px] py-5">
      <p className="text-xs leading-5 text-ink-400">
        {comparison ? <>{t("New subscription price after launch")} <s className="ml-1">NT${comparison.toLocaleString()}</s></>
          : annual && saving > 0 ? <>{t("12 monthly payments total")} <s className="ml-1">NT${(prices.MONTHLY * 12).toLocaleString()}</s></> : t("Pay one month at a time")}
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-display text-[44px] font-semibold leading-tight tracking-[-0.04em] text-ink-50">NT${amount}</span>
        <span className="text-sm text-ink-400">/ {annual ? t("year") : t("month")}</span>
      </p>
      <p className="mt-2 text-xs leading-relaxed text-ink-300">
        {annual
          ? t("NT${total} billed yearly, about NT${average}/month.", { total: amount, average: Math.round(prices.YEARLY / 12).toLocaleString() })
          : t("NT${amount} billed monthly. Cancel renewal anytime.", { amount })}
      </p>
      {comparison && <p className="mt-2 text-xs leading-relaxed text-ink-300">{t("Join during launch and keep this renewal price while your subscription continues.")}</p>}
    </div>
  );
}
