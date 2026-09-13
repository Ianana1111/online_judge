"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AdminAuthorizedPayment } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";
import AdminRefundQueue from "@/components/AdminRefundQueue";

// Authorization holds aren't guaranteed to stay valid forever — the issuing bank, not ECPay,
// decides how long one lasts. Past a week un-captured is worth flagging visually so it doesn't
// slip through the cracks.
const STALE_DAYS = 7;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

export default function AdminBillingPage() {
  const t = useT();
  const { user, status } = useAuthStore();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["billing", "admin", "authorized-pending", user?.id],
    queryFn: () => apiFetch<AdminAuthorizedPayment[]>("/billing/admin/authorized-pending"),
    enabled: user?.role === "ADMIN",
    refetchInterval: 30_000,
  });

  if (status === "ready" && user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">{t("Admins only.")}</p>;
  }

  return (
    <div className="min-w-0 space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">{t("Admin · Billing")}</h1>
      <AdminRefundQueue userId={user?.role === "ADMIN" ? user.id : undefined} />
      <section aria-labelledby="capture-queue-title" className="min-w-0 space-y-4 border-t border-ink-700 pt-6">
      <div>
        <h2 id="capture-queue-title" className="font-display text-xl font-semibold text-ink-50">{t("Authorized payments awaiting capture")}</h2>
        <p className="mt-1 text-sm text-ink-400">
          {t(
            "Credit-card orders where Pro was granted the moment ECPay authorized the card — capture is a manual step in ECPay's own merchant backend, not automatic. This is the queue of orders still owed a capture; each one drops off automatically once ECPay's return webhook confirms the capture went through.",
          )}
        </p>
      </div>

      {isPending && <p role="status" className="text-sm text-ink-400">{t("Loading payments…")}</p>}
      {isError && <div role="alert" className="space-y-2 text-sm text-verdict-wa"><p>{t("Payments could not be loaded.")}</p><button type="button" className="oj-btn-secondary" onClick={() => void refetch()}>{t("Refresh")}</button></div>}

      {data && data.length === 0 && <p className="text-sm text-ink-500">{t("Nothing pending — all caught up.")}</p>}

      {data && data.length > 0 && (
        <div className="overflow-x-auto" role="region" aria-label={t("Authorized payments awaiting capture")} tabIndex={0}>
        <table className="oj-table">
          <thead>
            <tr>
              <th>{t("Handle")}</th>
              <th>{t("Email")}</th>
              <th>{t("Period")}</th>
              <th>{t("Amount")}</th>
              <th>MerchantTradeNo</th>
              <th>{t("Authorized")}</th>
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
                  <td className="text-xs text-ink-400">{t(p.period === "MONTHLY" ? "Monthly" : "Yearly")}</td>
                  <td className="font-mono text-xs">NT${p.amountNtd}</td>
                  <td className="font-mono text-xs text-ink-400">{p.merchantTradeNo}</td>
                  <td className={`text-xs ${stale ? "font-semibold text-verdict-wa" : "text-ink-500"}`}>
                    {new Date(p.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })} ({t("{count} days ago", { count: age })})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
      </section>
    </div>
  );
}
