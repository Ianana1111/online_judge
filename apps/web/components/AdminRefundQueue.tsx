"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n/LocaleContext";
import type { AdminRefundPage, RefundStatus } from "@/lib/types";

const labels: Record<RefundStatus, string> = {
  REQUESTED: "Refund queued", PROCESSING: "Refund processing",
  NEEDS_REVIEW: "Reconciliation required", COMPLETED: "Refund completed",
};
const colors: Record<RefundStatus, string> = {
  REQUESTED: "text-ink-200", PROCESSING: "text-brand",
  NEEDS_REVIEW: "text-verdict-wa", COMPLETED: "text-verdict-ac",
};

export default function AdminRefundQueue({ userId }: { userId: string | undefined }) {
  const t = useT();
  const [filter, setFilter] = useState<RefundStatus | "OPEN">("OPEN");
  const query = useInfiniteQuery({
    queryKey: ["billing", "admin", "refunds", userId, filter],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (filter !== "OPEN") params.set("status", filter);
      if (pageParam) params.set("cursor", pageParam);
      return apiFetch<AdminRefundPage>(`/billing/admin/refunds?${params}`);
    },
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: !!userId,
    refetchInterval: 30_000,
  });
  const counts = query.data?.pages[0]?.counts;
  const items = [...new Map(query.data?.pages.flatMap((page) => page.items).map((item) => [item.id, item])).values()];
  const date = (iso: string) => new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false });

  return (
    <section aria-labelledby="refund-queue-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="refund-queue-title" className="font-display text-xl font-semibold text-ink-50">{t("Refund operations")}</h2>
          <p className="mt-1 text-sm text-ink-400">{t("Requests appear here immediately. Updates refresh every 30 seconds. Times use Taipei time.")}</p>
        </div>
        <button className="oj-btn-secondary" type="button" disabled={query.isFetching || !userId} onClick={() => void query.refetch()}>{t("Refresh")}</button>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("Filter refunds")}>
        {(["OPEN", "NEEDS_REVIEW", "REQUESTED", "PROCESSING", "COMPLETED"] as const).map((value) => {
          const count = !counts ? undefined : value === "OPEN" ? counts.REQUESTED + counts.PROCESSING + counts.NEEDS_REVIEW : counts[value];
          return <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}
            className={`min-h-11 rounded-lg border px-3 py-2 text-sm ${filter === value ? "border-brand bg-brand/10 text-brand" : "border-ink-700 text-ink-300 hover:border-brand"}`}>
            {t(value === "OPEN" ? "Open refunds" : labels[value])}{count === undefined ? "" : ` · ${count}`}
          </button>;
        })}
      </div>
      {query.isError && <div role="alert" className="rounded-lg border border-verdict-wa/40 p-3 text-sm text-verdict-wa">{t("Refunds could not be loaded. Refresh to try again.")}</div>}
      {query.isPending && <p role="status" className="text-sm text-ink-400">{t("Loading refund requests…")}</p>}
      {query.isSuccess && items.length === 0 && <p className="oj-panel p-5 text-sm text-ink-400">{t("No refunds in this view.")}</p>}
      <div className="space-y-3">
        {items.map((item) => <article key={item.id} aria-label={`${t(labels[item.status])} · ${item.merchantTradeNo}`} className="oj-panel min-w-0 space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="break-words font-semibold text-ink-50">{item.user?.handle ?? t("Deleted account")}</h3>
              {item.user && <p className="mt-1 break-all text-xs text-ink-400">{item.user.email}</p>}
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${colors[item.status]}`}>{t(labels[item.status])}</p>
              <p className="mt-1 font-mono text-sm text-ink-100">NT${item.amountNtd.toLocaleString("en-US")}</p>
            </div>
          </div>
          <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-2">
            {[
              ["Merchant order", item.merchantTradeNo], ["ECPay transaction", item.ecpayTradeNo ?? "—"],
              ["Requested at", date(item.requestedAt)], ["Processing attempts", String(item.attempts)],
              ["Renewal cancellation confirmed", item.cancellationConfirmedAt ? date(item.cancellationConfirmedAt) : t("Not recorded")],
              ["Gateway refund confirmed", item.refundConfirmedAt ? date(item.refundConfirmedAt) : t("Not recorded")],
              ...(item.status === "REQUESTED" ? [["Next processing attempt", date(item.nextAttemptAt)]] : []),
              ...(item.completedAt ? [["Completed at", date(item.completedAt)]] : []),
            ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-ink-400">{t(label)}</dt><dd className="mt-1 break-all text-ink-100">{value}</dd></div>)}
          </dl>
          {item.status === "NEEDS_REVIEW" && <p className="rounded-lg border border-verdict-wa/30 bg-verdict-wa/5 p-3 text-sm leading-relaxed text-ink-200">{t("Automatic processing is paused. Match the order and amount in ECPay, check cancellation and refund records, then record the confirmed outcome through the reconciliation runbook. An unknown outcome must be verified before another card action.")}</p>}
          {(item.lastError || item.inFlightAction) && <details className="text-sm">
            <summary className="min-h-11 cursor-pointer py-3 text-ink-300">{t("Processing details")}</summary>
            <div className="space-y-2 rounded bg-ink-950 p-3">
              {item.inFlightAction && <p className="break-words text-ink-200">{t("Unconfirmed action")}: <code>{item.inFlightAction}</code></p>}
              {item.lastError && <p className="break-words text-ink-300">{item.lastError}</p>}
              <p className="break-all text-xs text-ink-400">{t("Request ID")}: {item.id}</p>
            </div>
          </details>}
        </article>)}
      </div>
      {query.hasNextPage && <button type="button" className="oj-btn-secondary w-full" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{t(query.isFetchingNextPage ? "Loading refund requests…" : "Load more refunds")}</button>}
    </section>
  );
}
