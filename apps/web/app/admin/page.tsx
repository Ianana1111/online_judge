"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { AdminOverview } from "@oj/shared";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import OperationalStatus from "@/components/OperationalStatus";

const number = (value?: number) => value === undefined ? "—" : value.toLocaleString("zh-TW");
export default function AdminConsolePage() {
  const user = useAuthStore(s => s.user);
  const query = useQuery({ queryKey: ["operations", "overview", user?.id], queryFn: () => apiFetch<AdminOverview>("/operations/overview"), enabled: user?.role === "ADMIN", refetchInterval: 30000 });
  const d = query.data;
  const actions = [
    { href: "/admin/moderation", label: "內容審核", value: d ? d.pendingPosts + d.pendingComments : undefined, note: d ? `${d.pendingPosts} 篇文章 · ${d.pendingComments} 則留言` : "投稿與留言" },
    { href: "/admin/schools", label: "學校網域申請", value: d?.pendingSchools, note: "等待確認的學校網域" },
    { href: "/admin/billing", label: "退款處理", value: d?.pendingRefunds, note: "申請中、處理中與待核對" },
  ];
  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-semibold tracking-widest text-brand">JUDGE. CONTROL ROOM</p><h1 className="mt-2 font-display text-2xl font-bold text-ink-50">營運總覽</h1><p className="mt-2 text-sm leading-6 text-ink-400">先看待辦與服務狀態，再深入會員、金流及使用情形。</p></div><Link href="/admin/services" className="oj-btn-secondary text-xs">外部服務與費用 ↗</Link></header>
    {query.isError && <p role="alert" className="oj-card p-4 text-sm text-verdict-wa">總覽資料暫時無法取得。<button className="ml-2 underline" onClick={() => void query.refetch()}>重試</button></p>}
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Metric label="註冊會員" value={number(d?.accounts)} note={`近 30 天新增 ${number(d?.newAccounts30d)} 人`} href="/admin/users" />
      <Metric label="一般會員 Pro" value={number(d?.activePro)} note={`含試用／贈送；自動續訂 ${number(d?.activeSubscriptions)} 筆`} href="/admin/analytics?tab=product" />
      <Metric label="近 30 天確認款項" value={d ? `NT$${number(d.confirmedGross30d)}` : "—"} note="已確認且未退款；不含僅授權" href="/admin/billing" />
      <Metric label="近 30 天退訂" value={number(d?.cancelledSubscriptions30d)} note={`同期退款／撤銷 NT$${number(d?.refunds30d)}`} href="/admin/analytics?tab=product" />
    </div>
    {d?.signupProCampaign && <section className="oj-card p-5" aria-labelledby="signup-gift-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 id="signup-gift-title" className="text-sm font-semibold text-ink-100">新會員 Pro 贈禮</h2>
          <p className="mt-1 text-xs leading-5 text-ink-400">起算時 {d.signupProCampaign.baselineUserCount} 個帳戶 · 後續前 {d.signupProCampaign.capacity} 個新帳戶免費獲得 {d.signupProCampaign.durationDays} 天 Pro</p></div>
        <div className="text-right"><p className="font-mono text-xl font-semibold tabular-nums text-brand">{d.signupProCampaign.grantedCount}<span className="text-sm font-normal text-ink-400"> / {d.signupProCampaign.capacity}</span></p>
          <p className="mt-1 text-xs text-ink-400">{!d.signupProCampaign.enabled ? "活動已暫停" : d.signupProCampaign.remaining ? `剩餘 ${d.signupProCampaign.remaining} 個名額` : "名額已送完"}</p></div>
      </div>
      <progress aria-label="已發送的 Pro 贈禮" max={d.signupProCampaign.capacity} value={d.signupProCampaign.grantedCount} className="mt-4 h-1.5 w-full overflow-hidden rounded-full accent-brand" />
      <p className="mt-2 text-[11px] leading-5 text-ink-500">{new Date(d.signupProCampaign.startsAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })} 起算（台灣時間）· 到期不自動扣款 · 每 30 秒更新</p>
    </section>}
    <section aria-labelledby="admin-tasks"><div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 id="admin-tasks" className="text-sm font-semibold text-ink-100">待處理事項</h2><p className="text-[11px] text-ink-400">每 30 秒更新 · {d ? new Date(d.measuredAt).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei", hour12: false }) : "載入中…"}</p></div><div className="grid gap-3 lg:grid-cols-3">{actions.map(action => <Link key={action.href} href={action.href} className={`group flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors hover:border-brand/50 ${action.value ? "border-brand/25 bg-brand/[0.04]" : "border-ink-700 bg-ink-900/40"}`}><div><h3 className="text-sm font-medium text-ink-100">{action.label}</h3><p className="mt-1.5 text-[11px] leading-5 text-ink-400">{action.note}</p></div><span className={`font-mono text-2xl ${action.value ? "text-brand" : "text-ink-400"}`}>{number(action.value)}<span className="ml-2 text-sm text-ink-500 group-hover:text-brand" aria-hidden>↗</span></span></Link>)}</div></section>
    <OperationalStatus />
    <Link href="/admin/agent-ops" className="group flex items-center justify-between gap-4 rounded-xl border border-brand/25 bg-brand/[0.04] p-5 transition-colors hover:border-brand/50"><div><p className="font-mono text-[10px] tracking-widest text-brand">JUDGEOPS</p><h2 className="mt-2 text-sm font-semibold text-ink-100">AI 維運中心與每日報告</h2><p className="mt-1 text-xs leading-5 text-ink-400">查看服務異常、Agent 調查交接與建議下一步。</p></div><span aria-hidden className="text-xl text-brand">↗</span></Link>
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="oj-card p-5"><h2 className="font-semibold text-ink-100">內容與教學</h2><div className="mt-3 divide-y divide-ink-700">{[
        { href: "/admin/problems", label: "題目", value: d ? `${number(d.visibleProblems)} 公開 / ${number(d.problems)} 總數` : "—" },
        { href: "/admin/contests", label: "虛擬測驗", value: `${number(d?.contests)} 場 · ${number(d?.liveExams)} 人應試中` },
        { href: "/admin/assignments", label: "作業", value: `${number(d?.assignments)} 份` },
        { href: "/admin/classes", label: "班級", value: "查看學習進度" },
      ].map(row => <Link key={row.href} href={row.href} className="flex justify-between gap-3 py-3 text-sm text-ink-300 hover:text-brand"><span>{row.label}</span><span className="text-right text-xs leading-5">{row.value} ↗</span></Link>)}</div></div>
      <div className="oj-card p-5"><h2 className="font-semibold text-ink-100">接下來想了解什麼？</h2><div className="mt-3 space-y-2">{[
        { href: "/admin/analytics?tab=product", title: "購買與使用情形", note: "付費轉換、退訂和熱門使用時段" },
        { href: "/admin/analytics?tab=audience", title: "訪客從哪裡來", note: "未登入訪客、台灣地區及熱門頁面" },
        { href: "/admin/services", title: "服務與支出", note: "用量、費用紀錄、憑證及續費提醒" },
      ].map(row => <Link key={row.href} href={row.href} className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-800"><p className="text-sm text-ink-100">{row.title} <span className="text-brand">↗</span></p><p className="mt-1 text-xs text-ink-400">{row.note}</p></Link>)}</div></div>
    </section>
  </div>;
}
function Metric({ label, value, note, href }: { label: string; value: string; note: string; href: string }) {
  return <Link href={href} className="min-w-0 rounded-xl border border-ink-700 bg-ink-900/40 p-4 transition-colors hover:border-brand/50 sm:p-5"><p className="text-xs text-ink-400">{label}</p><p className="mt-3 break-words font-mono text-2xl font-semibold tabular-nums text-ink-50">{value}</p><p className="mt-2 text-[11px] leading-5 text-ink-400">{note}</p></Link>;
}
