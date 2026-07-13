"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Fires a lightweight pageview beacon on every client-side route change, for the self-hosted
 * traffic analytics under /admin/analytics (distinct from @vercel/analytics, mounted alongside
 * it — this one is queryable/filterable on our own terms, see analytics.service.ts). Deliberately
 * NOT apiFetch: this is fire-and-forget, doesn't need the CSRF header (the endpoint is exempt,
 * see csrf.guard.ts) or the auth-refresh-retry machinery, and must never throw into the app.
 */
export default function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    fetch(`${API_URL}/analytics/pageview`, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || undefined }),
    }).catch(() => {
      /* best-effort — a dropped analytics beacon must never affect the app */
    });
  }, [pathname]);

  return null;
}
