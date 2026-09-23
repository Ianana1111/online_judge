"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import BackButton from "@/components/BackButton";
import type { BillingStatus } from "@/lib/types";
import { useBillingPlans } from "@/lib/useBillingPlans";
import { LaunchOffer, LaunchPriceLocked, PricingUnavailable } from "@/components/LaunchOffer";
import { useT } from "@/lib/i18n/LocaleContext";
import { useFocusTrap } from "@/lib/useFocusTrap";
import type { BillingPeriod } from "@oj/shared";
import { BillingPeriodPicker, BillingPriceDetails } from "@/components/BillingPeriodPicker";
import pricingStyles from "@/components/PricingDesign.module.css";

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-200">
      <svg width="14" height="14" viewBox="0 0 16 16" className="mt-1 shrink-0 text-ink-400" fill="none">
        <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}

function RequestRefundConfirmDialog({
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
  const trapRef = useFocusTrap<HTMLDivElement>(true);
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
      aria-labelledby="refund-title"
      onClick={onCancel}
    >
      <div ref={trapRef} tabIndex={-1} className="oj-card w-full max-w-sm p-5 outline-none" onClick={(e) => e.stopPropagation()}>
        <h2 id="refund-title" className="font-display text-base font-semibold text-ink-50">{t("Request a full refund?")}</h2>
        <p className="mt-2 text-sm text-ink-300">
          {t(
            "Requests a full refund of your first payment and stops future renewal. The refunded Pro period ends after processing. This guarantee is available once per account.",
          )}
        </p>
        <p className="mt-2 text-sm text-ink-400">
          {t("We send the refund to the gateway within minutes. Your card issuer decides when it posts — usually 7-14 business days, at most by your next statement.")}
        </p>
        {error && <p className="mt-3 text-sm text-verdict-wa">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="oj-btn-secondary px-4 py-2 text-sm" disabled={submitting}>
            {t("Keep Pro")}
          </button>
          <button type="button" onClick={onConfirm} className="oj-btn-primary px-4 py-2 text-sm" disabled={submitting}>
            {submitting ? t("Processing…") : t("Refund me")}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnsubscribeConfirmDialog({
  expiresLabel,
  launchPriceLocked,
  refundEligibleUntilLabel,
  submitting,
  error,
  onCancel,
  onConfirm,
  onSwitchToRefund,
}: {
  expiresLabel: string | null;
  launchPriceLocked: boolean;
  /** Set only while the first-payment refund is still available — unsubscribing is then the wrong
   * action for anyone who actually wants their money back, so say so here rather than describing
   * only the post-window rule they aren't subject to yet. */
  refundEligibleUntilLabel: string | null;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  onSwitchToRefund: () => void;
}) {
  const t = useT();
  const trapRef = useFocusTrap<HTMLDivElement>(true);
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
      aria-labelledby="unsubscribe-title"
      onClick={onCancel}
    >
      <div ref={trapRef} tabIndex={-1} className="oj-card w-full max-w-sm p-5 outline-none" onClick={(e) => e.stopPropagation()}>
        <h2 id="unsubscribe-title" className="font-display text-base font-semibold text-ink-50">{t("Unsubscribe from Pro?")}</h2>
        <p className="mt-2 text-sm text-ink-300">
          {expiresLabel
            ? t("Your card won't be charged again. You'll keep full Pro access until {date}, then switch to Free automatically.", { date: expiresLabel })
            : t("Your card won't be charged again. You'll keep full Pro access until your current period ends, then switch to Free automatically.")}
        </p>
        {launchPriceLocked && <p className="mt-3 text-sm text-ink-200">{t("Cancelling ends your launch price lock. Your paid access remains until expiry; subscribing again uses the price available then.")}</p>}
        {refundEligibleUntilLabel ? (
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3">
            <p className="text-sm text-ink-200">
              {t("This only stops renewal — it does not return your last payment. You can still get that payment back in full until {date}.", { date: refundEligibleUntilLabel })}
            </p>
            <p className="mt-1.5 text-sm text-ink-300">{t("A refund ends your Pro access as soon as it is processed, rather than letting it run to the date above.")}</p>
            <button type="button" onClick={onSwitchToRefund} className="mt-2 text-sm font-medium text-brand underline-offset-4 hover:underline" disabled={submitting}>
              {t("Request a full refund instead →")}
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-300">{t("This only cancels renewal; it does not request a refund. After the 7-day first-payment refund window, your paid monthly or annual access continues until expiry.")}</p>
        )}
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
  const [period, setPeriod] = useState<BillingPeriod>("MONTHLY");
  const { user, status: authStatus } = useAuthStore();
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [unsubscribeError, setUnsubscribeError] = useState<string | null>(null);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const { data: status, isLoading } = useQuery({
    queryKey: ["billing", "me"],
    queryFn: () => apiFetch<BillingStatus>("/billing/me"),
    enabled: !!user,
    refetchInterval: (query) => {
      const refund = query.state.data?.refundRequest;
      return refund && refund.status !== "COMPLETED" ? 5000 : false;
    },
  });
  const { data: plans, isError: pricingError, refetch: refreshPrices } = useBillingPlans();

  const isAdmin = user?.role === "ADMIN";
  const isPro = status?.plan === "PRO";
  const expiresLabel = status?.planExpiresAt ? new Date(status.planExpiresAt).toLocaleDateString() : null;
  const refundEligibleUntilLabel = status?.refundEligibleUntil
    ? new Date(status.refundEligibleUntil).toLocaleString(undefined, { timeZone: "Asia/Taipei", hour12: false }) + " (UTC+8)"
    : null;

  useEffect(() => {
    if (user?.id && status?.refundRequest?.status === "COMPLETED" && status.plan !== user.plan) {
      useAuthStore.getState().patchUser(user.id, { plan: status.plan });
    }
  }, [user?.id, user?.plan, status?.plan, status?.refundRequest?.status]);

  // Stops the next ECPay auto-charge while the already-paid Pro period remains active until its
  // planExpiresAt. The Free card below reports that scheduled transition without another action.
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
  // Persist the request first. The worker withdraws the refunded access once the gateway
  // confirms the refund; polling above keeps this page in sync with that durable result.
  async function confirmRefund() {
    setRefunding(true);
    setRefundError(null);
    try {
      await apiFetch("/billing/refund/request", { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
      setShowRefundConfirm(false);
    } catch (e) {
      setRefundError(e instanceof ApiError ? e.message : "無法處理退款，請稍後再試");
    } finally {
      setRefunding(false);
    }
  }

  // Admins aren't capped at all, and students are auto-Pro (see billing.service.isProActive) —
  // neither of them has anything to upgrade, so don't offer a purchase flow that can't apply to
  // them (mirrors NavBar's showUpgrade condition, since this page is reachable by direct URL too).
  const notApplicable = isAdmin || user?.isStudent;

  const promo = plans?.promo;

  return (
    // NavBar renders nothing on /upgrade* (see NavBar's own check) and Footer does the same (see
    // Footer's own check) — so unlike every other page, there's no 56px navbar to subtract here,
    // only <main>'s own py-6 (3rem, top+bottom).
    <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-5xl flex-col px-5 py-4 sm:px-8">
      <div className="shrink-0">
        <BackButton />
      </div>

      <div className="flex flex-1 flex-col items-center py-10 sm:py-14">
        <div className="w-full max-w-[820px] space-y-7">
          <div className="pb-2 text-center">
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-ink-400">JUDGE. PRO</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50 sm:text-4xl">{t("Upgrade your plan")}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">
              {t("Build your practice habit. Choose the pace that works for you.")}
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

          {!isPro && !notApplicable && promo && <LaunchOffer promo={promo} />}
          {(!user || (user && !notApplicable && !isLoading)) && (
            <div className="grid items-start gap-5 sm:grid-cols-2">
              <div className={`${pricingStyles.surface} order-2 flex flex-col p-6 sm:order-1 sm:p-7`}>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-50">{t("Free")}</h2>
                <p className="mb-6 mt-2 text-sm text-ink-400">{t("Start with everyday practice.")}</p>
                <p className="flex min-h-[46px] items-center text-xs text-ink-400">{t("No credit card required")}</p>
                <div className="min-h-[156px] py-5">
                  <p className="text-xs leading-5 text-ink-400">{t("Free to get started")}</p>
                  <p className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-[44px] font-semibold leading-tight tracking-[-0.04em] text-ink-50">NT$0</span>
                    <span className="text-sm text-ink-400">/ {t("forever")}</span>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-300">{t("Practice, explore, and find your rhythm.")}</p>
                </div>
                {isPro && status?.subscription ? (
                  <p className="mt-4 text-center text-[11px] text-ink-500">
                    {t("Manage your subscription from the Pro card →")}
                  </p>
                ) : isPro ? (
                  <p className="mt-4 rounded-lg border border-verdict-ac/20 bg-verdict-ac/5 px-3 py-3 text-center text-xs leading-5 text-ink-300">
                    {expiresLabel
                      ? t("You'll keep Pro until {date}, then switch to Free automatically — nothing else to do.", { date: expiresLabel })
                      : t("You'll keep Pro until your paid period ends, then switch to Free automatically — nothing else to do.")}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="oj-btn-secondary w-full rounded-[10px] py-3 text-sm"
                    disabled={!user}
                  >
                    {t("Stay on Free Plan")}
                  </button>
                )}
                <ul className="mt-6 space-y-3 border-t border-ink-700/70 pt-6">
                  <Check>
                    {status
                      ? t("{used}/{limit} submissions this month", { used: status.submits.used, limit: status.submits.limit ?? 0 })
                      : t("10 submissions / month")}
                  </Check>
                  <Check>
                    {status
                      ? t("{used}/{limit} virtual CPE/GPE contests this month", {
                          used: status.virtualContests.used,
                          limit: status.virtualContests.limit ?? 0,
                        })
                      : t("1 self-run virtual CPE/GPE contest / month")}
                  </Check>
                  <Check>{t("Full access to discussions & leaderboard")}</Check>
                </ul>
              </div>

              <div className={`${pricingStyles.surface} ${pricingStyles.featured} relative order-1 flex flex-col p-6 sm:order-2 sm:p-7`}>
                {!isPro && promo && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-verdict-wa px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-onbrand">
                    {t("Launch month offer")}
                  </span>
                )}
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-50">Pro</h2>
                {!status?.subscription && <p className="mb-6 mt-2 text-sm text-ink-400">{t("For focused, consistent practice.")}</p>}
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
                      {status.subscription.nextChargeAt
                        ? t("Subscribed — renews on {date}", { date: new Date(status.subscription.nextChargeAt).toLocaleDateString(undefined, { timeZone: "Asia/Taipei" }) })
                        : t("Subscribed — renews automatically")}
                    </p>
                    {status.subscription.launchPriceLocked && <LaunchPriceLocked />}
                  </>
                ) : isPro ? (
                  <div data-testid="pro-access-status" className="mb-6 mt-2 rounded-xl border border-verdict-ac/20 bg-verdict-ac/5 px-4 py-3">
                    <p className="flex items-start gap-2 text-base font-semibold text-ink-50 sm:text-lg">
                      <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-verdict-ac" />
                      <span>
                        {t("Active")}
                        {expiresLabel ? (
                          <span className="mt-0.5 block text-xs font-normal text-ink-400 sm:text-sm">{t("until {date}", { date: expiresLabel })}</span>
                        ) : null}
                      </span>
                    </p>
                  </div>
                ) : !plans ? (
                  <PricingUnavailable error={pricingError} retry={() => { void refreshPrices(); }} />
                ) : (
                  <>
                    <BillingPeriodPicker period={period} prices={plans.effectivePricing} onChange={setPeriod} />
                    <BillingPriceDetails period={period} prices={plans.effectivePricing} promo={plans.promo} pricing={plans.pricing} />
                  </>
                )}
                {isPro && status?.subscription ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setUnsubscribeError(null);
                        setShowUnsubscribeConfirm(true);
                      }}
                      className="oj-btn-secondary w-full rounded-[10px] py-3 text-sm"
                    >
                      {t("Unsubscribe")}
                    </button>
                    <p className="mt-1.5 text-center text-[11px] text-ink-500">
                      {expiresLabel
                        ? t("Stops auto-renewal — you'll keep Pro until {date}, then switch to Free automatically.", { date: expiresLabel })
                        : t("Stops auto-renewal — you'll keep Pro until your current period ends, then switch to Free automatically.")}
                    </p>

                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push(`/upgrade/checkout?period=${period}`)}
                    className={`${pricingStyles.primary} w-full py-3 text-sm`}
                    disabled={!user || !plans}
                  >
                    {isPro ? t("Extend Pro Plan") : t("Get Pro Plan")}
                  </button>
                )}
                {!isPro && <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-400">{t("Request a full refund within 7 days of your first payment")}</p>}
                <ul className="mt-6 space-y-3 border-t border-ink-700/70 pt-6">
                  <Check>{t("Unlimited submissions")}</Check>
                  <Check>{t("Unlimited self-run virtual CPE/GPE contests")}</Check>
                  <Check>{t("See & sort by past CPE/GPE appearance count")}</Check>
                  <Check>{t("Official editorials in Chinese and English, with judge-verified code")}</Check>
                  <Check>{t("Full access to discussions & leaderboard")}</Check>
                  <Check>{t("Priority support")}</Check>
                </ul>
                    {status?.refundEligibleUntil && (
                      <button
                        type="button"
                        onClick={() => {
                          setRefundError(null);
                          setShowRefundConfirm(true);
                        }}
                        className="mt-2 w-full py-1 text-center text-[11px] text-ink-500 underline hover:text-verdict-wa"
                      >
                        {t("Not what you expected? Request a full refund (until {date})", { date: refundEligibleUntilLabel! })}
                      </button>
                    )}
                {status?.refundRequest && (
                  <p role="status" className="mt-4 rounded-lg border border-ink-700 bg-ink-800/50 p-3 text-sm text-ink-200">
                    {status.refundRequest.status === "COMPLETED" ? t("Refund sent to your card issuer. It usually posts within 7-14 business days, at most by your next statement — contact us if it hasn't after 30 days.") :
                      status.refundRequest.status === "NEEDS_REVIEW" ? t("Your refund request is saved and awaiting payment verification. You do not need to submit it again.") :
                        t("Your refund request is saved. We are processing the refund and stopping future renewal.")}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-ink-400">
            <Link href="/faq" className="underline-offset-4 hover:underline">{t("Billing questions")}</Link>
            <Link href="/refund" className="underline-offset-4 hover:underline">{t("Refund & subscription policy")}</Link>
          </div>
        </div>
      </div>

      {showUnsubscribeConfirm && (
        <UnsubscribeConfirmDialog
          expiresLabel={expiresLabel}
          launchPriceLocked={!!status?.subscription?.launchPriceLocked}
          refundEligibleUntilLabel={refundEligibleUntilLabel}
          submitting={unsubscribing}
          error={unsubscribeError}
          onCancel={() => setShowUnsubscribeConfirm(false)}
          onConfirm={confirmUnsubscribe}
          onSwitchToRefund={() => { setShowUnsubscribeConfirm(false); setShowRefundConfirm(true); }}
        />
      )}
      {showRefundConfirm && (
        <RequestRefundConfirmDialog
          submitting={refunding}
          error={refundError}
          onCancel={() => setShowRefundConfirm(false)}
          onConfirm={confirmRefund}
        />
      )}
    </div>
  );
}
