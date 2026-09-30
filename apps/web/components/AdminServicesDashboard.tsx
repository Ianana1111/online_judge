"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { monthlyEquivalent, serviceCostSchema, type ExternalServicesDashboard, type ExternalServiceRow, type ServiceCostInput } from "@oj/shared";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const amount = (minor: number, currency: string) => new Intl.NumberFormat("zh-TW", { style: "currency", currency, minimumFractionDigits: 2 }).format(minor / 100);
const date = (iso: string) => new Date(iso).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });
const time = (iso: string) => new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false });
const statusClass = { ok: "text-verdict-ac bg-verdict-ac/10", attention: "text-verdict-wa bg-verdict-wa/10", configured: "text-brand bg-brand/10", unknown: "text-ink-300 bg-ink-800", inactive: "text-ink-400 bg-ink-800" };
const cycleNames = { UNKNOWN: "待確認", MONTHLY: "月繳", YEARLY: "年繳", USAGE: "按用量／交易", FREE: "免費方案" };

function CostEditor({ service, onClose }: { service: ExternalServiceRow; onClose: (saved?: boolean) => void }) {
  const { cost } = service;
  const [plan, setPlan] = useState(cost.plan), [currency, setCurrency] = useState(cost.currency);
  const [cycle, setCycle] = useState(cost.billingCycle), [fee, setFee] = useState(cost.amountMinor === null ? "" : String(cost.amountMinor / 100));
  const [budget, setBudget] = useState(cost.budgetMinor === null ? "" : String(cost.budgetMinor / 100));
  const [renewal, setRenewal] = useState(cost.renewsAt?.slice(0, 10) ?? ""), [notes, setNotes] = useState(cost.notes);
  const [url, setUrl] = useState(cost.managementUrl ?? ""), [error, setError] = useState(""), [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  async function save(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const raw = { plan, currency, billingCycle: cycle, amountMinor: cycle === "FREE" ? 0 : ["UNKNOWN", "USAGE"].includes(cycle) ? null : fee === "" ? null : Math.round(Number(fee) * 100), budgetMinor: budget === "" ? null : Math.round(Number(budget) * 100), renewsAt: renewal ? `${renewal}T00:00:00.000Z` : null, notes, managementUrl: url || null };
    const parsed = serviceCostSchema.safeParse(raw);
    if (!parsed.success) { setError("請確認金額、日期及 HTTPS 管理網址。月繳／年繳方案需要填寫費用。"); return; }
    setSaving(true);
    try { await apiFetch(`/operations/services/${service.key}`, { method: "PATCH", body: parsed.data }); await qc.invalidateQueries({ queryKey: ["operations", "services"] }); onClose(true); }
    catch (e) { setError(e instanceof ApiError ? e.message : "儲存失敗，請稍後重試。"); }
    finally { setSaving(false); }
  }
  const field = "space-y-1 text-xs text-ink-300";
  return <form onSubmit={save} className="mt-5 space-y-3 border-t border-ink-700 pt-5" aria-label={`${service.name} 費用設定`}>
    <div className="grid grid-cols-2 gap-3">
      <label className={`${field} col-span-2`}>方案名稱<input className="oj-input mt-1" value={plan} maxLength={80} placeholder="例如 Pro、Hobby 或合約方案" onChange={e => setPlan(e.target.value)} /></label>
      <label className={field}>幣別<select className="oj-input mt-1" value={currency} onChange={e => setCurrency(e.target.value as ServiceCostInput["currency"])}><option value="USD">USD 美元</option><option value="TWD">TWD 新台幣</option></select></label>
      <label className={field}>計費方式<select className="oj-input mt-1" value={cycle} onChange={e => setCycle(e.target.value as ServiceCostInput["billingCycle"])}>{Object.entries(cycleNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      {["MONTHLY", "YEARLY"].includes(cycle) && <label className={`${field} col-span-2`}>{cycle === "YEARLY" ? "每年固定費" : "每月固定費"}<input type="number" min="0" max="1000000" step="0.01" required className="oj-input mt-1" value={fee} onChange={e => setFee(e.target.value)} /><span className="block mt-1 text-ink-400">填方案底費；年費會換算為月均。額外用量費另列。</span></label>}
      <label className={field}>用量提醒門檻／期<input type="number" min="0.01" max="1000000" step="0.01" className="oj-input mt-1" value={budget} placeholder="選填" onChange={e => setBudget(e.target.value)} /></label>
      <label className={field}>續約／續費日期<input type="date" className="oj-input mt-1" value={renewal} onChange={e => setRenewal(e.target.value)} /></label>
      <label className={`${field} col-span-2`}>管理入口（選填）<input type="url" pattern="https://.*" maxLength={500} className="oj-input mt-1" value={url} placeholder={service.dashboardUrl} onChange={e => setUrl(e.target.value)} /></label>
      <label className={`${field} col-span-2`}>費用備註<textarea maxLength={1000} className="oj-input mt-1 min-h-20" value={notes} placeholder="例如席次、含用量抵扣、金流費率或網域註冊商" onChange={e => setNotes(e.target.value)} /></label>
    </div>
    {error && <p role="alert" className="text-xs text-verdict-wa">{error}</p>}
    <div className="flex gap-2"><button className="oj-btn-primary text-xs" disabled={saving}>{saving ? "儲存中…" : "儲存設定"}</button><button type="button" className="oj-btn-secondary text-xs" disabled={saving} onClick={() => onClose()}>取消</button></div>
  </form>;
}

function ServiceCard({ service }: { service: ExternalServiceRow }) {
  const [editing, setEditing] = useState(false), [saved, setSaved] = useState(false);
  const { cost } = service, monthly = monthlyEquivalent(cost), report = cost.billingSnapshot;
  const stale = !!cost.billingCheckedAt && Date.now() - Date.parse(cost.billingCheckedAt) > 86400000;
  const daysUntilRenewal = cost.renewsAt ? Math.ceil((Date.parse(cost.renewsAt) - Date.now()) / 86400000) : null;
  const comparable = report && cost.budgetMinor && cost.currency === report.currency;
  const ratio = comparable ? report.usageMinor / cost.budgetMinor! : null;
  return <article className="min-w-0 rounded-2xl border border-ink-700 bg-ink-900/40 p-5 sm:p-6" aria-labelledby={`service-${service.key}`}>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] text-ink-400">{service.category}</p><h2 id={`service-${service.key}`} className="mt-1 font-display text-xl font-semibold text-ink-100">{service.name}</h2></div><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${service.status === "ok" ? "bg-verdict-ac" : service.status === "attention" ? "bg-verdict-wa" : "bg-ink-500"}`} aria-hidden /></div>
    <p className="mt-2 text-xs leading-6 text-ink-300">{service.description}</p>
    <p className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] ${statusClass[service.status]}`}>{service.statusLabel}</p>
    <div className="mt-5 grid grid-cols-2 gap-3 border-y border-ink-700 py-4">
      <div><p className="text-[11px] text-ink-400">月均固定費</p><p className="mt-1 font-mono text-xl font-semibold text-ink-50">{monthly === null ? "待填寫" : amount(monthly, cost.currency)}</p><p className="mt-1 text-[11px] text-ink-400">{cost.plan || "方案待確認"} · {cycleNames[cost.billingCycle]}</p></div>
      <div><p className="text-[11px] text-ink-400">{report ? "資料期間用量原價" : "費用來源"}</p><p className="mt-1 font-mono text-xl font-semibold text-ink-100">{report ? amount(report.usageMinor, report.currency) : "—"}</p><p className="mt-1 text-[11px] leading-5 text-ink-400">{report ? "抵扣前，非最終帳單" : "請依帳單或合約補上"}</p></div>
    </div>
    {daysUntilRenewal !== null && <p className={`mt-3 text-xs ${daysUntilRenewal <= 30 ? "text-verdict-tle" : "text-ink-400"}`}>續費日 {date(cost.renewsAt!)} · {daysUntilRenewal < 0 ? "日期已過，請核對" : `${daysUntilRenewal} 天後`}</p>}
    {ratio !== null && <div className="mt-4"><div className="mb-1 flex justify-between text-[11px] text-ink-400"><span>用量／提醒門檻</span><span>{Math.round(ratio * 100)}%</span></div><div role="progressbar" aria-label={`${service.name} 用量提醒門檻`} aria-valuenow={Math.min(100, Math.round(ratio * 100))} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-ink-800"><div className={`h-full rounded-full ${ratio >= 1 ? "bg-verdict-wa" : "bg-brand"}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div>{ratio >= 1 && <p className="mt-1 text-xs text-verdict-wa">用量已達提醒門檻，請至服務後台核對。</p>}</div>}
    <details className="mt-4 text-xs"><summary className="cursor-pointer py-1 font-medium text-ink-200">用量與運作詳情</summary><dl className="mt-3 space-y-2">{service.facts.map(f => <div key={f.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 leading-5"><dt className="text-ink-400">{f.label}</dt><dd className="break-words text-ink-200">{/^\d{4}-\d{2}-\d{2}T/.test(f.value) ? time(f.value) : f.value}</dd></div>)}</dl>
      {report && <div className="mt-4 border-t border-ink-700 pt-3"><p className="text-ink-200">{report.scope}</p><p className="mt-1 text-ink-400">{date(report.periodStart)} – {date(report.periodEnd)}</p><dl className="mt-3 space-y-1.5">{report.breakdown.map(row => <div key={row.label} className="flex justify-between gap-3"><dt className="min-w-0 text-ink-300">{row.label}</dt><dd className="shrink-0 font-mono text-ink-100">{amount(row.amountMinor, report.currency)}</dd></div>)}</dl><div className="mt-3 space-y-1 border-t border-ink-700 pt-3 text-ink-300">{report.billedMinor !== null && <p>來源回報計費：{amount(report.billedMinor, report.currency)}</p>}{report.forecastMinor !== null && <p>來源預估本期：{amount(report.forecastMinor, report.currency)}</p>}</div><p className="mt-3 leading-5 text-ink-400">{report.note}</p><p className={`mt-2 leading-5 ${stale ? "text-verdict-tle" : "text-ink-400"}`}>{report.source} · {cost.billingCheckedAt ? time(cost.billingCheckedAt) : "更新時間未知"}{stale ? " · 快照已超過 24 小時" : ""}</p></div>}
      {cost.notes && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-ink-950/50 p-3 leading-6 text-ink-300">{cost.notes}</p>}
      {!report && <p className="mt-3 text-ink-400">尚未匯入服務商用量帳單；未填資料不列為零元。</p>}
    </details>
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"><a className="inline-flex min-h-9 items-center gap-1 text-brand hover:underline" href={cost.managementUrl || service.dashboardUrl} target="_blank" rel="noopener noreferrer">管理後台 <span aria-hidden>↗</span></a><a className="inline-flex min-h-9 items-center text-ink-400 hover:text-ink-200" href={service.pricingUrl} target="_blank" rel="noopener noreferrer">費用資訊 ↗</a><button type="button" aria-expanded={editing} className="ml-auto min-h-9 text-ink-200 hover:text-brand" onClick={() => { setEditing(v => !v); setSaved(false); }}>編輯費用</button></div>
    {saved && <p role="status" className="mt-2 text-xs text-verdict-ac">設定已儲存。</p>}
    {editing && <CostEditor service={service} onClose={didSave => { setEditing(false); setSaved(!!didSave); }} />}
  </article>;
}

export default function AdminServicesDashboard() {
  const user = useAuthStore(s => s.user), [category, setCategory] = useState("全部");
  const query = useQuery({ queryKey: ["operations", "services", user?.id], queryFn: () => apiFetch<ExternalServicesDashboard>("/operations/services"), enabled: user?.role === "ADMIN", refetchInterval: 60000 });
  const services = query.data?.services ?? [];
  const known = services.filter(s => monthlyEquivalent(s.cost) !== null), unknown = services.length - known.length;
  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-semibold tracking-widest text-brand">SERVICE DIRECTORY</p><h1 className="mt-2 font-display text-2xl font-semibold text-ink-50">外部服務與成本</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-300">服務入口、本站連線狀態與費用放在一起，快速掌握哪些需要處理。</p></div><button className="oj-btn-secondary text-xs" disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? "更新中…" : "更新運作狀態"}</button></header>
    {query.isPending && <p role="status" className="oj-card p-6 text-ink-300">載入外部服務中…</p>}
    {query.isError && <p role="alert" className="oj-card p-5 text-verdict-wa">無法取得服務資料，請稍後按「更新運作狀態」重試。</p>}
    {query.data && <><div className="grid gap-3 sm:grid-cols-3">{(["USD", "TWD"] as const).map(currency => <div key={currency} className="rounded-xl border border-ink-700 bg-ink-900 p-5"><p className="text-xs text-ink-400">已填固定費月均 · {currency}</p><p className="mt-2 font-mono text-2xl font-semibold text-ink-50">{known.some(s => s.cost.currency === currency) ? amount(known.filter(s => s.cost.currency === currency).reduce((sum, s) => sum + monthlyEquivalent(s.cost)!, 0), currency) : "尚未填寫"}</p><p className="mt-2 text-[11px] text-ink-400">年費攤提，不含另計用量、交易費及稅額</p></div>)}<div className="rounded-xl border border-brand/25 bg-brand/[0.04] p-5"><p className="text-xs text-ink-400">費用資料完整度</p><p className="mt-2 font-mono text-2xl font-semibold text-ink-50">{known.length}<span className="text-sm font-normal text-ink-400"> / {services.length}</span></p><p className="mt-2 text-[11px] text-ink-300">{unknown ? `${unknown} 項固定費尚未確認／按量計費` : "固定費均已填寫"}</p></div></div>
      <div className="rounded-xl border border-ink-700 px-4 py-3 text-xs leading-6 text-ink-400"><p>運作資料每分鐘更新；網站、DNS 與憑證探測最多快取 5 分鐘。費用為獨立的帳單快照或手動紀錄，更新狀態不會同步第三方帳單。</p><p>USD 與 TWD 分開計算；不同服務的帳單期間、抵扣額與方案底費請分別核對。最新運作資料：{time(query.data.measuredAt)}</p></div>
      <nav aria-label="服務分類" className="flex flex-wrap gap-2">{["全部", ...new Set(services.map(s => s.category))].map(c => <button key={c} type="button" aria-pressed={category === c} className={`rounded-full border px-3 py-2 text-xs transition-colors ${category === c ? "border-brand/40 bg-brand/10 text-brand" : "border-ink-700 text-ink-300 hover:bg-ink-800"}`} onClick={() => setCategory(c)}>{c}</button>)}</nav>
      <div className="grid items-start gap-4 xl:grid-cols-2">{services.filter(s => category === "全部" || s.category === category).map(service => <ServiceCard key={service.key} service={service} />)}</div></>}
  </div>;
}
