"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import BackButton from "@/components/BackButton";
import type { BillingStatus } from "@/lib/types";
import { useBillingPlans } from "@/lib/useBillingPlans";
import { LaunchOffer, LaunchPriceLocked, PricingUnavailable } from "@/components/LaunchOffer";
import { useT } from "@/lib/i18n/LocaleContext";
import { BillingPeriodPicker, BillingPriceDetails } from "@/components/BillingPeriodPicker";
import pricingStyles from "@/components/PricingDesign.module.css";

type Period = "MONTHLY" | "YEARLY";

export default function CheckoutRoute() {
  const t = useT();
  return <Suspense fallback={<p role="status" className="p-6 text-sm text-ink-300">{t("Loading…")}</p>}><CheckoutPage /></Suspense>;
}

function CheckoutPage() {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const { user, status: authStatus } = useAuthStore();
  const period: Period = useSearchParams().get("period") === "YEARLY" ? "YEARLY" : "MONTHLY";
  const [ecpayError, setEcpayError] = useState<string | null>(null);
  const [ecpayLoading, setEcpayLoading] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [agreedQuote, setAgreedQuote] = useState<string | null>(null);

  // Paying with ECPay does a real <form method="POST"> navigation off-site to their hosted
  // checkout (see startEcpay below) — that's a genuine browser history entry on ECPay's own
  // origin, and their multi-step checkout is itself POST-chained internally. Once ECPay redirects
  // back here (ClientBackURL), pressing the browser's native Back button walks straight back into
  // that POST chain, which Chrome/etc. can only handle by prompting "confirm form resubmission" —
  // there's no cross-origin API to clean up or rewrite entries created on ecpay.com.tw's own
  // domain, so preventing the prompt itself isn't possible. What IS in our control: trap Back
  // *from this page* so it never actually walks into that chain — push a guard entry and, on any
  // popstate (back/forward), immediately send them to the homepage instead. The page already has
  // its own explicit BackButton for intentional navigation, so losing the native gesture here
  // costs nothing.
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    function onPopState() {
      window.history.pushState(null, "", window.location.href);
      router.push("/");
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [router]);

  const { data: plans, isError: pricingError, refetch: refreshPrices } = useBillingPlans();
  const { data: status, isLoading: statusLoading, isError: statusError, refetch: refreshStatus } = useQuery({
    queryKey: ["billing", "me"],
    queryFn: () => apiFetch<BillingStatus>("/billing/me"),
    enabled: !!user,
    // Payment status can change from a webhook we don't otherwise get notified of — poll gently
    // while a payment is pending so this page reflects approval automatically, no manual refresh.
    refetchInterval: (query) => (query.state.data?.pendingPayment ? 5000 : false),
  });

  const isAdmin = user?.role === "ADMIN";
  const notApplicable = isAdmin || user?.isStudent;
  const isPro = status?.plan === "PRO";
  // A subscribed user already auto-renews — there's genuinely nothing to buy. A Pro user who
  // *isn't* subscribed (one-time ATM purchase, or an admin grant) can still extend, so they still
  // reach the picker below instead of being dead-ended here.
  const isSubscribed = !!status?.subscription;
  const pending = status?.pendingPayment;

  const amount = plans?.effectivePricing[period];
  const promo = plans?.promo;
  const quoteKey = plans ? `${plans.pricingVersion}/${period}/${amount}` : null;
  const agreed = quoteKey !== null && agreedQuote === quoteKey;

  async function startEcpay() {
    if (!plans || !amount || !agreed || !user || !status || ecpayLoading) return;
    setEcpayError(null);
    setEcpayLoading(true);
    try {
      const res = await apiFetch<{ actionUrl: string; fields: Record<string, string | number>; sandbox: boolean }>(
        "/billing/ecpay/create",
        { method: "POST", body: { period, expectedAmountNtd: amount, pricingVersion: plans.pricingVersion } },
      );
      // ECPay's checkout is a hosted page, not a JSON API — the browser itself has to navigate
      // there via a form POST carrying the signed order fields.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.actionUrl;
      for (const [k, v] of Object.entries(res.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      // Deliberately leave ecpayLoading true — the page is about to navigate away entirely, so
      // there's no "done loading" moment to show; the spinner just stays up through the redirect.
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setAgreedQuote(null);
        setEcpayError(t("Pricing changed. Review the current price and confirm again."));
        await refreshPrices();
      } else setEcpayError(e instanceof ApiError ? t(e.message) : t("Could not create your order. Please try again."));
      setEcpayLoading(false);
    }
  }

  // Doesn't cancel the order with ECPay itself (not possible — an ATM virtual account stays valid
  // on their end regardless) and doesn't touch its PENDING status either, so if the user goes
  // ahead and pays it anyway, the webhook still approves it normally. This only hides it from this
  // page so they can pick a different plan/period/method instead of being stuck looking at it.
  async function dismissPending() {
    setDismissing(true);
    try {
      await apiFetch("/billing/dismiss-pending", { method: "POST" });
      await qc.invalidateQueries({ queryKey: ["billing", "me"] });
    } catch {
      /* best-effort */
    } finally {
      setDismissing(false);
    }
  }

  return (
    // NavBar renders nothing on /upgrade* (see NavBar's own check) and Footer does the same (see
    // Footer's own check) — so unlike every other page, there's no 56px navbar to subtract here,
    // only <main>'s own py-6 (3rem, top+bottom).
    <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-4xl flex-col px-5 py-4 sm:px-8">
      <div className="shrink-0">
        <BackButton fallbackHref="/upgrade" />
      </div>

      <div className="flex flex-1 flex-col py-10 sm:py-14">
        <div className="w-full space-y-7">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50">{t("Subscribe to Pro")}</h1>
            <p className="mt-1 text-xs text-ink-400 sm:text-sm">{t("Unlimited submissions and virtual contests, billed however suits you.")}</p>
          </div>

          {authStatus === "ready" && !user ? (
            <div className="oj-card p-5 text-sm text-ink-300">
              {t("Please")}{" "}
              <Link href="/login" className="text-brand hover:underline">
                {t("log in")}
              </Link>{" "}
              {t("to upgrade.")}
            </div>
          ) : authStatus !== "ready" || statusLoading ? (
            <p role="status" className="text-sm text-ink-300">{t("Loading…")}</p>
          ) : statusError ? (
            <div role="alert" className="oj-card p-5 text-sm text-ink-300">
              <p>{t("Could not load your subscription. Please retry.")}</p>
              <button type="button" onClick={() => { void refreshStatus(); }} className="oj-btn-secondary mt-3 px-3 py-2">{t("Retry")}</button>
            </div>
          ) : notApplicable ? (
            <div className="oj-card p-5 text-sm text-ink-300">
              {isAdmin ? t("Admin accounts already have no submit or contest limits.") : t("Student accounts are already Pro — no need to upgrade.")}
            </div>
          ) : isSubscribed ? (
            <div className="oj-card border-verdict-ac/40 p-5 text-sm text-ink-200">
              <p>
                {status?.planExpiresAt
                  ? t("✓ You're already subscribed to Pro — NT${amount} / {period}, renews automatically on {date}.", {
                      amount: status.subscription!.amountNtd,
                      period: status.subscription!.period === "MONTHLY" ? t("month") : t("year"),
                      date: new Date(status.planExpiresAt).toLocaleDateString(),
                    })
                  : t("✓ You're already subscribed to Pro — NT${amount} / {period}, renews automatically.", {
                      amount: status.subscription!.amountNtd,
                      period: status.subscription!.period === "MONTHLY" ? t("month") : t("year"),
                    })}
              </p>
              {status?.subscription?.launchPriceLocked && <LaunchPriceLocked />}
              <Link href="/upgrade" className="mt-2 inline-block text-brand hover:underline">
                {t("Manage your subscription →")}
              </Link>
            </div>
          ) : pending ? (
            <div className="space-y-3">
              <div className="oj-card border-verdict-tle/40 p-5 text-sm">
                {pending.method === "ECPAY" ? (
                  <>
                    <p className="font-semibold text-verdict-tle">{t("Confirming your card payment…")}</p>
                    <p className="mt-1 text-ink-300">{t("This is usually instant. This page updates automatically once it clears.")}</p>
                    <p className="mt-2 text-ink-200">{t("Order amount: NT${amount}", { amount: pending.amountNtd.toLocaleString() })}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-verdict-tle">{t("Payment under review")}</p>
                    <p className="mt-1 text-ink-300">
                      {t("We've received your {period} plan (NT${amount}) payment claim — Pro unlocks as soon as we confirm the transfer.", {
                        period: pending.period === "MONTHLY" ? t("monthly") : t("yearly"),
                        amount: pending.amountNtd,
                      })}
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={dismissPending}
                disabled={dismissing}
                className="oj-btn-secondary w-full py-2.5 text-sm disabled:opacity-50"
              >
                {dismissing ? t("Cancelling…") : t("Not now — cancel and choose again")}
              </button>
            </div>
          ) : !plans ? (
            <PricingUnavailable error={pricingError} retry={() => { void refreshPrices(); }} />
          ) : (
            <div className="sm:grid sm:grid-cols-5 sm:items-start sm:gap-6">
              <div className="space-y-4 sm:col-span-3">
                {promo && <LaunchOffer promo={promo} />}
                {isPro && (
                  <div className="oj-card border-verdict-ac/40 p-2.5 text-xs text-ink-300">
                    {status?.planExpiresAt
                      ? t("✓ You're already on Pro until {date}. Subscribing now extends it further.", {
                          date: new Date(status.planExpiresAt).toLocaleDateString(),
                        })
                      : t("✓ You're already on Pro. Subscribing now extends it further.")}
                  </div>
                )}

                <div className={`${pricingStyles.surface} p-5 sm:p-6`}>
                  <BillingPeriodPicker period={period} prices={plans.effectivePricing} disabled={ecpayLoading} onChange={(next) => {
                    setAgreedQuote(null);
                    router.replace(`/upgrade/checkout?period=${next}`, { scroll: false });
                  }} />
                  <BillingPriceDetails period={period} prices={plans.effectivePricing} promo={plans.promo} pricing={plans.pricing} />
                </div>

                <div className="flex items-start gap-2.5 px-1 py-2">
                  <span className="mt-0.5 text-lg leading-none">💳</span>
                  <span>
                    <span className="block text-sm font-semibold text-ink-50">{t("Credit / Debit Card")}</span>
                    <span className="block text-xs text-ink-400">
                      {t("We auto-renew your card every {period} until you cancel.", {
                        period: period === "MONTHLY" ? t("month") : t("year"),
                      })}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-4 sm:col-span-2 sm:mt-0">
                <div className={`${pricingStyles.surface} space-y-4 p-5 sm:p-6`}>
                  <div>
                    <p className="font-display text-sm font-semibold text-ink-50">{t("Order summary")}</p>
                    <div className="mt-2 flex items-baseline justify-between text-sm">
                      <span className="text-ink-300">{t("judge. Pro ({period})", { period: period === "MONTHLY" ? t("Monthly") : t("Yearly") })}</span>
                      <span className="text-ink-100">NT${amount}</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between border-t border-ink-700 pt-1.5 text-sm font-semibold">
                      <span className="text-ink-50">{t("Total due today")}</span>
                      <span className="text-ink-50">NT${amount}</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-ink-200">{t("Renews at NT${amount}/{period} while this subscription continues.", { amount: amount!.toLocaleString(), period: period === "MONTHLY" ? t("month") : t("year") })}</p>

                  <p className="rounded border border-ink-700 bg-ink-800/50 px-2.5 py-1.5 text-xs text-ink-400">
                    {t("Billed every {period} · renews automatically until you cancel from your account. Request a full refund within 7 days of your first payment.", {
                      period: period === "MONTHLY" ? t("month") : t("year"),
                    })}
                  </p>

                  <label className="flex items-start gap-2 text-xs text-ink-400">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreedQuote(e.target.checked ? quoteKey : null)}
                      className="mt-0.5"
                    />
                    <span>
                      {t("I agree to the")} <Link href="/refund" className="text-brand hover:underline">{t("Refund Policy")}</Link>{" "}
                      {t("and")} <Link href="/terms" className="text-brand hover:underline">{t("Terms of Service")}</Link>.
                    </span>
                  </label>

                  {ecpayError && <p role="alert" className="text-sm text-verdict-wa">{ecpayError}</p>}

                  <button onClick={startEcpay} disabled={ecpayLoading || !agreed} className={`${pricingStyles.primary} w-full py-3 text-sm`}>
                    {ecpayLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        {t("Redirecting to ECPay…")}
                      </span>
                    ) : (
                      t("Subscribe — NT${amount}/{period}", { amount: amount!, period: period === "MONTHLY" ? t("month") : t("year") })
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1 text-center text-[11px] text-ink-500">
                    🔒 {t("Secure checkout via ECPay — Taiwan's leading payment gateway")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
