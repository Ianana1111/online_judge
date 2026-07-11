"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { BillingPlans, BillingStatus } from "@/lib/types";

type Period = "MONTHLY" | "YEARLY";

function Feature({ children, on }: { children: React.ReactNode; on: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={on ? "text-verdict-ac" : "text-ink-600"}>{on ? "✓" : "—"}</span>
      <span className={on ? "text-ink-200" : "text-ink-500"}>{children}</span>
    </li>
  );
}

export default function PricingPage() {
  const { user, status: authStatus } = useAuthStore();
  const qc = useQueryClient();
  const [period, setPeriod] = useState<Period>("MONTHLY");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    // while a payment is pending so "已付款" reflects automatically without a manual refresh.
    refetchInterval: (query) => (query.state.data?.pendingPayment ? 5000 : false),
  });

  const isPro = status?.plan === "PRO";
  const pending = status?.pendingPayment;

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/billing/request", { method: "POST", body: { period, reference } });
      await qc.invalidateQueries({ queryKey: ["billing", "me"] });
      setReference("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function startEcpay() {
    setEcpayError(null);
    setEcpayLoading(true);
    try {
      const res = await apiFetch<{ actionUrl: string; fields: Record<string, string | number>; sandbox: boolean }>(
        "/billing/ecpay/create",
        { method: "POST", body: { period } },
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

  const amount = plans?.pricing[period].amountNtd ?? (period === "MONTHLY" ? 100 : 1000);

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-50">升級 Pro</h1>
        <p className="mt-2 text-sm text-ink-400">
          免費版足夠試用，但認真練 CPE 的你，Pro 才能無限刷題、無限模擬考。
        </p>
      </div>

      {status && (
        <div className="oj-card flex flex-wrap items-center gap-4 p-4 text-sm">
          <span className="font-semibold text-ink-200">
            你目前的方案：{isPro ? <span className="text-brand">Pro</span> : "Free"}
          </span>
          {isPro && status.planExpiresAt && (
            <span className="text-ink-400">到期日 {new Date(status.planExpiresAt).toLocaleDateString()}</span>
          )}
          {!isPro && (
            <span className="text-ink-400">
              已用 submit {status.submits.used}/{status.submits.limit} · 模擬考{" "}
              {status.virtualContests.used}/{status.virtualContests.limit}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="oj-card p-5">
          <h2 className="font-display text-lg font-semibold text-ink-100">Free</h2>
          <p className="mt-1 text-2xl font-bold text-ink-50">NT$0</p>
          <ul className="mt-4 space-y-2">
            <Feature on>20 次 submit（總共）</Feature>
            <Feature on>2 場自己模擬 CPE</Feature>
            <Feature on>看 discussion、leaderboard</Feature>
            <Feature on={false}>無限 submit</Feature>
            <Feature on={false}>無限模擬考</Feature>
          </ul>
        </div>

        <div className="oj-card border-brand/40 p-5">
          <h2 className="font-display text-lg font-semibold text-brand">Pro</h2>
          <p className="mt-1 text-2xl font-bold text-ink-50">
            NT${amount}
            <span className="text-sm font-normal text-ink-400">/{period === "MONTHLY" ? "月" : "年"}</span>
          </p>
          <ul className="mt-4 space-y-2">
            <Feature on>無限 submit</Feature>
            <Feature on>無限自己模擬 CPE</Feature>
            <Feature on>看 discussion、leaderboard</Feature>
            <Feature on>優先支援</Feature>
          </ul>
        </div>
      </div>

      {authStatus === "ready" && !user ? (
        <div className="oj-card p-5 text-sm text-ink-300">
          請先{" "}
          <Link href="/login" className="text-brand hover:underline">
            登入
          </Link>{" "}
          再升級。
        </div>
      ) : isPro ? (
        <div className="oj-card border-verdict-ac/40 p-5 text-sm text-ink-200">
          你已經是 Pro 會員，感謝支持 🎉 到期後在這裡續約即可延長。
        </div>
      ) : pending ? (
        <div className="oj-card border-verdict-tle/40 p-5 text-sm">
          {pending.method === "ECPAY" && pending.vAccount ? (
            <>
              <p className="font-semibold text-verdict-tle">請完成 ATM 轉帳</p>
              <div className="mt-3 space-y-1 rounded border border-ink-700 bg-ink-800/50 p-3 font-mono text-sm">
                <p>
                  銀行代碼：<span className="font-semibold text-ink-50">{pending.bankCode}</span>
                </p>
                <p>
                  虛擬帳號：<span className="font-semibold text-ink-50">{pending.vAccount}</span>
                </p>
                {pending.expireDate && <p className="text-xs text-ink-400">繳費期限：{pending.expireDate}</p>}
              </div>
              <p className="mt-3 text-ink-300">
                用 ATM／網路銀行／手機銀行 App 轉帳 NT${pending.amountNtd} 到以上帳號。付款完成後系統會
                <span className="text-verdict-ac">自動</span>幫你開通 Pro，這個頁面會自動更新，不用等人工審核。
              </p>
            </>
          ) : pending.method === "ECPAY" ? (
            <>
              <p className="font-semibold text-verdict-tle">正在產生付款資訊…</p>
              <p className="mt-1 text-ink-300">請稍候，這個頁面會自動更新。</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-verdict-tle">付款審核中</p>
              <p className="mt-1 text-ink-300">
                我們已收到你的 {pending.period === "MONTHLY" ? "月方案" : "年方案"}（NT${pending.amountNtd}
                ）付款回報，確認收到款項後會盡快幫你開通。
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPeriod("MONTHLY")}
              className={period === "MONTHLY" ? "oj-btn-primary px-4 py-2 text-sm" : "oj-btn-secondary px-4 py-2 text-sm"}
            >
              月方案 NT$100
            </button>
            <button
              type="button"
              onClick={() => setPeriod("YEARLY")}
              className={period === "YEARLY" ? "oj-btn-primary px-4 py-2 text-sm" : "oj-btn-secondary px-4 py-2 text-sm"}
            >
              年方案 NT$1000（省 2 個月）
            </button>
          </div>

          <div className="oj-card space-y-3 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-100">ATM 轉帳（自動開通）</h2>
            <p className="text-sm text-ink-400">
              點下方按鈕會產生一組專屬的 ATM 虛擬帳號，轉帳完成後系統自動幫你開通 Pro，不用等待人工審核。
            </p>
            {ecpayError && <p className="text-sm text-verdict-wa">{ecpayError}</p>}
            <button onClick={startEcpay} disabled={ecpayLoading} className="oj-btn-primary w-full">
              {ecpayLoading ? "跳轉中…" : `產生虛擬帳號並付款 NT$${amount}`}
            </button>
          </div>

          <details className="oj-card p-5 text-sm">
            <summary className="cursor-pointer font-semibold text-ink-200">或改用其他付款方式（人工審核）</summary>
            <form onSubmit={submitClaim} className="mt-4 space-y-4">
              <div className="rounded border border-ink-700 bg-ink-800/50 p-4 text-sm text-ink-300">
                <p className="mb-2 font-semibold text-ink-200">步驟 1：轉帳 NT${amount} 到以下帳戶</p>
                {plans?.payee.bank || plans?.payee.account || plans?.payee.linePay ? (
                  <ul className="space-y-1 font-mono text-xs">
                    {plans.payee.bank && <li>銀行：{plans.payee.bank}</li>}
                    {plans.payee.account && <li>帳號：{plans.payee.account}</li>}
                    {plans.payee.name && <li>戶名：{plans.payee.name}</li>}
                    {plans.payee.linePay && <li>LINE Pay：{plans.payee.linePay}</li>}
                    {plans.payee.note && <li className="text-ink-400">{plans.payee.note}</li>}
                  </ul>
                ) : (
                  <p className="text-ink-500">（收款資訊尚未設定，請改用上方 ATM 自動開通）</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm text-ink-300">
                  步驟 2：填入轉帳備註（例如帳號後五碼 / LINE Pay 交易序號），方便我們核對
                </label>
                <input
                  className="oj-input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="帳號後五碼或轉帳序號"
                  maxLength={200}
                />
              </div>

              {error && <p className="text-sm text-verdict-wa">{error}</p>}
              <button type="submit" disabled={submitting} className="oj-btn-primary">
                {submitting ? "送出中…" : "我已付款，送出審核"}
              </button>
              <p className="text-xs text-ink-500">送出後我們會人工核對款項，確認後即為你開通 Pro（通常 24 小時內）。</p>
            </form>
          </details>
        </div>
      )}
    </div>
  );
}
