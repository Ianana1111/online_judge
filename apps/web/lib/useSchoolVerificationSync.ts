"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "./api";
import type { User } from "./types";
import { useAuthStore } from "@/store/auth";

/** A mail link can open in another browser profile, so no shared browser storage or
 * broadcast event is sufficient. Recheck the server while a school claim is pending.
 * Do not hydrate the whole auth store: that can interrupt unsaved settings edits. */
export function useSchoolVerificationSync() {
  const user = useAuthStore((s) => s.user);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<"pending" | "error" | null>(null);
  const inFlight = useRef(false);
  const pending = !!user?.schoolEmail && !user.schoolVerifiedAt;
  const refresh = useCallback(async (manual = false) => {
    const before = useAuthStore.getState().user;
    if (!before?.schoolEmail || before.schoolVerifiedAt || inFlight.current) return;
    inFlight.current = true;
    if (manual) { setChecking(true); setResult(null); }
    try {
      const fresh = await apiFetch<User>("/auth/me");
      const current = useAuthStore.getState().user;
      // An account, school or email may change while this request is in flight.
      if (current?.id !== before.id || fresh.id !== before.id || current.school !== before.school ||
        fresh.school !== before.school || current.schoolEmail !== before.schoolEmail || fresh.schoolEmail !== before.schoolEmail) return;
      if (fresh.schoolVerifiedAt) useAuthStore.getState().patchUser(before.id, { schoolVerifiedAt: fresh.schoolVerifiedAt });
      else if (manual) setResult("pending");
    } catch { if (manual) setResult("error"); }
    finally { inFlight.current = false; if (manual) setChecking(false); }
  }, []);
  useEffect(() => {
    if (!pending) return;
    const checkVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    checkVisible();
    window.addEventListener("focus", checkVisible);
    document.addEventListener("visibilitychange", checkVisible);
    const timer = window.setInterval(checkVisible, 15_000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", checkVisible);
      document.removeEventListener("visibilitychange", checkVisible);
    };
  }, [pending, user?.id, user?.schoolEmail, refresh]);
  return { refresh, checking, result };
}
