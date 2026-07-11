"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface PendingPayment {
  id: string;
  handle: string;
  email: string;
  period: "MONTHLY" | "YEARLY";
  amountNtd: number;
  reference: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { user, status } = useAuthStore();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["billing", "pending"],
    queryFn: () => apiFetch<PendingPayment[]>("/billing/admin/pending"),
    enabled: user?.role === "ADMIN",
  });

  if (status === "ready" && user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  async function act(id: string, action: "approve" | "reject") {
    setError(null);
    setBusyId(id);
    try {
      await apiFetch(`/billing/admin/${id}/${action}`, { method: "POST" });
      await qc.invalidateQueries({ queryKey: ["billing", "pending"] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Admin · Payments</h1>
        <p className="mt-1 text-sm text-ink-400">
          待審核的升級付款。確認款項真的到帳後再按「核准」——核准會立刻延長對方的 Pro 期限。
        </p>
      </div>

      {error && <p className="text-sm text-verdict-wa">{error}</p>}
      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}
      {rows.length === 0 && !isLoading && (
        <p className="oj-card p-4 text-sm text-ink-400">目前沒有待審核的付款。</p>
      )}

      {rows.length > 0 && (
        <table className="oj-table">
          <thead>
            <tr>
              <th>When</th>
              <th>User</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Reference</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="font-mono text-xs text-ink-400">{new Date(p.createdAt).toLocaleString()}</td>
                <td>
                  <div className="text-ink-100">{p.handle}</div>
                  <div className="text-xs text-ink-500">{p.email}</div>
                </td>
                <td className="text-xs text-ink-300">{p.period === "MONTHLY" ? "月方案" : "年方案"}</td>
                <td className="font-mono text-xs text-brand">NT${p.amountNtd}</td>
                <td className="font-mono text-xs text-ink-300">{p.reference || "—"}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => act(p.id, "approve")}
                      disabled={busyId === p.id}
                      className="rounded bg-verdict-ac/15 px-2.5 py-1 text-xs font-medium text-verdict-ac hover:bg-verdict-ac/25 disabled:opacity-40"
                    >
                      核准
                    </button>
                    <button
                      onClick={() => act(p.id, "reject")}
                      disabled={busyId === p.id}
                      className="rounded bg-verdict-wa/15 px-2.5 py-1 text-xs font-medium text-verdict-wa hover:bg-verdict-wa/25 disabled:opacity-40"
                    >
                      拒絕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
