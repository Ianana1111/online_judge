"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import BackButton from "@/components/BackButton";
import type { BillingPlans, BillingStatus } from "@/lib/types";

type Period = "MONTHLY" | "YEARLY";
type Method = "CREDIT" | "ATM";

export default function CheckoutPage() {
  const { user, status: authStatus } = useAuthStore();
  const [period, setPeriod] = useState<Period>("MONTHLY");
  const [method, setMethod] = useState<Method>("CREDIT");
  const [ecpayError, setEcpayError] = useState<string | null>(null);
  const [ecpayLoading, setEcpayLoading] = useState(false);

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
  const pending = status?.pendingPayment;
  const amount = plans?.pricing[period].amountNtd ?? (period === "MONTHLY" ? 200 : 2000);

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
    } catch (e) {
      setEcpayError(e instanceof ApiError ? e.message : "無法建立訂單，請稍後再試");
      setEcpayLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8">
      <div>
        <BackButton fallbackHref="/upgrade" />
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="w-full space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-50">Get Pro Plan</h1>
            <p className="mt-1 text-sm text-ink-400">Unlimited submissions and virtual contests, billed however suits you.</p>
          </div>

          {authStatus === "ready" && !user ? (
            <div className="oj-card p-5 text-sm text-ink-300">
              Please{" "}
              <Link href="/login" className="text-brand hover:underline">
                log in
              </Link>{" "}
              to upgrade.
            </div>
          ) : notApplicable ? (
            <div className="oj-card p-5 text-sm text-ink-300">
              {isAdmin ? "Admin accounts already have no submit or contest limits." : "Student accounts are already Pro — no need to upgrade."}
            </div>
          ) : isPro ? (
            <div className="oj-card border-verdict-ac/40 p-5 text-sm text-ink-200">
              You're already on Pro 🎉{" "}
              {status?.planExpiresAt && <>Renews/expires {new Date(status.planExpiresAt).toLocaleDateString()}.</>} Buying again
              extends it further.
            </div>
          ) : pending ? (
            <div className="oj-card border-verdict-tle/40 p-5 text-sm">
              {pending.method === "ECPAY" && pending.ecpayMethod === "ATM" && pending.vAccount ? (
                <>
                  <p className="font-semibold text-verdict-tle">Complete your ATM transfer</p>
                  <div className="mt-3 space-y-1 rounded border border-ink-700 bg-ink-800/50 p-3 font-mono text-sm">
                    <p>
                      Bank code: <span className="font-semibold text-ink-50">{pending.bankCode}</span>
                    </p>
                    <p>
                      Virtual account: <span className="font-semibold text-ink-50">{pending.vAccount}</span>
                    </p>
                    {pending.expireDate && <p className="text-xs text-ink-400">Pay by: {pending.expireDate}</p>}
                  </div>
                  <p className="mt-3 text-ink-300">
                    Transfer NT${pending.amountNtd} to the account above via ATM / online / mobile banking. Pro unlocks{" "}
                    <span className="text-verdict-ac">automatically</span> once it's received — this page updates on its own.
                  </p>
                </>
              ) : pending.method === "ECPAY" && pending.ecpayMethod === "ATM" ? (
                <>
                  <p className="font-semibold text-verdict-tle">Generating your virtual account…</p>
                  <p className="mt-1 text-ink-300">One moment — this page updates automatically.</p>
                </>
              ) : pending.method === "ECPAY" ? (
                <>
                  <p className="font-semibold text-verdict-tle">Confirming your card payment…</p>
                  <p className="mt-1 text-ink-300">This is usually instant. This page updates automatically once it clears.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-verdict-tle">Payment under review</p>
                  <p className="mt-1 text-ink-300">
                    We've received your {pending.period === "MONTHLY" ? "monthly" : "yearly"} plan (NT${pending.amountNtd}) payment
                    claim — Pro unlocks as soon as we confirm the transfer.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Billing period</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPeriod("MONTHLY")}
                    className={period === "MONTHLY" ? "oj-btn-primary py-3 text-sm" : "oj-btn-secondary py-3 text-sm"}
                  >
                    Monthly — NT${plans?.pricing.MONTHLY.amountNtd ?? 200}/mo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("YEARLY")}
                    className={period === "YEARLY" ? "oj-btn-primary py-3 text-sm" : "oj-btn-secondary py-3 text-sm"}
                  >
                    Yearly — NT${plans?.pricing.YEARLY.amountNtd ?? 2000}/yr
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod("CREDIT")}
                    className={method === "CREDIT" ? "oj-btn-primary py-3 text-sm" : "oj-btn-secondary py-3 text-sm"}
                  >
                    Credit card
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("ATM")}
                    className={method === "ATM" ? "oj-btn-primary py-3 text-sm" : "oj-btn-secondary py-3 text-sm"}
                  >
                    Virtual account (ATM)
                  </button>
                </div>
              </div>

              <div className="oj-card space-y-3 p-5">
                <p className="text-sm text-ink-400">
                  {method === "CREDIT"
                    ? "You'll be taken to ECPay's secure checkout to enter your card details. Pro unlocks automatically the moment payment clears."
                    : "You'll receive a virtual account number to transfer to. Pro unlocks automatically once the transfer is received — no manual review."}
                </p>
                {ecpayError && <p className="text-sm text-verdict-wa">{ecpayError}</p>}
                <button onClick={startEcpay} disabled={ecpayLoading} className="oj-btn-primary w-full py-3">
                  {ecpayLoading ? "Redirecting…" : `Pay NT$${amount}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
