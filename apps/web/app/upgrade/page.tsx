"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import BackButton from "@/components/BackButton";
import type { BillingStatus } from "@/lib/types";

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-ink-200">
      <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0 text-verdict-ac" fill="none">
        <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}

function DowngradeConfirmDialog({
  expiresLabel,
  submitting,
  error,
  onCancel,
  onConfirm,
}: {
  expiresLabel: string | null;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div className="oj-card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-base font-semibold text-ink-50">Downgrade to Free Plan?</h2>
        <p className="mt-2 text-sm text-ink-300">
          You'll keep full Pro access {expiresLabel ? `until ${expiresLabel}` : "until your paid period ends"} — nothing changes
          right away. After that date, your account switches to Free automatically.
        </p>
        {error && <p className="mt-3 text-sm text-verdict-wa">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="oj-btn-secondary px-4 py-2 text-sm" disabled={submitting}>
            Keep Pro
          </button>
          <button type="button" onClick={onConfirm} className="oj-btn-primary px-4 py-2 text-sm" disabled={submitting}>
            {submitting ? "Confirming…" : "Confirm Downgrade"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePlanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthStore();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data: status, isLoading } = useQuery({
    queryKey: ["billing", "me"],
    queryFn: () => apiFetch<BillingStatus>("/billing/me"),
    enabled: !!user,
  });

  const isAdmin = user?.role === "ADMIN";
  const isPro = status?.plan === "PRO";
  const expiresLabel = status?.planExpiresAt ? new Date(status.planExpiresAt).toLocaleDateString() : null;

  // There's no auto-renewal in this system — every ECPay/manual payment is a one-time purchase
  // that extends planExpiresAt, never a recurring charge — so confirming doesn't touch plan/expiry
  // at all; Pro already lapses back to Free on its own once planExpiresAt passes. The call only
  // persists the user's choice so the UI keeps reflecting it across reloads.
  async function confirmCancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      await apiFetch("/billing/cancel", { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
      setShowCancelConfirm(false);
    } catch (e) {
      setCancelError(e instanceof ApiError ? e.message : "無法送出，請稍後再試");
    } finally {
      setCancelling(false);
    }
  }
  // Admins aren't capped at all, and students are auto-Pro (see billing.service.isProActive) —
  // neither of them has anything to upgrade, so don't offer a purchase flow that can't apply to
  // them (mirrors NavBar's showUpgrade condition, since this page is reachable by direct URL too).
  const notApplicable = isAdmin || user?.isStudent;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
      <div>
        <BackButton />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <div className="w-full max-w-3xl space-y-10">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-ink-50">Upgrade your plan</h1>
            <p className="mt-2 text-sm text-ink-400">
              Score is difficulty-weighted and Pro removes every cap — pick the plan that fits how you practice.
            </p>
          </div>

          {authStatus === "ready" && !user && (
            <div className="oj-card p-5 text-center text-sm text-ink-300">
              Please{" "}
              <Link href="/login" className="text-brand hover:underline">
                log in
              </Link>{" "}
              to upgrade.
            </div>
          )}

          {user && notApplicable && (
            <div className="oj-card p-5 text-center text-sm text-ink-300">
              {isAdmin ? "Admin accounts already have no submit or contest limits." : "Student accounts are already Pro — no need to upgrade."}
            </div>
          )}

          {(!user || (user && !notApplicable && !isLoading)) && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="oj-card flex flex-col p-6">
                <h2 className="font-display text-lg font-semibold text-ink-100">Free</h2>
                <p className="mt-2 text-3xl font-bold text-ink-50">
                  NT$0<span className="text-sm font-normal text-ink-400"> forever</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  <Check>{status ? `${status.submits.used}/${status.submits.limit} submissions used` : "20 submissions total"}</Check>
                  <Check>
                    {status
                      ? `${status.virtualContests.used}/${status.virtualContests.limit} self-run virtual CPE contests used`
                      : "2 self-run virtual CPE contests"}
                  </Check>
                  <Check>Full access to discussions &amp; leaderboard</Check>
                </ul>
                {isPro ? (
                  status?.planCancelRequested ? (
                    <p className="mt-6 rounded border border-ink-700 bg-ink-800/50 px-3 py-2 text-center text-xs text-ink-300">
                      ✓ Downgrade confirmed — you'll move to Free{" "}
                      {expiresLabel ? `on ${expiresLabel}` : "when your Pro period ends"}.
                    </p>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setCancelError(null);
                          setShowCancelConfirm(true);
                        }}
                        className="oj-btn-secondary mt-6 w-full"
                      >
                        Downgrade to Free Plan
                      </button>
                      <p className="mt-2 text-center text-xs text-ink-500">
                        You'll keep Pro {expiresLabel ? `until ${expiresLabel}` : "until your paid period ends"}, then switch to
                        Free automatically — nothing else to do.
                      </p>
                    </>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="oj-btn-secondary mt-6 w-full"
                    disabled={!user}
                  >
                    Stay on Free Plan
                  </button>
                )}
              </div>

              <div className="oj-card flex flex-col border-brand/50 p-6">
                <h2 className="font-display text-lg font-semibold text-brand">Pro</h2>
                {isPro ? (
                  <p className="mt-2 text-lg font-semibold text-ink-50">
                    Active{expiresLabel ? <span className="block text-sm font-normal text-ink-400">until {expiresLabel}</span> : null}
                  </p>
                ) : (
                  <p className="mt-2 text-3xl font-bold text-ink-50">
                    NT$200<span className="text-sm font-normal text-ink-400"> / month</span>
                  </p>
                )}
                <ul className="mt-6 flex-1 space-y-2.5">
                  <Check>Unlimited submissions</Check>
                  <Check>Unlimited self-run virtual CPE contests</Check>
                  <Check>Full access to discussions &amp; leaderboard</Check>
                  <Check>Priority support</Check>
                </ul>
                <button
                  type="button"
                  onClick={() => router.push("/upgrade/checkout")}
                  className="oj-btn-primary mt-6 w-full"
                  disabled={!user}
                >
                  {isPro ? "Extend Pro Plan" : "Get Pro Plan"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <DowngradeConfirmDialog
          expiresLabel={expiresLabel}
          submitting={cancelling}
          error={cancelError}
          onCancel={() => setShowCancelConfirm(false)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
}
