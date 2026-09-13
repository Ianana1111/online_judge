"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";
type Status = { measuredAt: string; pendingSubmissions: number; oldestPendingSeconds: number; completedLast15m: number; systemErrorsLast15m: number; refundReviews: number; failedAuthMail: number; alerts: string[]; queues: { name: string; waiting: number; active: number }[] };
export default function OperationalStatus() {
  const zh = useLocale().locale === "zh-TW", user = useAuthStore((s) => s.user);
  const query = useQuery({ queryKey: ["operations", user?.id], queryFn: () => apiFetch<Status>("/operations"), enabled: user?.role === "ADMIN", refetchInterval: 30000 });
  const labels: Record<string, string> = zh ? { JUDGE_PENDING_OVER_5_MINUTES: "有提交等待評測超過五分鐘", JUDGE_QUEUE_BACKLOG: "評測佇列積壓", JUDGE_SYSTEM_ERROR_RATE: "近期評測系統錯誤偏高", REFUND_MANUAL_REVIEW: "有退款需要人工核對", ACCOUNT_MAIL_DELIVERY_FAILED: "有帳號郵件多次寄送失敗" } : { JUDGE_PENDING_OVER_5_MINUTES: "Submissions waiting over five minutes", JUDGE_QUEUE_BACKLOG: "Judge queue backlog", JUDGE_SYSTEM_ERROR_RATE: "Elevated judge system errors", REFUND_MANUAL_REVIEW: "Refunds need reconciliation", ACCOUNT_MAIL_DELIVERY_FAILED: "Repeated account email delivery failures" };
  const data = query.data;
  return <section className="oj-card space-y-4 p-5" aria-labelledby="operations-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="operations-title" className="font-semibold text-ink-100">{zh ? "營運狀態" : "Operations"}</h2><button className="oj-btn-ghost text-xs" onClick={() => query.refetch()} disabled={query.isFetching}>{zh ? "更新狀態" : "Refresh"}</button></div>
    {query.isPending && <p role="status" className="text-sm text-ink-400">{zh ? "載入中…" : "Loading…"}</p>}
    {query.isError && <p role="alert" className="text-sm text-verdict-wa">{zh ? "無法取得營運資料，請檢查 API、資料庫及 Redis 連線。" : "Could not load operations. Check API, database and Redis connectivity."}</p>}
    {data && <><p className="text-xs text-ink-400">{zh ? "更新時間：" : "Measured: "}{new Date(data.measuredAt).toLocaleString(zh ? "zh-TW" : "en-US")}</p>
      {data.alerts?.length ? <ul className="space-y-2 rounded-lg border border-verdict-wa/30 p-4 text-sm text-ink-200">{data.alerts.map((a) => <li key={a}>{labels[a] ?? a}</li>)}</ul> : <p className="text-sm text-verdict-ac">{zh ? "目前未觸發營運警示。" : "No operational alerts currently triggered."}</p>}
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">{[[zh ? "等待評測" : "Pending", data.pendingSubmissions], [zh ? "最久等待（秒）" : "Oldest wait (s)", data.oldestPendingSeconds], [zh ? "近 15 分鐘完成" : "Finished / 15m", data.completedLast15m], [zh ? "系統錯誤 / 15 分鐘" : "System errors / 15m", data.systemErrorsLast15m]].map(([label, value]) => <div key={String(label)}><dt className="text-xs text-ink-400">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums text-ink-100">{value}</dd></div>)}</dl>
      <div className="flex flex-wrap gap-4 text-sm"><Link href="/admin/billing" className="text-brand underline">{zh ? `人工退款核對：${data.refundReviews}` : `Refund reviews: ${data.refundReviews}`}</Link><Link href="/admin/schools" className="text-brand underline">{zh ? "處理學校網域申請" : "Review school domains"}</Link></div>
    </>}
  </section>;
}
