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

type Period = "MONTHLY" | "YEARLY";
type Method = "CREDIT" | "ATM";

export default function CheckoutPage() {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const { user, status: authStatus } = useAuthStore();
  const [period, setPeriod] = useState<Period>("MONTHLY");
  const [method, setMethod] = useState<Method>("CREDIT");
  const [ecpayError, setEcpayError] = useState<string | null>(null);
  const [ecpayLoading, setEcpayLoading] = useState(false);
  const [dismissing, setDismissing] = useState(false);

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

  const { data: plans } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => apiFetch<BillingPlans>("/billing/plans"),
  });
  const { data: status } = useQuery({
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

  const amount = plans?.effectivePricing[period] ?? (period === "MONTHLY" ? 200 : 2000);
  const monthlyListPrice = plans?.pricing.MONTHLY.amountNtd ?? 200;
  const monthlyNowPrice = plans?.effectivePricing.MONTHLY ?? monthlyListPrice;
  const yearlyPrice = plans?.pricing.YEARLY.amountNtd ?? 2000;
  const promo = plans?.promo;
  // "Save X%" badge on the yearly card, measured against the real ongoing monthly sticker price
  // (not a temporary promo/test price) so it stays meaningful once pricing settles back down.
  const yearlySavingsPct = Math.round((1 - yearlyPrice / (monthlyListPrice * 12)) * 100);

  async function startEcpay() {
    setEcpayError(null);
    setEcpayLoading(true);
    try {
      const res = await apiFetch<{ actionUrl: string; fields: Record<string, string | number>; sandbox: boolean }>(
        "/billing/ecpay/create",
        { method: "POST", body: { period, method } },
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
      setEcpayError(e instanceof ApiError ? e.message : "無法建立訂單，請稍後再試");
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
    // 56px is the sticky NavBar's height, 3rem is <main>'s own py-6 (top+bottom) in the root
    // layout — this page sits inside both, so `h-screen` here would always leave the page ~100px
    // taller than the viewport and force a slight scroll even though nothing needs it.
    <div className="mx-auto flex h-[calc(100vh-56px-3rem)] max-w-4xl flex-col overflow-y-auto px-6 py-4">
      <div className="shrink-0">
        <BackButton fallbackHref="/upgrade" />
      </div>

      <div className="flex flex-1 flex-col justify-center py-4">
        <div className="w-full space-y-4">
          <div>
            <h1 className="font-display text-xl font-bold text-ink-50 sm:text-2xl">{t("Subscribe to Pro")}</h1>
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
              <Link href="/upgrade" className="mt-2 inline-block text-brand hover:underline">
                {t("Manage your subscription →")}
              </Link>
            </div>
          ) : pending ? (
            <div className="space-y-3">
              <div className="oj-card border-verdict-tle/40 p-5 text-sm">
                {pending.method === "ECPAY" && pending.ecpayMethod === "ATM" && pending.vAccount ? (
                  <>
                    <p className="font-semibold text-verdict-tle">{t("Complete your ATM transfer")}</p>
                    <div className="mt-3 space-y-1 rounded border border-ink-700 bg-ink-800/50 p-3 font-mono text-sm">
                      <p>
                        {t("Bank code:")} <span className="font-semibold text-ink-50">{pending.bankCode}</span>
                      </p>
                      <p>
                        {t("Virtual account:")} <span className="font-semibold text-ink-50">{pending.vAccount}</span>
                      </p>
                      {pending.expireDate && <p className="text-xs text-ink-400">{t("Pay by: {date}", { date: pending.expireDate })}</p>}
                    </div>
                    <p className="mt-3 text-ink-300">
                      {t("Transfer NT${amount} to the account above via ATM / online / mobile banking. Pro unlocks", {
                        amount: pending.amountNtd,
                      })}{" "}
                      <span className="text-verdict-ac">{t("automatically")}</span> {t("once it's received — this page updates on its own.")}
                    </p>
                  </>
                ) : pending.method === "ECPAY" && pending.ecpayMethod === "ATM" ? (
                  <>
                    <p className="font-semibold text-verdict-tle">{t("Generating your virtual account…")}</p>
                    <p className="mt-1 text-ink-300">{t("One moment — this page updates automatically.")}</p>
                  </>
                ) : pending.method === "ECPAY" ? (
                  <>
                    <p className="font-semibold text-verdict-tle">{t("Confirming your card payment…")}</p>
                    <p className="mt-1 text-ink-300">{t("This is usually instant. This page updates automatically once it clears.")}</p>
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
          ) : (
            <div className="sm:grid sm:grid-cols-5 sm:items-start sm:gap-6">
              <div className="space-y-4 sm:col-span-3">
                {isPro && (
                  <div className="oj-card border-verdict-ac/40 p-2.5 text-xs text-ink-300">
                    {status?.planExpiresAt
                      ? t("✓ You're already on Pro until {date}. Subscribing now extends it further.", {
                          date: new Date(status.planExpiresAt).toLocaleDateString(),
                        })
                      : t("✓ You're already on Pro. Subscribing now extends it further.")}
                  </div>
                )}

                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">{t("Billing period")}</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPeriod("MONTHLY")}
                      className={`oj-card p-2.5 text-left transition-colors ${period === "MONTHLY" ? "border-brand" : "hover:border-ink-500"}`}
                    >
                      <p className="text-sm font-semibold text-ink-50">{t("Monthly")}</p>
                      {promo ? (
                        <p className="mt-0.5 text-xs text-ink-400">
                          <span className="line-through opacity-70">NT${monthlyListPrice}</span> {t("NT${amount} / mo", { amount: monthlyNowPrice })}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-ink-400">{t("NT${amount} / mo", { amount: monthlyNowPrice })}</p>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriod("YEARLY")}
                      className={`oj-card relative p-2.5 text-left transition-colors ${period === "YEARLY" ? "border-brand" : "hover:border-ink-500"}`}
                    >
                      {yearlySavingsPct > 0 && (
                        <span className="absolute -top-2 right-2 rounded-full bg-verdict-ac px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-onbrand">
                          {t("Save {pct}%", { pct: yearlySavingsPct })}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-ink-50">{t("Yearly")}</p>
                      <p className="mt-0.5 text-xs text-ink-400">{t("NT${amount} / yr", { amount: yearlyPrice })}</p>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">{t("Payment method")}</p>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setMethod("CREDIT")}
                      className={`oj-card flex w-full items-start gap-2.5 p-2.5 text-left transition-colors ${method === "CREDIT" ? "border-brand" : "hover:border-ink-500"}`}
                    >
                      <span className="mt-0.5 text-lg leading-none">💳</span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-50">{t("Credit / Debit Card")}</span>
                        <span className="block text-xs text-ink-400">
                          {t("Subscribe — we auto-renew your card every {period} until you cancel.", {
                            period: period === "MONTHLY" ? t("month") : t("year"),
                          })}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("ATM")}
                      className={`oj-card flex w-full items-start gap-2.5 p-2.5 text-left transition-colors ${method === "ATM" ? "border-brand" : "hover:border-ink-500"}`}
                    >
                      <span className="mt-0.5 text-lg leading-none">🏦</span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-50">{t("ATM Transfer")}</span>
                        <span className="block text-xs text-ink-400">{t("One-time payment — transfer again manually whenever you want to renew.")}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:col-span-2 sm:mt-0">
                <div className="oj-card space-y-3 p-4">
                  <div>
                    <p className="font-display text-sm font-semibold text-ink-50">{t("Order summary")}</p>
                    <div className="mt-2 flex items-baseline justify-between text-sm">
                      <span className="text-ink-300">{t("judge. Pro ({period})", { period: period === "MONTHLY" ? t("Monthly") : t("Yearly") })}</span>
                      <span className="text-ink-100">NT${amount}</span>
                    </div>
                    {promo && period === "MONTHLY" && (
                      <div className="mt-1 flex items-baseline justify-between text-sm">
                        <span className="text-verdict-ac">{t("Launch promo ({pct}% off)", { pct: promo.discountPct })}</span>
                        <span className="text-verdict-ac">−NT${monthlyListPrice - monthlyNowPrice}</span>
                      </div>
                    )}
                    <div className="mt-1.5 flex items-baseline justify-between border-t border-ink-700 pt-1.5 text-sm font-semibold">
                      <span className="text-ink-50">{t("Total due today")}</span>
                      <span className="text-ink-50">NT${amount}</span>
                    </div>
                  </div>

                  <p className="rounded border border-ink-700 bg-ink-800/50 px-2.5 py-1.5 text-xs text-ink-400">
                    {method === "CREDIT"
                      ? t("Billed every {period} · renews automatically until you cancel from your account.", {
                          period: period === "MONTHLY" ? t("month") : t("year"),
                        })
                      : t("One-time payment, valid for {days} days · renew again manually anytime.", {
                          days: period === "MONTHLY" ? "30" : "365",
                        })}
                  </p>

                  {ecpayError && <p className="text-sm text-verdict-wa">{ecpayError}</p>}

                  <button onClick={startEcpay} disabled={ecpayLoading} className="oj-btn-primary w-full py-2.5">
                    {ecpayLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        {t("Redirecting to ECPay…")}
                      </span>
                    ) : method === "CREDIT" ? (
                      t("Subscribe — NT${amount}/{period}", { amount, period: period === "MONTHLY" ? t("month") : t("year") })
                    ) : (
                      t("Pay NT${amount}", { amount })
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
