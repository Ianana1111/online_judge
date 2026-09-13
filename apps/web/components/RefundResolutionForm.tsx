"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { AdminRefund } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";

type History = { id: string; actorId: string; decision: string; reason: string; evidenceReference: string; createdAt: string };
export default function RefundResolutionForm({ item, onResolved }: { item: AdminRefund; onResolved: () => void }) {
  const { locale } = useLocale(), zh = locale === "zh-TW", user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [decision, setDecision] = useState("KEEP_REVIEW"), [reference, setReference] = useState(""), [reason, setReason] = useState("");
  const [order, setOrder] = useState(""), [amount, setAmount] = useState(""), [cancellation, setCancellation] = useState(false), [noAction, setNoAction] = useState(false), [preserve, setPreserve] = useState(false);
  const expectedVersion = useRef(item.updatedAt), requestId = useRef<string | null>(null);
  const history = useQuery({ queryKey: ["refund-resolution", user?.id, item.id], queryFn: () => apiFetch<History[]>(`/billing/admin/refunds/${item.id}/history`), enabled: open });
  const labels: Record<string, string> = zh ? { KEEP_REVIEW: "證據不足，繼續待查", CONFIRM_NO_ACTION: "確認尚未退款，維持暫停", CONFIRM_REFUNDED: "確認退款及取消續扣完成" } : { KEEP_REVIEW: "Keep under review", CONFIRM_NO_ACTION: "No refund found; keep paused", CONFIRM_REFUNDED: "Refund and cancellation confirmed" };
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    requestId.current ??= crypto.randomUUID();
    try {
      await apiFetch(`/billing/admin/refunds/${item.id}/resolve`, { method: "POST", body: { clientRequestId: requestId.current, expectedUpdatedAt: expectedVersion.current, merchantTradeNo: order, amountNtd: Number(amount), decision, evidenceReference: reference, reason, cancellationConfirmed: cancellation, noGatewayActionConfirmed: noAction, preserveUnattributedEntitlement: preserve } });
      await history.refetch(); onResolved(); setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? (zh ? "退款狀態已變更，或舊交易的權益無法自動歸因。請重新整理、核對紀錄後再操作。" : "The refund changed or its legacy entitlement cannot be attributed. Refresh and review the record before continuing.") : err instanceof ApiError && err.status === 403 ? (zh ? "請先完成雙因素驗證。" : "Complete two-factor authentication first.") : (zh ? "未能確認操作結果。請保留原內容重試，或重新整理查看紀錄。" : "The result could not be confirmed. Retry with the same details or refresh the history."));
    } finally { setBusy(false); }
  }
  const id = `refund-${item.id}`;
  return <details open={open} onToggle={(e) => { const next = e.currentTarget.open; if (next && !open) { expectedVersion.current = item.updatedAt; requestId.current = null; } setOpen(next); }} className="border-t border-ink-800 pt-2">
    <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-brand">{zh ? "人工對帳與操作紀錄" : "Reconciliation and audit history"}</summary>
    {open && <div className="space-y-5 py-3">
      {item.status === "NEEDS_REVIEW" && (!user?.mfaEnabled || user.mfaRequired ? <Link href="/settings?section=security" className="text-sm text-brand underline">{zh ? "先啟用並完成雙因素驗證，才能記錄退款決策。" : "Enable and complete two-factor authentication before recording refund decisions."}</Link> : <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
        <p className="text-sm leading-6 text-ink-300">{zh ? "請先在綠界核對交易、退款與取消續扣紀錄。此表單只記錄對帳結果；查無退款或證據不足時，案件仍會保持暫停。" : "First verify the order, refund and cancellation records in ECPay. This form records the outcome. Missing or inconclusive refunds remain paused."}</p>
        <div><label htmlFor={`${id}-decision`} className="mb-1 block text-sm text-ink-200">{zh ? "對帳結果" : "Outcome"}</label><select id={`${id}-decision`} className="oj-input" value={decision} onChange={(e) => setDecision(e.target.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor={`${id}-order`} className="mb-1 block text-sm text-ink-200">{zh ? "再次輸入商店訂單編號" : "Re-enter merchant order"}</label><input id={`${id}-order`} className="oj-input" value={order} onChange={(e) => setOrder(e.target.value)} maxLength={40} required /></div><div><label htmlFor={`${id}-amount`} className="mb-1 block text-sm text-ink-200">{zh ? "核對金額（NT$）" : "Verified amount (NT$)"}</label><input id={`${id}-amount`} className="oj-input" type="number" min={1} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} required /></div></div>
        <div><label htmlFor={`${id}-reference`} className="mb-1 block text-sm text-ink-200">{zh ? "綠界紀錄或客服案件編號" : "ECPay record or support reference"}</label><input id={`${id}-reference`} className="oj-input" value={reference} onChange={(e) => setReference(e.target.value)} minLength={3} maxLength={160} required /></div>
        <div><label htmlFor={`${id}-reason`} className="mb-1 block text-sm text-ink-200">{zh ? "核對依據與處理原因" : "Evidence and reason"}</label><textarea id={`${id}-reason`} className="oj-input min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} minLength={10} maxLength={1000} required /></div>
        {decision === "CONFIRM_REFUNDED" && <><label className="flex items-start gap-3 text-sm leading-6 text-ink-200"><input type="checkbox" className="mt-1" checked={cancellation} onChange={(e) => setCancellation(e.target.checked)} required />{zh ? "已確認此筆全額退款完成，且後續續扣已取消或原本沒有續扣。" : "The full refund is confirmed and recurring charges are cancelled or do not exist."}</label><label className="flex items-start gap-3 text-sm leading-6 text-ink-300"><input type="checkbox" className="mt-1" checked={preserve} onChange={(e) => setPreserve(e.target.checked)} />{zh ? "若為無法歸因的舊交易，保留目前權益（必須在原因中說明）。有完整權益紀錄的交易仍會扣除退款部分。" : "Preserve unattributable legacy entitlements, with a reason above. Attributable refunded entitlements are still removed."}</label></>}
        {decision === "CONFIRM_NO_ACTION" && <label className="flex items-start gap-3 text-sm leading-6 text-ink-200"><input type="checkbox" className="mt-1" checked={noAction} onChange={(e) => setNoAction(e.target.checked)} required />{zh ? "已核對金流紀錄，確認尚未退款，繼續保持人工處理。" : "Gateway records confirm no refund; keep this case paused for manual handling."}</label>}
        {error && <p role="alert" className="text-sm text-verdict-wa">{error}</p>}
        <button className="oj-btn-primary" disabled={busy || order !== item.merchantTradeNo || Number(amount) !== item.amountNtd}>{busy ? (zh ? "記錄中…" : "Recording…") : (zh ? "確認並記錄對帳結果" : "Confirm and record outcome")}</button>
      </form>)}
      <div><h4 className="mb-3 text-sm font-semibold text-ink-100">{zh ? "操作紀錄" : "Audit history"}</h4>{history.isError ? <p role="alert" className="text-sm text-verdict-wa">{zh ? "操作紀錄載入失敗。" : "Could not load history."}</p> : history.isPending ? <p role="status" className="text-sm text-ink-400">{zh ? "載入中…" : "Loading…"}</p> : !history.data?.length ? <p className="text-sm text-ink-400">{zh ? "尚無人工處理紀錄。" : "No operator decisions yet."}</p> : <ul className="space-y-3">{history.data.map((row) => <li key={row.id} className="rounded-lg border border-ink-800 p-3 text-sm"><p className="font-medium text-ink-200">{labels[row.decision] ?? row.decision}</p><p className="mt-2 whitespace-pre-wrap break-words text-ink-300">{row.reason}</p><p className="mt-2 break-all text-xs text-ink-400">{row.evidenceReference} · {row.actorId} · {new Date(row.createdAt).toLocaleString(locale)}</p></li>)}</ul>}</div>
    </div>}
  </details>;
}
