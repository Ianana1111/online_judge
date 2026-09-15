"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SparklesIcon } from "@/components/icons";
import { useBillingPlans } from "@/lib/useBillingPlans";
import { useLocale, useT } from "@/lib/i18n/LocaleContext";

function dismissKey(endsAt: string): string {
  return `promo-dismissed:${endsAt}`;
}

/** Site-wide launch-promo announcement — separate from (and in addition to) the same promo
 * showing up in the notification bell for logged-in users, since a visitor who isn't logged in
 * yet (or hasn't opened the bell) should still see it the moment they land on the site. Dismissal
 * is keyed by the promo's own endsAt, so a *future* promo (different endsAt) shows again instead
 * of staying hidden forever because of a stale localStorage flag from this one. */
export default function PromoBanner() {
  const t = useT();
  const { locale } = useLocale();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true); // default hidden until localStorage is checked, to avoid a flash

  const { data: plans } = useBillingPlans();

  useEffect(() => {
    if (!plans?.promo) return;
    try { setDismissed(localStorage.getItem(dismissKey(plans.promo.endsAt)) === "1"); }
    catch { setDismissed(false); }
  }, [plans?.promo]);

  // The upgrade flow already leads straight to this exact offer — showing the banner there too
  // would just be noise on top of what NavBar already hides itself for.
  if (pathname?.startsWith("/upgrade")) return null;
  if (!plans?.promo || dismissed) return null;

  const endsLabel = new Date(plans.promo.endsAt).toLocaleString(locale, { timeZone: "Asia/Taipei", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  return (
    <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-brand/20 bg-brand/10 py-2 pl-4 pr-12 text-center text-xs font-medium text-ink-100 sm:text-sm">
      <span className="inline-flex items-center gap-1.5">
        <SparklesIcon className="h-4 w-4 shrink-0" />
        {t("Launch offer: NT$200/month or NT$2,000/year. Continuous renewals keep the price.")}
      </span>
      <span className="text-ink-300">{t("Join before {date} (Taipei)", { date: endsLabel })}</span>
      <Link href="/upgrade" className="whitespace-nowrap rounded px-2 py-1 font-semibold text-brand underline underline-offset-4">
        {t("View offer →")}
      </Link>
      <button
        type="button"
        aria-label={t("Dismiss")}
        onClick={() => {
          try { localStorage.setItem(dismissKey(plans.promo!.endsAt), "1"); } catch { /* Dismiss for this visit. */ }
          setDismissed(true);
        }}
        className="absolute right-2 flex h-8 w-8 items-center justify-center rounded text-ink-300 hover:bg-brand/10"
      >
        ✕
      </button>
    </div>
  );
}
