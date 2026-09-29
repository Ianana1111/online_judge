"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SESSION_KEY = "oj_analytics_session_v1";
type Context = { token: string; expiresAt: number; disabled?: boolean };
let contextCache: Context | null = null;
let contextPending: Promise<Context | null> | null = null;
async function getContext() {
  if (contextCache && contextCache.expiresAt > Date.now() + 60_000) return contextCache;
  if (!contextPending) contextPending = fetch("/api/analytics/context", { cache: "no-store", signal: AbortSignal.timeout(4000) })
    .then(async r => r.status === 204 ? { token: "", expiresAt: Date.now() + 3600000, disabled: true } : r.ok ? await r.json() as Context : null)
    .then(value => { contextCache = value; return value; }).catch(() => null).finally(() => { contextPending = null; });
  return contextPending;
}

function getSession() {
  const now = Date.now();
  let referrer = "";
  try { referrer = document.referrer ? new URL(document.referrer).origin : ""; } catch { /* no useful source */ }
  let session = { id: crypto.randomUUID(), lastAt: now, referrer };
  try {
    const old = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null");
    if (old && typeof old.id === "string" && /^[a-f0-9-]{36}$/i.test(old.id) && typeof old.referrer === "string" && old.referrer.length <= 500 && now - old.lastAt < 30 * 60_000 && now >= old.lastAt) session = { ...old, lastAt: now };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch { /* Storage restrictions must never affect browsing. */ }
  return session;
}

/** A view is counted once. A later update marks engagement only after ten visible seconds
 * and a trusted interaction. No key values, source code, raw IP or precise location is collected. */
export default function PageviewTracker() {
  const pathname = usePathname();
  const status = useAuthStore(s => s.status);
  const role = useAuthStore(s => s.user?.role);
  useEffect(() => {
    if (!pathname || status !== "ready" || role === "ADMIN" || pathname.startsWith("/admin") || navigator.webdriver || navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    const session = getSession();
    const eventId = crypto.randomUUID();
    let disposed = false, initialSent = false, engagedSent = false, interacted = false;
    let context: string | undefined;
    let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    let activeMs = 0;
    function elapsed() { return activeMs + (visibleSince === null ? 0 : performance.now() - visibleSince); }
    function send(engaged: boolean) {
      return fetch(`${API_URL}/analytics/pageview`, { method: "POST", credentials: "include", keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, referrer: session.referrer || undefined, context, eventId, sessionId: session.id, engaged, activeMs: Math.min(3600000, Math.floor(elapsed())), interacted }),
      }).then(response => response.ok).catch(() => false);
    }
    function check() {
      if (initialSent && context && !engagedSent && interacted && elapsed() >= 10_000) { engagedSent = true; send(true); }
    }
    function activity(event: Event) {
      if (!event.isTrusted || document.visibilityState !== "visible") return;
      interacted = true;
      check();
    }
    function visibility() {
      if (visibleSince !== null) activeMs += performance.now() - visibleSince;
      visibleSince = document.visibilityState === "visible" ? performance.now() : null;
      check();
    }
    void getContext().then(async value => {
      if (disposed || value?.disabled) return;
      context = value?.token;
      initialSent = await send(false);
      activeMs = 0;
      visibleSince = document.visibilityState === "visible" ? performance.now() : null;
      check();
    });
    const timer = setInterval(check, 1000);
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, activity, { passive: true, capture: true }));
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", check);
    return () => {
      check(); disposed = true; clearInterval(timer);
      events.forEach(event => window.removeEventListener(event, activity, true));
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", check);
    };
  }, [pathname, status, role]);
  return null;
}
