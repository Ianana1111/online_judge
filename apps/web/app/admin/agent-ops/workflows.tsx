"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { opsTaskCreateSchema, type OpsWorkflowDashboard, type OpsWorkflowTask } from "@oj/shared";
import { apiFetch } from "@/lib/api";
const labels: Record<string, string> = { QUEUED: "等待執行", RUNNING: "執行中", SUCCEEDED: "已完成", FAILED: "未通過", PAUSED: "已暫停", CANCELLED: "已取消", AWAITING_APPROVAL: "等待你的核准", APPROVED: "已核准", NEEDS_INPUT: "需要你處理", ROLLED_BACK: "已復原" };
const date = (v: string | null) => v ? new Date(v).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "尚未執行";
export function WorkflowPanel({ userId }: { userId: string }) {
  const client = useQueryClient(), queryKey = ["ops-workflows", userId];
  const query = useQuery({ queryKey, queryFn: () => apiFetch<OpsWorkflowDashboard>("/agent-ops/workflows"), refetchInterval: 15000 });
  const [notice, setNotice] = useState(""), [selected, setSelected] = useState<string | null>(null), [form, setForm] = useState(false);
  const [objective, setObjective] = useState(""), [files, setFiles] = useState("");
  const mutation = useMutation({ mutationFn: ({ path = "", body }: { path?: string; body?: unknown }) => apiFetch<OpsWorkflowTask>(`/agent-ops/workflows${path}`, { method: "POST", body }), onSuccess: async task => { if (task.id) setSelected(task.id); setNotice("工作已更新，執行紀錄會自動刷新。"); setForm(false); await client.invalidateQueries({ queryKey }); }, onError: e => setNotice(e instanceof Error ? e.message : "操作未完成") });
  const data = query.data, task = data?.tasks.find(t => t.id === selected) ?? data?.tasks[0];
  const create = (kind: "VERIFY" | "EVALUATE" | "REPAIR") => {
    const input = opsTaskCreateSchema.safeParse({ kind, requestId: crypto.randomUUID(), ...(kind === "REPAIR" ? { objective, files: files.split("\n").map(s => s.trim()).filter(Boolean) } : {}) });
    if (!input.success) { setNotice("請填寫問題的重現方式，並指定 1–4 個應用程式來源檔案（每行一個）。"); return; }
    mutation.mutate({ body: input.data });
  };
  if (query.isError) return <section className="oj-card p-4"><p role="alert" className="text-sm text-ink-300">功能巡檢資料讀取失敗。<button className="ml-2 underline" onClick={() => void query.refetch()}>重試</button></p></section>;
  if (!data) return <p className="text-sm text-ink-400">讀取工作流程…</p>;
  const evaluation = data.evaluation?.result;
  return <section aria-labelledby="workflow-title" className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="workflow-title" className="font-semibold text-ink-100">驗證、修復與發布</h2><p className="mt-1 text-xs leading-5 text-ink-400">GPT-6 Sol · high · 使用 Codex 登入額度。程式修改先隔離驗證，再交給你核准。</p></div>{data.monitorUrl && <a href={data.monitorUrl} target="_blank" rel="noopener noreferrer" className="oj-btn-secondary text-xs">獨立服務狀態 ↗</a>}</div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="oj-card p-4"><p className="text-xs text-ink-400">最近功能巡檢</p><p className="mt-2 font-semibold text-ink-100">{data.latestVerification ? labels[data.latestVerification.status] ?? data.latestVerification.status : "尚無驗證結果"}</p><p className="mt-1 text-xs text-ink-400">{date(data.latestVerification?.completedAt ?? null)}</p></div>
      <div className="oj-card p-4"><p className="text-xs text-ink-400">每日巡檢</p><p className="mt-2 font-semibold text-ink-100">{data.autoVerify ? "每天 08:00 排入佇列" : "尚未開啟"}</p><p className="mt-1 text-xs text-ink-400">電腦在線且派工開啟後執行</p></div>
      <div className="oj-card p-4"><p className="text-xs text-ink-400">發布紀錄</p><p className="mt-2 font-semibold text-ink-100">{data.approvedReleases} 次核准 · {data.revertedReleases} 次復原</p><p className="mt-1 text-xs text-ink-400">綁定核准版本，保留部署檢查點</p></div>
    </div>
    <div className="flex flex-wrap gap-2">
      <button className="oj-btn-primary text-xs" disabled={mutation.isPending || !data.enabled} onClick={() => create("VERIFY")}>執行完整巡檢</button>
      <button className="oj-btn-secondary text-xs" disabled={mutation.isPending || !data.enabled} onClick={() => setForm(!form)} aria-expanded={form}>建立修復工作</button>
      <button className="oj-btn-secondary text-xs" disabled={mutation.isPending || !data.enabled} onClick={() => create("EVALUATE")}>比較 Agent 成效</button>
    </div>
    <p className="text-xs leading-6 text-ink-400">{data.autoRepair ? "自動修復評估已開啟：經審查且尚未恢復的事件會自動派工；證據不足時交回你處理，通過驗證後建立待核准 PR。" : "自動修復評估尚未開啟。"}</p>
    {!data.monitorUrl && <p className="text-xs text-ink-400">獨立 GCP 監控尚未連接；目前雲端指標仍由 Railway API 收集。</p>}
    {!data.enabled && <p className="text-xs text-ink-400">工作流程尚未啟用。</p>}
    {notice && <p role="status" className="rounded-lg border border-ink-600 p-3 text-sm text-ink-200">{notice}</p>}
    {form && <form className="oj-card space-y-4 p-4" onSubmit={e => { e.preventDefault(); create("REPAIR"); }}>
      <label className="block text-xs text-ink-300">問題與重現方式<textarea className="oj-input mt-2 min-h-24 w-full" maxLength={2000} required value={objective} onChange={e => setObjective(e.target.value)} placeholder="在哪一頁、做什麼操作、預期結果與目前結果" /></label>
      <label className="block text-xs text-ink-300">來源檔案，每行一個<textarea className="oj-input mt-2 min-h-20 w-full font-mono text-xs" required value={files} onChange={e => setFiles(e.target.value)} placeholder="apps/web/lib/example.ts" /></label>
      <p className="text-xs leading-5 text-ink-400">每次限制 1–4 個檔案。新測試須在原版失敗、修復版成功，完整測試和 QA／安全審查都通過後才建立 PR。修改不會直接發布。</p>
      <button className="oj-btn-primary text-xs" disabled={mutation.isPending}>排入修復佇列</button>
    </form>}
    <div className="grid min-w-0 gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
      <div className="max-h-[540px] space-y-2 overflow-y-auto" aria-label="工作列表">{data.tasks.map(t => <button key={t.id} aria-pressed={t.id === task?.id} onClick={() => setSelected(t.id)} className={`w-full rounded-xl border p-3 text-left ${task?.id === t.id ? "border-brand/50 bg-brand/[0.06]" : "border-ink-700 bg-ink-900"}`}><span className="text-[11px] text-ink-400">{date(t.createdAt)}</span><p className="mt-2 text-sm font-medium text-ink-100">{t.title}</p><span className="mt-2 block text-xs text-ink-300">{labels[t.status] ?? t.status}</span></button>)}{!data.tasks.length && <p className="oj-card p-4 text-sm text-ink-400">巡檢與修復紀錄會顯示在這裡。</p>}</div>
      {task ? <TaskReport key={task.id} task={task} busy={mutation.isPending} onAction={(path, body) => mutation.mutate({ path, body })} /> : <div className="oj-card flex min-h-40 items-center justify-center text-sm text-ink-400">等待第一次功能巡檢</div>}
    </div>
    {evaluation && <div className="oj-card overflow-hidden p-4"><h3 className="text-sm font-semibold text-ink-100">Agent 成效實測</h3><p className="mt-2 text-xs leading-5 text-ink-400">{evaluation.summary} · {date(data.evaluation?.completedAt ?? null)}</p><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-ink-400"><tr>{["方法", "判斷正確", "有效引用", "誤報 / 漏報", "時間", "Token"].map(v => <th key={v} className="whitespace-nowrap py-2 pr-4 font-normal">{v}</th>)}</tr></thead><tbody className="text-ink-200">{([['rules','固定規則'],['single','單一代理'],['multi','三角色交接']] as const).map(([key,label]) => <tr key={key} className="border-t border-ink-700"><td className="whitespace-nowrap py-3 pr-4">{label}</td><td>{evaluation.metrics[`${key}Correct`] ?? '—'} / {evaluation.metrics.fixtureCount ?? '—'}</td><td>{evaluation.metrics[`${key}Citations`] ?? '—'}</td><td>{evaluation.metrics[`${key}FalsePositives`] ?? '—'} / {evaluation.metrics[`${key}FalseNegatives`] ?? '—'}</td><td>{typeof evaluation.metrics[`${key}LatencyMs`] === 'number' ? `${Math.round(Number(evaluation.metrics[`${key}LatencyMs`]) / 1000)}s` : '—'}</td><td>{Number(evaluation.metrics[`${key}Tokens`] ?? 0).toLocaleString()}</td></tr>)}</tbody></table></div></div>}
  </section>;
}
function TaskReport({ task, busy, onAction }: { task: OpsWorkflowTask; busy: boolean; onAction: (path: string, body?: unknown) => void }) {
  const [approve, setApprove] = useState(false), r = task.result;
  return <article className="oj-card min-w-0 p-4 sm:p-5" aria-label="工作報告">
    <div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-semibold text-ink-100">{task.title}</h3><span className="text-xs text-brand">{labels[task.status] ?? task.status}</span></div>
    {r && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink-200">{r.summary}</p>}
    {task.errorCode && <p className="mt-3 text-xs leading-6 text-ink-300">工作暫停（{task.errorCode}）。請檢查執行器的紀錄與最後檢查點。發布與修復不會因斷線而自動重播。</p>}
    {task.events.length > 0 && <ol className="mt-4 space-y-3 border-l border-ink-600 pl-4">{task.events.map(e => <li key={e.sequence}><p className="text-xs font-medium text-ink-200">{e.detail}</p><p className="mt-1 text-[10px] text-ink-400">{date(e.at)} · {e.label}</p>{Object.keys(e.data).length > 0 && <details className="mt-1 text-[11px] text-ink-400"><summary className="cursor-pointer">檢查點資料</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(e.data, null, 2)}</pre></details>}</li>)}</ol>}
    {r && <>
      <div className="mt-5 divide-y divide-ink-700">{r.checks.map((c,i) => <details key={`${c.name}-${i}`} className="py-2.5"><summary className="flex cursor-pointer items-center justify-between gap-3 text-xs"><span className="min-w-0 break-words text-ink-200">{c.name}</span><span className={`shrink-0 font-mono ${c.status === 'PASS' ? 'text-verdict-ac' : c.status === 'FAIL' ? 'text-verdict-wa' : 'text-ink-400'}`}>{c.status}</span></summary><p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-ink-400">{c.detail}</p></details>)}</div>
      {r.pullUrl && <a className="oj-btn-secondary mt-4 inline-flex text-xs" href={r.pullUrl} target="_blank" rel="noopener noreferrer">查看修復 PR #{r.pullNumber} ↗</a>}
      {task.status === "AWAITING_APPROVAL" && task.approvalDigest && <div className="mt-4 rounded-lg border border-brand/30 p-4"><p className="text-sm font-medium text-ink-100">核准此版本並發布</p><p className="mt-2 break-all font-mono text-[11px] text-ink-400">{r.headSha}</p><label className="mt-3 flex items-start gap-2 text-xs leading-6 text-ink-200"><input type="checkbox" className="mt-1" checked={approve} onChange={e => setApprove(e.target.checked)} />我已查看 PR 和驗證結果，同意將這個版本發布到正式網站。</label><button className="oj-btn-primary mt-3 text-xs" disabled={busy || !approve} onClick={() => onAction(`/${task.id}/approve`, { digest: task.approvalDigest })}>核准並發布</button></div>}
      <p className="mt-4 text-[11px] text-ink-400">{r.modelCalls} 次模型呼叫 · 輸入 {r.inputTokens.toLocaleString()} / 輸出 {r.outputTokens.toLocaleString()} tokens</p>
      {r.artifacts.length > 0 && <details className="mt-3 text-xs text-ink-400"><summary className="cursor-pointer">本機驗證產物與 SHA256</summary>{r.artifacts.map(a => <p key={a.name} className="mt-2 break-all font-mono text-[10px]">{a.name} · {a.bytes} bytes<br />{a.sha256}</p>)}</details>}
    </>}
    {["QUEUED", "PAUSED", "AWAITING_APPROVAL", "NEEDS_INPUT"].includes(task.status) && <button className="oj-btn-secondary mt-4 text-xs" disabled={busy} onClick={() => onAction(`/${task.id}/cancel`)}>取消工作</button>}
  </article>;
}
