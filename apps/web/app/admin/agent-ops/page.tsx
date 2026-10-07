"use client";

import { useState } from "react";
import { WorkflowPanel } from "./workflows";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OPS_FAILURE_LABELS, type OpsDashboard, type OpsRole, type OpsRun } from "@oj/shared";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const time = (value: string | null) => value ? new Date(value).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : "尚無紀錄";
const roles: Record<OpsRole, string> = { TRIAGE: "事件主管", SRE: "雲端工程師", JUDGE: "判題工程師", ENGINEER: "軟體工程師", REVIEW: "獨立審查" };
const statuses: Record<string, string> = { QUEUED: "等待執行", RUNNING: "調查中", COMPLETED: "報告完成", PAUSED: "需要處理", FAILED: "執行失敗", CANCELLED: "已取消" };
function Badge({ value }: { value: string }) { return <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${value === "COMPLETED" ? "border-emerald-500/25 bg-emerald-500/10 text-verdict-ac" : ["PAUSED", "FAILED"].includes(value) ? "border-amber-500/25 bg-amber-500/10 text-verdict-tle" : "border-ink-600 bg-ink-800 text-ink-300"}`}>{statuses[value] ?? value}</span>; }

export default function AgentOpsPage() {
  const user = useAuthStore(s => s.user), client = useQueryClient();
  const queryKey = ["agent-ops", user?.id];
  const query = useQuery({ queryKey, queryFn: () => apiFetch<OpsDashboard>("/agent-ops"), enabled: user?.role === "ADMIN", refetchInterval: 15_000 });
  const [selected, setSelected] = useState<string | null>(null), [filter, setFilter] = useState("ALL");
  const [name, setName] = useState("我的電腦"), [secret, setSecret] = useState<string | null>(null), [copied, setCopied] = useState(false);
  const [limit, setLimit] = useState<number | null>(null), [notice, setNotice] = useState("");
  const mutation = useMutation({ mutationFn: ({ path, body, method = "POST" }: { path: string; body?: unknown; method?: string }) => apiFetch<{ token?: string }>(path, { method, body }),
    onSuccess: async result => { if (result.token) { setSecret(result.token); setCopied(false); } setNotice("設定已更新。"); await client.invalidateQueries({ queryKey }); },
    onError: error => setNotice(error instanceof Error ? error.message : "操作未完成，請稍後重試。"),
  });
  const data = query.data;
  const manual = useMutation({ mutationFn: async () => { await apiFetch("/agent-ops/collect", { method: "POST" }); return apiFetch<OpsRun>("/agent-ops/runs", { method: "POST", body: { requestId: crypto.randomUUID() } }); },
    onSuccess: async run => { setSelected(run.id); setNotice("已加入調查佇列。執行器連線後會接手。"); await client.invalidateQueries({ queryKey }); },
    onError: error => setNotice(error instanceof Error ? error.message : "檢查未完成。"),
  });
  const busy = mutation.isPending || manual.isPending;
  const runs = data?.runs.filter(run => filter === "ALL" || run.kind === filter) ?? [];
  const active = data?.runs.find(run => run.id === selected) ?? runs[0];
  const online = data?.credentials.filter(c => !c.revokedAt && +new Date(c.expiresAt) > Date.now() && c.lastSeenAt && Date.now() - +new Date(c.lastSeenAt) < 360_000).length ?? 0;
  const monitorFresh = data?.monitor.enabled && data.monitor.lastCollectedAt && Date.now() - +new Date(data.monitor.lastCollectedAt) < 180_000;
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="font-mono text-[11px] tracking-widest text-brand">JUDGEOPS</p><h1 className="mt-2 font-display text-2xl font-bold text-ink-50">AI 維運中心</h1><p className="mt-2 max-w-xl text-sm leading-6 text-ink-400">雲端巡檢、專責調查、獨立審查。每一個結論都能回到證據。</p></div>
      <button className="oj-btn-primary text-sm" disabled={busy || !data} onClick={() => manual.mutate()}>{manual.isPending ? "收集資料中…" : "建立一次檢查"}</button>
    </header>
    {notice && <p role="status" className="rounded-xl border border-ink-600 bg-ink-900 p-3 text-sm text-ink-200">{notice}</p>}
    {query.isError && <p role="alert" className="rounded-xl border border-amber-500/30 p-4 text-sm text-ink-200">無法取得最新維運資料，以下資料可能已過期。<button className="ml-2 underline" onClick={() => void query.refetch()}>重新連線</button></p>}
    {!data ? <p className="py-10 text-center text-sm text-ink-400">{query.isError ? "等待重新連線" : "讀取維運狀態…"}</p> : <>
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="維運狀態">
        <Metric label="雲端巡檢" value={monitorFresh ? data.monitor.error ? "資料不完整" : "運作中" : "尚未連線"} note={`最後更新 ${time(data.monitor.lastCollectedAt)}`} />
        <Metric label="待追蹤異常" value={`${data.counts.openIncidents}`} note="連續三次正常才標示恢復" />
        <Metric label="Codex 執行器" value={online ? `${online} 台在線` : "離線"} note={data.settings.dispatchEnabled ? "調查派工已開啟" : "派工已暫停，巡檢持續"} />
        <Metric label="今日啟動額度" value={`${data.counts.startsToday} / ${data.settings.dailyRunLimit}`} note={`近 24 小時完成 ${data.counts.completed24h} 份報告`} />
      </section>
      {(!data.settings.dispatchEnabled || !online || data.counts.paused > 0) && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/25 bg-brand/[0.04] px-4 py-3 text-sm">
        <p className="text-ink-200">{data.counts.paused > 0 ? `${data.counts.paused} 個工作需要處理，請查看錯誤原因。` : !data.settings.dispatchEnabled ? "連接執行器後，在下方開啟派工即可開始調查。" : "目前沒有在線執行器，工作會保留在佇列。"}</p><a href="#executor" className="shrink-0 text-brand underline underline-offset-4">執行器與額度 ↓</a>
      </div>}
      <section className="oj-card overflow-hidden" aria-labelledby="incidents-title">
        <div className="border-b border-ink-700 px-4 py-3"><h2 id="incidents-title" className="text-sm font-semibold text-ink-100">近期異常</h2></div>
        {data.incidents.length ? <div className="divide-y divide-ink-700">{data.incidents.slice(0, 8).map(incident => <div key={incident.id} className="flex items-start justify-between gap-4 px-4 py-3">
          <div className="min-w-0"><p className="text-sm font-medium text-ink-100">{incident.title}</p><p className="mt-1 text-xs text-ink-400">首次 {time(incident.firstSeenAt)} · 最近 {time(incident.lastSeenAt)}</p></div>
          <span className={`shrink-0 text-xs ${incident.recoveredAt ? "text-verdict-ac" : "text-verdict-tle"}`}>{incident.recoveredAt ? "指標已恢復" : "待追蹤"}</span>
        </div>)}</div> : <p className="p-5 text-sm text-ink-400">{monitorFresh ? "目前沒有記錄到異常。這不代表所有功能都已通過端到端測試。" : "巡檢尚未產生紀錄。"}</p>}
      </section>
      <section aria-labelledby="reports-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 id="reports-title" className="text-base font-semibold text-ink-100">調查與每日報告</h2><p className="mt-1 text-xs text-ink-400">最近 30 筆 · {data.counts.queued} 筆等待 · {data.counts.running} 筆調查中</p></div>
          <select aria-label="報告類別" value={filter} onChange={e => { setFilter(e.target.value); setSelected(null); }} className="oj-input w-auto text-sm"><option value="ALL">所有工作</option><option value="DAILY">每日摘要</option><option value="INCIDENT">異常調查</option><option value="MANUAL">手動檢查</option></select>
        </div>
        <div className="grid min-w-0 gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
          <div className="space-y-2" role="group" aria-label="報告列表">
            {runs.map(run => <button key={run.id} onClick={() => setSelected(run.id)} aria-pressed={active?.id === run.id} className={`block w-full rounded-xl border p-3 text-left transition-colors ${active?.id === run.id ? "border-brand/50 bg-brand/[0.06]" : "border-ink-700 bg-ink-900 hover:border-ink-500"}`}>
              <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[11px] text-ink-400">{time(run.createdAt)}</span><Badge value={run.status} /></div><p className="text-sm font-medium leading-6 text-ink-100">{run.title}</p>
            </button>)}
            {!runs.length && <p className="oj-card p-5 text-sm leading-6 text-ink-400">尚無報告。開啟派工後，每天上午 9 點後的巡檢會建立一份摘要，也可以手動建立檢查。</p>}
          </div>
          {active ? <Report run={active} busy={busy} onAction={action => mutation.mutate({ path: `/agent-ops/runs/${active.id}/${action}` })} /> : <div className="oj-card flex min-h-60 items-center justify-center p-6 text-sm text-ink-400">報告會在這裡顯示，包含調查交接與證據。</div>}
        </div>
      </section>
      {user && <WorkflowPanel userId={user.id} />}
      <section id="executor" className="oj-card scroll-mt-24 p-4 sm:p-5" aria-labelledby="executor-title">
        <h2 id="executor-title" className="font-semibold text-ink-100">執行器與額度</h2><p className="mt-2 text-sm leading-6 text-ink-400">使用你已登入 ChatGPT 的 Codex CLI。報告與手動修復最多三次模型呼叫，自動修復含分流最多四次，24 情境成效比較最多十二次。全部固定 GPT-6 Sol／high，不會自動改用付費 API；正式發布須由你核准。</p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <label className="text-xs text-ink-300">每天 AI 工作額度（含重試）<input className="oj-input mt-2 block w-32" type="number" min={1} max={20} value={limit ?? data.settings.dailyRunLimit} onChange={e => setLimit(Number(e.target.value))} /></label>
          <button className="oj-btn-secondary text-xs" disabled={busy || !Number.isInteger(limit ?? data.settings.dailyRunLimit) || (limit ?? data.settings.dailyRunLimit) < 1 || (limit ?? data.settings.dailyRunLimit) > 20} onClick={() => mutation.mutate({ path: "/agent-ops/settings", method: "PATCH", body: { ...data.settings, dailyRunLimit: limit ?? data.settings.dailyRunLimit } })}>儲存上限</button>
          <button className="oj-btn-secondary text-xs" disabled={busy} onClick={() => mutation.mutate({ path: "/agent-ops/settings", method: "PATCH", body: { ...data.settings, dispatchEnabled: !data.settings.dispatchEnabled } })}>{data.settings.dispatchEnabled ? "暫停所有派工" : "開啟調查派工"}</button>
        </div>
        <p className="mt-3 text-xs leading-5 text-ink-400">台灣時間每日重置。報告／修復各占 1 份，成效比較占 3 份；巡檢及已核准發布不占 AI 額度。這不是 Codex 剩餘 token；遇到額度或登入問題會自動暫停派工。</p>
        <div className="mt-5 border-t border-ink-700 pt-5">
          <div className="flex flex-wrap items-end gap-3"><label className="min-w-0 text-xs text-ink-300">執行器名稱<input className="oj-input mt-2 block w-full sm:w-60" maxLength={60} value={name} onChange={e => setName(e.target.value)} /></label><button disabled={busy || !name.trim()} className="oj-btn-secondary text-xs" onClick={() => mutation.mutate({ path: "/agent-ops/credentials", body: { name: name.trim() } })}>建立連線憑證</button></div>
          {secret && <div className="mt-4 rounded-lg border border-brand/30 p-4"><p className="text-sm font-medium text-ink-100">憑證只顯示這一次，有效 90 天</p><p className="mt-1 text-xs leading-5 text-ink-400">將憑證保存到執行機的私密環境設定，請勿提交到 Git。</p><div className="mt-3 flex flex-wrap gap-2"><input aria-label="新的執行器憑證" type="password" value={secret} readOnly className="oj-input min-w-0 flex-1 font-mono text-xs" /><button className="oj-btn-secondary text-xs" onClick={() => void navigator.clipboard.writeText(secret).then(() => setCopied(true)).catch(() => setNotice("無法使用剪貼簿，請從憑證欄位手動複製。"))}>{copied ? "已複製" : "複製憑證"}</button><button className="oj-btn-secondary text-xs" onClick={() => setSecret(null)}>已保存，關閉</button></div></div>}
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-xs leading-6 text-ink-300"><li>在執行機執行 <code>codex login</code>，使用 ChatGPT 帳號登入。</li><li>設定 <code>JUDGEOPS_API_URL</code> 和 <code>JUDGEOPS_RUNNER_TOKEN</code>。</li><li>在專案執行 <code>pnpm --filter @oj/ops-runner start --check</code> 檢查登入，再執行 <code>pnpm --filter @oj/ops-runner start</code>。</li></ol>
          <p className="mt-2 text-xs text-ink-400">電腦睡眠或關機時會停止接工作；工作會保留；修復或發布若中途斷線，會暫停等待核對外部狀態。</p>
          <div className="mt-4 divide-y divide-ink-700">{data.credentials.map(c => <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm text-ink-100">{c.name}{c.revokedAt ? " · 已撤銷" : +new Date(c.expiresAt) < Date.now() ? " · 已到期" : ""}</p><p className="mt-1 text-xs text-ink-400">最近連線 {time(c.lastSeenAt)} · 到期 {time(c.expiresAt)}</p></div>{!c.revokedAt && <button className="oj-btn-secondary text-xs" disabled={busy} onClick={() => mutation.mutate({ path: `/agent-ops/credentials/${c.id}/revoke` })}>撤銷憑證</button>}</div>)}</div>
        </div>
      </section>
    </>}
  </div>;
}
function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <div className="min-w-0 rounded-xl border border-ink-700 bg-ink-900 p-4"><p className="text-xs text-ink-400">{label}</p><p className="mt-3 break-words text-xl font-semibold text-ink-100">{value}</p><p className="mt-2 text-[11px] leading-5 text-ink-400">{note}</p></div>; }
function Report({ run, busy, onAction }: { run: OpsRun; busy: boolean; onAction: (action: "retry" | "cancel") => void }) {
  const latest = run.steps.at(-1), finished = run.status === "COMPLETED";
  return <article className="oj-card min-w-0 p-4 sm:p-5" aria-label="調查報告">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-semibold text-ink-100">{run.title}</h3><Badge value={run.status} /></div>
    <p className="mt-2 text-xs text-ink-400">建立 {time(run.createdAt)} · 已完成 {run.steps.length} / 3 個階段</p>
    {run.errorCode && <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-ink-200">{OPS_FAILURE_LABELS[run.errorCode as keyof typeof OPS_FAILURE_LABELS] ?? "工作未完成，請檢查執行器。"}</p>}
    <div className="my-5 grid grid-cols-3 gap-2" aria-label="處理流程">{(["TRIAGE", run.steps[0]?.output.specialist ?? "SRE", "REVIEW"] as OpsRole[]).map((role, index) => <div key={index} className={`rounded-lg border px-2 py-3 text-center text-xs ${run.steps[index] ? "border-brand/30 bg-brand/[0.05] text-brand" : "border-ink-700 text-ink-400"}`}><span className="mb-1 block font-mono text-[10px]">0{index + 1}</span>{index === 1 && !run.steps[0] ? "專責工程師" : roles[role]}</div>)}</div>
    {latest ? <div className="space-y-5">
      <div><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-semibold text-ink-100">{finished ? "調查結論" : "目前進度"}</h4>{finished && <span className="text-[11px] text-ink-400">{latest.output.review === "SUPPORTED" ? "報告已審查" : "仍需補充證據"}</span>}</div><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-ink-200">{latest.output.summary}</p></div>
      {latest.output.findings.length > 0 && <div><h4 className="text-sm font-semibold text-ink-100">觀察與證據</h4><ul className="mt-2 space-y-3">{latest.output.findings.map((f, i) => <li key={i} className="border-l-2 border-brand/40 pl-3 text-sm leading-6 text-ink-200">{f.text}<span className="mt-1 block text-[11px] text-ink-400">依據：{f.evidenceIds.join("、")}</span></li>)}</ul></div>}
      {latest.output.hypotheses.length > 0 && <TextList title="尚待驗證的可能原因" values={latest.output.hypotheses} />}
      {latest.output.actions.length > 0 && <div><h4 className="text-sm font-semibold text-ink-100">建議下一步</h4><div className="mt-2 space-y-3">{latest.output.actions.map((a, i) => <div key={i} className="rounded-lg bg-ink-800/60 p-3"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-ink-100">{a.title}</p><span className="text-[10px] text-ink-400">{a.risk === "CHANGE_REQUIRED" ? "涉及修改，尚未執行" : "唯讀檢查"}</span></div><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-6 text-ink-300">{a.detail}</p></div>)}</div></div>}
      {latest.output.limitations.length > 0 && <TextList title="本次檢查的限制" values={latest.output.limitations} />}
    </div> : <p className="py-6 text-sm leading-6 text-ink-400">{run.status === "RUNNING" ? "事件主管正在整理資料。" : "尚未產生 AI 結論。執行器連線且派工開啟後會接手。"}</p>}
    <details className="mt-5 border-t border-ink-700 pt-4"><summary className="cursor-pointer text-xs font-medium text-ink-300">查看交接紀錄與用量</summary><div className="mt-3 space-y-4">{run.steps.map((step, i) => <div key={i} className="border-l border-ink-600 pl-3"><p className="text-xs font-semibold text-ink-100">{roles[step.role]} · {time(step.completedAt)}</p><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-6 text-ink-300">{step.output.summary}</p><p className="mt-1 break-all font-mono text-[10px] text-ink-400">{step.model} · 輸入 {step.inputTokens.toLocaleString()} / 輸出 {step.outputTokens.toLocaleString()} tokens</p></div>)}{!run.steps.length && <p className="text-xs text-ink-400">尚無交接紀錄。</p>}</div></details>
    <details className="mt-4 border-t border-ink-700 pt-4"><summary className="cursor-pointer text-xs font-medium text-ink-300">查看原始指標</summary><div className="mt-3 space-y-4">{run.evidence.map(e => <div key={e.id}><p className="text-xs font-medium text-ink-200">{e.label} · {e.id}</p><p className="mt-1 text-[10px] text-ink-400">採樣 {time(e.observedAt)}</p><dl className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">{Object.entries(e.data).map(([key, value]) => <div key={key} className="flex min-w-0 justify-between gap-2 text-[11px] leading-5"><dt className="break-all text-ink-400">{key}</dt><dd className="shrink-0 font-mono text-ink-200">{value === null ? "未知" : String(value)}</dd></div>)}</dl></div>)}</div></details>
    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink-700 pt-4">{["FAILED", "PAUSED"].includes(run.status) && <button className="oj-btn-secondary text-xs" disabled={busy} onClick={() => onAction("retry")}>接續重試</button>}{["QUEUED", "RUNNING", "PAUSED"].includes(run.status) && <button className="oj-btn-secondary text-xs" disabled={busy} onClick={() => onAction("cancel")}>取消工作</button>}<p className="text-[11px] leading-5 text-ink-400">報告完成不代表服務已修復；需要修改時，請建立修復工作並查看驗證結果。</p></div>
  </article>;
}
function TextList({ title, values }: { title: string; values: string[] }) { return <div><h4 className="text-sm font-semibold text-ink-100">{title}</h4><ul className="mt-2 list-disc space-y-2 pl-4 text-xs leading-6 text-ink-300">{values.map((value, i) => <li className="whitespace-pre-wrap break-words" key={i}>{value}</li>)}</ul></div>; }
