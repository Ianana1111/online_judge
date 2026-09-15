"use client";

import { useLocale, useT } from "@/lib/i18n/LocaleContext";
import type { BillingPlans } from "@/lib/types";

export function LaunchOffer({ promo }: { promo: NonNullable<BillingPlans["promo"]> }) {
  const t = useT();
  const { locale } = useLocale();
  const deadline = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Taipei", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(promo.endsAt));
  return (
    <section aria-label={t("Launch month offer")} className="rounded-xl border border-brand/40 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent p-4 text-left sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-brand">{t("Launch month offer")}</p>
      <h3 className="mt-1 font-display text-lg font-bold text-ink-50">{t("Start early. Keep a great price.")}</h3>
      <p className="mt-2 text-sm font-medium text-ink-100">{t("NT$200/month or NT$2,000/year. Keep renewing, keep your price.")}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-300">{t("Create your subscription order before {date} (Taipei time). Your price locks after the first successful payment, for uninterrupted renewals on the same billing period.", { date: deadline })}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-400">{t("Cancelling or changing billing periods ends this price lock. A new subscription uses the offer available at that time.")}</p>
    </section>
  );
}

export function LaunchPriceLocked() {
  const t = useT();
  return <div className="mt-3 rounded-lg border border-brand/30 bg-brand/10 p-3 text-xs leading-relaxed">
    <p className="font-semibold text-brand">{t("Your launch price is locked")}</p>
    <p className="mt-1 text-ink-200">{t("Your renewal amount stays the same while this subscription continues, even after the launch offer ends.")}</p>
  </div>;
}

export function PricingUnavailable({ error, retry }: { error: boolean; retry: () => void }) {
  const t = useT();
  return <div role="status" className="rounded-lg border border-ink-700 p-3 text-sm text-ink-300">
    <p>{error ? t("Prices could not be loaded. Please retry before checking out.") : t("Checking current prices…")}</p>
    {error && <button type="button" onClick={retry} className="oj-btn-secondary mt-2 px-3 py-1.5">{t("Retry")}</button>}
  </div>;
}
