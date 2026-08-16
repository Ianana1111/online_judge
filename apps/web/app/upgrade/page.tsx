"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import BackButton from "@/components/BackButton";
import type { BillingPlans, BillingStatus } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

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
  const t = useT();
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
        <h2 className="font-display text-base font-semibold text-ink-50">{t("Downgrade to Free Plan?")}</h2>
        <p className="mt-2 text-sm text-ink-300">
          {expiresLabel
            ? t("You'll keep full Pro access until {date} — nothing changes right away. After that date, your account switches to Free automatically.", { date: expiresLabel })
            : t("You'll keep full Pro access until your paid period ends — nothing changes right away. After that date, your account switches to Free automatically.")}
        </p>
        {error && <p className="mt-3 text-sm text-verdict-wa">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="oj-btn-secondary px-4 py-2 text-sm" disabled={submitting}>
            {t("Keep Pro")}
          </button>
          <button type="button" onClick={onConfirm} className="oj-btn-primary px-4 py-2 text-sm" disabled={submitting}>
            {submitting ? t("Confirming…") : t("Confirm Downgrade")}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnsubscribeConfirmDialog({
  submitting,
  error,
  onCancel,
  onConfirm,
}: {
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useT();
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
        <h2 className="font-display text-base font-semibold text-ink-50">{t("Unsubscribe from Pro?")}</h2>
        <p className="mt-2 text-sm text-ink-300">
          {t("This takes effect immediately — you'll switch back to Free right now, and your card won't be charged again.")}
        </p>
        {error && <p className="mt-3 text-sm text-verdict-wa">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="oj-btn-secondary px-4 py-2 text-sm" disabled={submitting}>
            {t("Keep Pro")}
          </button>
          <button type="button" onClick={onConfirm} className="oj-btn-primary px-4 py-2 text-sm" disabled={submitting}>
            {submitting ? t("Unsubscribing…") : t("Unsubscribe now")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePlanPage() {
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthStore();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [unsubscribeError, setUnsubscribeError] = useState<string | null>(null);

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

  // Distinct from confirmCancel above: an active Subscription auto-charges again next period, so
  // cancelling it stops that future charge and drops the user to Free right away — there's no
  // already-paid time being cut short, unlike the one-time-purchase soft-cancel.
  async function confirmUnsubscribe() {
    setUnsubscribing(true);
    setUnsubscribeError(null);
    try {
      await apiFetch("/billing/subscription/cancel", { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
      setShowUnsubscribeConfirm(false);
    } catch (e) {
      setUnsubscribeError(e instanceof ApiError ? e.message : "無法取消訂閱，請稍後再試");
    } finally {
      setUnsubscribing(false);
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
            <h1 className="font-display text-xl font-bold text-ink-50 sm:text-2xl">{t("Upgrade your plan")}</h1>
            <p className="mt-1 text-xs text-ink-400 sm:text-sm">
              {t("Score is difficulty-weighted and Pro removes every cap — pick the plan that fits how you practice.")}
            </p>
          </div>

          {authStatus === "ready" && !user && (
            <div className="oj-card p-4 text-center text-sm text-ink-300">
              {t("Please")}{" "}
              <Link href="/login" className="text-brand hover:underline">
                {t("log in")}
              </Link>{" "}
              {t("to upgrade.")}
            </div>
          )}

          {user && notApplicable && (
            <div className="oj-card p-4 text-center text-sm text-ink-300">
              {isAdmin ? t("Admin accounts already have no submit or contest limits.") : t("Student accounts are already Pro — no need to upgrade.")}
            </div>
          )}

          {(!user || (user && !notApplicable && !isLoading)) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="oj-card flex flex-col p-4 sm:p-5">
                <h2 className="font-display text-base font-semibold text-ink-100 sm:text-lg">{t("Free")}</h2>
                <p className="mt-1 text-2xl font-bold text-ink-50 sm:text-3xl">
                  NT$0<span className="text-xs font-normal text-ink-400 sm:text-sm"> {t("forever")}</span>
                </p>
                <ul className="mt-3 flex-1 space-y-1.5 sm:mt-4 sm:space-y-2">
                  <Check>
                    {status
                      ? t("{used}/{limit} submissions this month", { used: status.submits.used, limit: status.submits.limit ?? 0 })
                      : t("10 submissions / month")}
                  </Check>
                  <Check>
                    {status
                      ? t("{used}/{limit} virtual CPE contests this month", {
                          used: status.virtualContests.used,
                          limit: status.virtualContests.limit ?? 0,
                        })
                      : t("1 self-run virtual CPE contest / month")}
                  </Check>
                  <Check>{t("Full access to discussions & leaderboard")}</Check>
                </ul>
                {isPro && status?.subscription ? (
                  <p className="mt-4 text-center text-[11px] text-ink-500">
                    {t("Manage your subscription from the Pro card →")}
                  </p>
                ) : isPro ? (
                  status?.planCancelRequested ? (
                    <p className="mt-4 rounded border border-ink-700 bg-ink-800/50 px-3 py-2 text-center text-xs text-ink-300">
                      {expiresLabel
                        ? t("✓ Downgrade confirmed — you'll move to Free on {date}.", { date: expiresLabel })
                        : t("✓ Downgrade confirmed — you'll move to Free when your Pro period ends.")}
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
                        {t("Downgrade to Free Plan")}
                      </button>
                      <p className="mt-1.5 text-center text-[11px] text-ink-500">
                        {expiresLabel
                          ? t("You'll keep Pro until {date}, then switch to Free automatically — nothing else to do.", { date: expiresLabel })
                          : t("You'll keep Pro until your paid period ends, then switch to Free automatically — nothing else to do.")}
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
                    {t("Stay on Free Plan")}
                  </button>
                )}
              </div>

              <div className="oj-card relative flex flex-col border-brand/50 p-4 sm:p-5">
                {!isPro && promo && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-verdict-wa px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-onbrand">
                    {t("{pct}% off — first month", { pct: promo.discountPct })}
                  </span>
                )}
                <h2 className="font-display text-base font-semibold text-brand sm:text-lg">Pro</h2>
                {isPro && status?.subscription ? (
                  <>
                    <p className="mt-1 text-2xl font-bold text-ink-50 sm:text-3xl">
                      NT${status.subscription.amountNtd}
                      <span className="text-xs font-normal text-ink-400 sm:text-sm">
                        {" "}
                        / {status.subscription.period === "MONTHLY" ? t("month") : t("year")}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-verdict-ac sm:text-sm">
                      <svg width="12" height="12" viewBox="0 0 16 16" className="shrink-0" fill="none">
                        <circle cx="8" cy="8" r="6" fill="currentColor" />
                      </svg>
                      {expiresLabel
                        ? t("Subscribed — renews on {date}", { date: expiresLabel })
                        : t("Subscribed — renews automatically")}
                    </p>
                  </>
                ) : isPro ? (
                  <p className="mt-1 text-base font-semibold text-ink-50 sm:text-lg">
                    {t("Active")}
                    {expiresLabel ? (
                      <span className="block text-xs font-normal text-ink-400 sm:text-sm">{t("until {date}", { date: expiresLabel })}</span>
                    ) : null}
                  </p>
                ) : promo ? (
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-normal text-ink-500 line-through">NT${listPrice}</span>
                    <span className="text-2xl font-bold text-ink-50 sm:text-3xl">
                      NT${nowPrice}
                      <span className="text-xs font-normal text-ink-400 sm:text-sm"> / {t("month")}</span>
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-2xl font-bold text-ink-50 sm:text-3xl">
                    NT${nowPrice}
                    <span className="text-xs font-normal text-ink-400 sm:text-sm"> / {t("month")}</span>
                  </p>
                )}
                <ul className="mt-3 flex-1 space-y-1.5 sm:mt-4 sm:space-y-2">
                  <Check>{t("Unlimited submissions")}</Check>
                  <Check>{t("Unlimited self-run virtual CPE contests")}</Check>
                  <Check>{t("See & sort by past-CPE-exam appearance count")}</Check>
                  <Check>{t("Full access to discussions & leaderboard")}</Check>
                  <Check>{t("Priority support")}</Check>
                </ul>
                {isPro && status?.subscription ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setUnsubscribeError(null);
                        setShowUnsubscribeConfirm(true);
                      }}
                      className="oj-btn-secondary mt-4 w-full py-2 text-sm"
                    >
                      {t("Unsubscribe")}
                    </button>
                    <p className="mt-1.5 text-center text-[11px] text-ink-500">
                      {t("Cancels immediately — you'll switch to Free right away and won't be charged again.")}
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/upgrade/checkout")}
                    className="oj-btn-primary mt-4 w-full py-2 text-sm"
                    disabled={!user}
                  >
                    {isPro ? t("Extend Pro Plan") : t("Get Pro Plan")}
                  </button>
                )}
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
      {showUnsubscribeConfirm && (
        <UnsubscribeConfirmDialog
          submitting={unsubscribing}
          error={unsubscribeError}
          onCancel={() => setShowUnsubscribeConfirm(false)}
          onConfirm={confirmUnsubscribe}
        />
      )}
    </div>
  );
}
