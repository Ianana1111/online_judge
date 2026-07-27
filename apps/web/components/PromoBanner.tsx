"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SparklesIcon } from "@/components/icons";
import type { BillingPlans } from "@/lib/types";

function dismissKey(endsAt: string): string {
  return `promo-dismissed:${endsAt}`;
}

/** Site-wide launch-promo announcement — separate from (and in addition to) the same promo
 * showing up in the notification bell for logged-in users, since a visitor who isn't logged in
 * yet (or hasn't opened the bell) should still see it the moment they land on the site. Dismissal
 * is keyed by the promo's own endsAt, so a *future* promo (different endsAt) shows again instead
 * of staying hidden forever because of a stale localStorage flag from this one. */
export default function PromoBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true); // default hidden until localStorage is checked, to avoid a flash

  const { data: plans } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => apiFetch<BillingPlans>("/billing/plans"),
  });

  useEffect(() => {
    if (!plans?.promo) return;
    setDismissed(localStorage.getItem(dismissKey(plans.promo.endsAt)) === "1");
  }, [plans?.promo]);

  // The upgrade flow already leads straight to this exact offer — showing the banner there too
  // would just be noise on top of what NavBar already hides itself for.
  if (pathname?.startsWith("/upgrade")) return null;
  if (!plans?.promo || dismissed) return null;

  const endsLabel = new Date(plans.promo.endsAt).toLocaleDateString();

  return (
    <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-brand/90 to-verdict-wa/90 px-4 py-2 text-center text-xs font-medium text-onbrand sm:text-sm">
      <span className="inline-flex items-center gap-1.5">
        <SparklesIcon className="h-4 w-4 shrink-0" />
        We just launched! Get Pro at <span className="font-bold">{plans.promo.discountPct}% off</span> through {endsLabel}.
      </span>
      <Link href="/upgrade" className="whitespace-nowrap rounded bg-onbrand/15 px-2 py-0.5 font-semibold hover:bg-onbrand/25">
        Claim discount →
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(dismissKey(plans.promo!.endsAt), "1");
          setDismissed(true);
        }}
        className="absolute right-2 text-onbrand/70 hover:text-onbrand"
      >
        ✕
      </button>
    </div>
  );
}
