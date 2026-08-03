"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AdminAuthorizedPayment } from "@/lib/types";

// Authorization holds aren't guaranteed to stay valid forever — the issuing bank, not ECPay,
// decides how long one lasts. Past a week un-captured is worth flagging visually so it doesn't
// slip through the cracks.
const STALE_DAYS = 7;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

export default function AdminBillingPage() {
  const { user, status } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["billing", "admin", "authorized-pending"],
    queryFn: () => apiFetch<AdminAuthorizedPayment[]>("/billing/admin/authorized-pending"),
    enabled: user?.role === "ADMIN",
    refetchInterval: 30_000,
  });

  if (status === "ready" && user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Admin · Billing</h1>
        <p className="mt-1 text-sm text-ink-400">
          Credit-card orders where Pro was granted the moment ECPay authorized the card — capture is a manual
          step in ECPay's own merchant backend, not automatic. This is the queue of orders still owed a
          capture; each one drops off automatically once ECPay's return webhook confirms the capture went
          through.
        </p>
      </div>

      {data && data.length === 0 && <p className="text-sm text-ink-500">Nothing pending — all caught up.</p>}

      {data && data.length > 0 && (
        <table className="oj-table">
          <thead>
            <tr>
              <th>Handle</th>
              <th>Email</th>
              <th>Period</th>
              <th>Amount</th>
              <th>MerchantTradeNo</th>
              <th>Authorized</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => {
              const age = daysSince(p.createdAt);
              const stale = age >= STALE_DAYS;
              return (
                <tr key={p.id}>
                  <td>{p.handle}</td>
                  <td className="text-xs text-ink-400">{p.email}</td>
                  <td className="text-xs text-ink-400">{p.period}</td>
                  <td className="font-mono text-xs">NT${p.amountNtd}</td>
                  <td className="font-mono text-xs text-ink-400">{p.merchantTradeNo}</td>
                  <td className={`text-xs ${stale ? "font-semibold text-verdict-wa" : "text-ink-500"}`}>
                    {new Date(p.createdAt).toLocaleString()} ({age}d ago)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
