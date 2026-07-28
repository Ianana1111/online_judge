"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import BackButton from "@/components/BackButton";
import type { BillingPlans, BillingStatus } from "@/lib/types";

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5 text-xs text-ink-200 sm:text-sm">
      <svg width="14" height="14" viewBox="0 0 16 16" className="mt-0.5 shrink-0 text-verdict-ac" fill="none">
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
  const { data: plans } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => apiFetch<BillingPlans>("/billing/plans"),
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

  const listPrice = plans?.pricing.MONTHLY.amountNtd ?? 500;
  const nowPrice = plans?.effectivePricing.MONTHLY ?? listPrice;
  const promo = plans?.promo;

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col overflow-y-auto px-6 py-4">
      <div className="shrink-0">
        <BackButton />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-2">
        <div className="w-full max-w-3xl space-y-4">
          <div className="text-center">
            <h1 className="font-display text-xl font-bold text-ink-50 sm:text-2xl">Upgrade your plan</h1>
            <p className="mt-1 text-xs text-ink-400 sm:text-sm">
              Score is difficulty-weighted and Pro removes every cap — pick the plan that fits how you practice.
            </p>
          </div>

          {authStatus === "ready" && !user && (
            <div className="oj-card p-4 text-center text-sm text-ink-300">
              Please{" "}
              <Link href="/login" className="text-brand hover:underline">
                log in
              </Link>{" "}
              to upgrade.
            </div>
          )}

          {user && notApplicable && (
            <div className="oj-card p-4 text-center text-sm text-ink-300">
              {isAdmin ? "Admin accounts already have no submit or contest limits." : "Student accounts are already Pro — no need to upgrade."}
            </div>
          )}

          {(!user || (user && !notApplicable && !isLoading)) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="oj-card flex flex-col p-4 sm:p-5">
                <h2 className="font-display text-base font-semibold text-ink-100 sm:text-lg">Free</h2>
                <p className="mt-1 text-2xl font-bold text-ink-50 sm:text-3xl">
                  NT$0<span className="text-xs font-normal text-ink-400 sm:text-sm"> forever</span>
                </p>
                <ul className="mt-3 flex-1 space-y-1.5 sm:mt-4 sm:space-y-2">
                  <Check>
                    {status ? `${status.submits.used}/${status.submits.limit} submissions this month` : "10 submissions / month"}
                  </Check>
                  <Check>
                    {status
                      ? `${status.virtualContests.used}/${status.virtualContests.limit} virtual CPE contests this month`
                      : "1 self-run virtual CPE contest / month"}
                  </Check>
                  <Check>Full access to discussions &amp; leaderboard</Check>
                </ul>
                {isPro ? (
                  status?.planCancelRequested ? (
                    <p className="mt-4 rounded border border-ink-700 bg-ink-800/50 px-3 py-2 text-center text-xs text-ink-300">
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
                        className="oj-btn-secondary mt-4 w-full py-2 text-sm"
                      >
                        Downgrade to Free Plan
                      </button>
                      <p className="mt-1.5 text-center text-[11px] text-ink-500">
                        You'll keep Pro {expiresLabel ? `until ${expiresLabel}` : "until your paid period ends"}, then switch to
                        Free automatically — nothing else to do.
                      </p>
                    </>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="oj-btn-secondary mt-4 w-full py-2 text-sm"
                    disabled={!user}
                  >
                    Stay on Free Plan
                  </button>
                )}
              </div>

              <div className="oj-card relative flex flex-col border-brand/50 p-4 sm:p-5">
                {!isPro && promo && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-verdict-wa px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-onbrand">
                    {promo.discountPct}% off — first month
                  </span>
                )}
                <h2 className="font-display text-base font-semibold text-brand sm:text-lg">Pro</h2>
                {isPro ? (
                  <p className="mt-1 text-base font-semibold text-ink-50 sm:text-lg">
                    Active{expiresLabel ? <span className="block text-xs font-normal text-ink-400 sm:text-sm">until {expiresLabel}</span> : null}
                  </p>
                ) : promo ? (
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-normal text-ink-500 line-through">NT${listPrice}</span>
                    <span className="text-2xl font-bold text-ink-50 sm:text-3xl">
                      NT${nowPrice}
                      <span className="text-xs font-normal text-ink-400 sm:text-sm"> / month</span>
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-2xl font-bold text-ink-50 sm:text-3xl">
                    NT${nowPrice}
                    <span className="text-xs font-normal text-ink-400 sm:text-sm"> / month</span>
                  </p>
                )}
                <ul className="mt-3 flex-1 space-y-1.5 sm:mt-4 sm:space-y-2">
                  <Check>Unlimited submissions</Check>
                  <Check>Unlimited self-run virtual CPE contests</Check>
                  <Check>See &amp; sort by past-CPE-exam appearance count</Check>
                  <Check>Full access to discussions &amp; leaderboard</Check>
                  <Check>Priority support</Check>
                </ul>
                <button
                  type="button"
                  onClick={() => router.push("/upgrade/checkout")}
                  className="oj-btn-primary mt-4 w-full py-2 text-sm"
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
