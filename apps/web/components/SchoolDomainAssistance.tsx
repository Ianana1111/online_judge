"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";
import { schoolReviewLabels, type SchoolDomainRequest } from "@/lib/school-review";

export default function SchoolDomainAssistance({ school }: { school: string }) {
  const zh = useLocale().locale === "zh-TW", user = useAuthStore((s) => s.user), qc = useQueryClient();
  const query = useQuery({ queryKey: ["school-domain-requests", user?.id], queryFn: () => apiFetch<SchoolDomainRequest[]>("/users/me/school/domain-requests"), enabled: !!user });
  const [domain, setDomain] = useState(""), [url, setUrl] = useState(""), [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const items = Array.isArray(query.data) ? query.data : [];
  async function send() {
    setError(""); setBusy(true);
    try {
      await apiFetch("/users/me/school/domain-requests", { method: "POST", body: { domain: domain.trim().toLowerCase(), officialUrl: url.trim(), explanation: explanation.trim() } });
      setDomain(""); setUrl(""); setExplanation(""); await qc.invalidateQueries({ queryKey: ["school-domain-requests"] });
    } catch (err) { setError(err instanceof Error ? err.message : (zh ? "申請失敗，請重試。" : "Request failed. Please retry.")); }
    finally { setBusy(false); }
  }
  return <details className="mt-3 rounded-lg border border-ink-700 p-4 text-sm">
    <summary className="cursor-pointer font-medium text-ink-200">{zh ? "學校信箱無法驗證？申請協助" : "School email unsupported? Request help"}</summary>
    <div className="mt-4 space-y-4">
      <p className="leading-6 text-ink-400">{zh ? `請提供 ${school} 的校方信箱說明網頁。管理員確認網域後，你仍需要透過校方信箱收取驗證信。請勿上傳學生證、身分證或其他個人證件。` : `Share ${school}'s official email instructions. After review, you must still verify access to a school mailbox. Do not send student IDs, identity documents or other personal records.`}</p>
      {query.isError && <p role="alert">{zh ? "無法載入申請進度。" : "Could not load your requests."} <button type="button" className="text-brand underline" onClick={() => query.refetch()}>{zh ? "重試" : "Retry"}</button></p>}
      {items.map((item) => <div key={item.id} role="status" className="rounded-lg bg-ink-900/50 p-3"><p className="font-medium text-ink-200">{schoolReviewLabels[item.status][zh ? 0 : 1]} · {item.school}</p><p className="mt-1 break-all font-mono text-xs text-ink-400">{item.domain}</p>{item.decisions.at(-1)?.note && <p className="mt-2 whitespace-pre-wrap text-ink-300">{item.decisions.at(-1)?.note}</p>}{item.status === "APPROVED" && <button type="button" className="mt-2 text-brand underline" onClick={() => qc.invalidateQueries({ queryKey: ["school-domains"] })}>{zh ? "更新可驗證的網域" : "Refresh supported domains"}</button>}</div>)}
      {!items.some((r) => r.status === "PENDING") && <div className="space-y-3">
        <label className="block text-ink-200">{zh ? "信箱網域（@ 後方）" : "Email domain (after @)"}<input className="oj-input mt-1" value={domain} onChange={(e) => setDomain(e.target.value)} maxLength={253} placeholder="student.example.edu.tw" /></label>
        <label className="block text-ink-200">{zh ? "校方信箱說明網址" : "Official email instructions URL"}<input className="oj-input mt-1" type="url" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={1000} placeholder="https://www.example.edu.tw/email" /></label>
        <label className="block text-ink-200">{zh ? "補充說明" : "Explanation"}<textarea className="oj-input mt-1 min-h-24" value={explanation} onChange={(e) => setExplanation(e.target.value)} maxLength={1000} placeholder={zh ? "例如：學校今年啟用新的學生信箱網域。" : "For example: the school introduced a new student email domain."} /></label>
        {error && <p role="alert" className="text-verdict-wa">{error}</p>}
        <button type="button" className="oj-btn-secondary" disabled={busy || !domain.trim() || !url.trim() || explanation.trim().length < 10} onClick={send}>{busy ? (zh ? "送出中…" : "Sending…") : (zh ? "送出網域審核" : "Request domain review")}</button>
      </div>}
    </div>
  </details>;
}
