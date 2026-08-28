"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useT } from "@/lib/i18n/LocaleContext";

const GRACE_DAYS = 3;

/** Full-screen block for an account with a pending deletion request (Settings > Account) — the
 * account is meant to be logged out and unusable from the moment deletion is requested (see
 * users.service.deleteAccount), but that request also immediately clears this browser's cookies,
 * so in practice the only way anyone ever sees this gate is by logging back in during the grace
 * period. Unlike ProfileSetupGate, this isn't dismissable: the only ways out are cancelling the
 * deletion or logging out again. */
export default function PendingDeletionGate() {
  const { user, setUser, logout } = useAuthStore();
  const t = useT();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user?.deletionRequestedAt) return null;

  const deleteAt = new Date(new Date(user.deletionRequestedAt).getTime() + GRACE_DAYS * 24 * 3600 * 1000);

  async function cancel() {
    setError(null);
    setCancelling(true);
    try {
      await apiFetch("/users/me/cancel-deletion", { method: "POST" });
      setUser({ ...user!, deletionRequestedAt: null });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Couldn't cancel — try again in a moment."));
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950 p-4">
      <div className="oj-card w-full max-w-md p-6 text-center">
        <h1 className="font-display text-lg font-semibold text-verdict-wa">{t("Account deletion pending")}</h1>
        <p className="mt-3 text-sm text-ink-300">
          {t("Your account is scheduled to be permanently deleted on {date}.", {
            date: deleteAt.toLocaleString(),
          })}
        </p>
        <p className="mt-2 text-sm text-ink-400">
          {t("If you didn't request this, cancel it below. If you did, no action is needed — it will go through automatically.")}
        </p>
        {error && <p className="mt-3 text-sm text-verdict-wa">{error}</p>}
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={() => logout()} className="oj-btn-secondary px-4 py-2 text-sm">
            {t("Log out")}
          </button>
          <button type="button" onClick={cancel} disabled={cancelling} className="oj-btn-primary px-4 py-2 text-sm">
            {cancelling ? t("Cancelling…") : t("Cancel deletion")}
          </button>
        </div>
      </div>
    </div>
  );
}
