"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";
import { schoolReviewLabels, type SchoolDomainRequest } from "@/lib/school-review";

export default function SchoolReviewPage() {
  const zh = useLocale().locale === "zh-TW", user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<SchoolDomainRequest["status"]>("PENDING"), [before, setBefore] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["admin-school-domains", user?.id, status, before], queryFn: () => apiFetch<{ items: SchoolDomainRequest[]; nextCursor: string | null }>(`/users/school-domain-requests?status=${status}${before ? `&before=${before}` : ""}`), enabled: user?.role === "ADMIN" });
  return <div className="space-y-6"><header><h1 className="font-display text-2xl font-bold text-ink-100">{zh ? "學校網域審核" : "School domain review"}</h1><p className="mt-2 text-sm leading-6 text-ink-400">{zh ? "查證校方公開資料，確認網域專屬於該學校。核准只開放寄送驗證信，不會直接驗證申請人的身分。" : "Check the school's public instructions and exclusive domain ownership. Approval enables email verification; it does not verify the requester."}</p></header>
    <label className="block text-sm text-ink-200">{zh ? "申請狀態" : "Request status"}<select className="oj-input mt-2 w-auto" value={status} onChange={(e) => { setStatus(e.target.value as SchoolDomainRequest["status"]); setBefore(null); }}>{Object.entries(schoolReviewLabels).map(([key, label]) => <option key={key} value={key}>{label[zh ? 0 : 1]}</option>)}</select></label>
    {query.isPending && <p role="status">{zh ? "載入中…" : "Loading…"}</p>}
    {query.isError && <p role="alert">{zh ? "載入失敗。" : "Loading failed."} <button className="text-brand underline" onClick={() => query.refetch()}>{zh ? "重試" : "Retry"}</button></p>}
    {query.data?.items?.length === 0 && <p className="oj-card p-8 text-center text-ink-400">{zh ? "目前沒有這個狀態的申請。" : "No requests in this status."}</p>}
    {query.data?.items?.map((item) => <Review key={`${item.id}:${item.updatedAt}`} item={item} refresh={() => query.refetch()} />)}
    <div className="flex gap-3">{before && <button className="oj-btn-ghost" onClick={() => setBefore(null)}>{zh ? "回到最新" : "Latest"}</button>}{query.data?.nextCursor && <button className="oj-btn-secondary" onClick={() => setBefore(query.data!.nextCursor)}>{zh ? "下一頁" : "Next page"}</button>}</div>
  </div>;
}
function Review({ item, refresh }: { item: SchoolDomainRequest; refresh: () => unknown }) {
  const zh = useLocale().locale === "zh-TW", user = useAuthStore((s) => s.user);
  const [note, setNote] = useState(""), [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function review(status: "APPROVED" | "REJECTED" | "REVOKED") {
    setBusy(true); setError("");
    try { await apiFetch(`/users/school-domain-requests/${item.id}/review`, { method: "POST", body: { status, expectedUpdatedAt: item.updatedAt, note } }); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Review failed"); }
    finally { setBusy(false); }
  }
  return <article className="oj-card space-y-3 p-5"><h2 className="font-semibold text-ink-100">{item.school}</h2><p className="break-all font-mono text-sm text-brand">{item.domain}</p><p className="whitespace-pre-wrap text-sm text-ink-300">{item.explanation}</p><a className="inline-block break-all text-sm text-brand underline" href={item.officialUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{zh ? "開啟申請人提供的校方說明" : "Open supplied school instructions"} ↗</a>
    {item.decisions.map((d, i) => <div key={i} className="rounded bg-ink-900/50 p-3 text-sm"><p className="text-ink-400">{schoolReviewLabels[d.status as SchoolDomainRequest["status"]]?.[zh ? 0 : 1]} · {new Date(d.createdAt).toLocaleString(zh ? "zh-TW" : "en-US")}</p><p className="mt-1 whitespace-pre-wrap text-ink-200">{d.note}</p></div>)}
    {["PENDING", "APPROVED"].includes(item.status) && (!user?.mfaEnabled || user.mfaRequired ? <Link href="/settings?section=security" className="text-sm text-brand underline">{zh ? "先完成雙因素驗證以審核" : "Complete two-factor authentication to review"}</Link> : <div className="space-y-3 border-t border-ink-700 pt-4">
      <label className="block text-sm text-ink-200">{zh ? "查證依據與回覆（申請人可見）" : "Evidence and response (visible to requester)"}<textarea className="oj-input mt-2 min-h-24" value={note} onChange={(e) => setNote(e.target.value)} minLength={10} maxLength={1000} /></label>
      {item.status === "PENDING" && <label className="flex items-start gap-2 text-sm text-ink-300"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1" />{zh ? "我已確認校方資料及此網域的學校歸屬。" : "I checked the official evidence and exclusive domain ownership."}</label>}
      {error && <p role="alert" className="text-sm text-verdict-wa">{error}</p>}
      <div className="flex flex-wrap gap-3">{item.status === "PENDING" ? <><button className="oj-btn-primary" disabled={busy || note.trim().length < 10 || !confirmed} onClick={() => review("APPROVED")}>{zh ? "核准此網域" : "Approve domain"}</button><button className="oj-btn-ghost" disabled={busy || note.trim().length < 10} onClick={() => review("REJECTED")}>{zh ? "請申請人補充" : "Request more evidence"}</button></> : <button className="oj-btn-secondary" disabled={busy || note.trim().length < 10} onClick={() => review("REVOKED")}>{zh ? "停止受理新驗證" : "Stop new verifications"}</button>}</div>
    </div>)}
  </article>;
}
