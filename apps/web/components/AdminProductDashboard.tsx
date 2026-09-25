"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/lib/api";
import { useChartColors } from "@/lib/useChartColors";
import type { ProductDashboard } from "@/lib/types";

const number = (value: number) => value.toLocaleString("zh-TW");
const money = (value: number) => `NT$${number(Math.round(value))}`;
const date = (value: string | null) => value ? new Date(value).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false }) : "—";

export default function AdminProductDashboard() {
  const [days, setDays] = useState(30);
  const colors = useChartColors();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["analytics", "product-dashboard", days],
    queryFn: () => apiFetch<ProductDashboard>(`/analytics/product-dashboard?days=${days}`),
    staleTime: 60_000,
  });
  const totals = data?.usage.submissions ?? {};
  const submissionCount = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const peak = data?.hourlyTraffic.reduce((best, row) => row.views > best.views ? row : best);
  const quiet = data?.hourlyTraffic.reduce((best, row) => row.views < best.views ? row : best);

  return <section aria-labelledby="product-dashboard-title" className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id="product-dashboard-title" className="font-display text-xl font-semibold text-ink-50">產品營運概況</h2>
        <p className="mt-1 text-sm text-ink-400">台灣時間 · 依實際頁面瀏覽、評測、測驗與付款紀錄統計</p>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-300">統計期間
        <select className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-ink-100" value={days} onChange={event => setDays(Number(event.target.value))}>
          <option value={7}>近 7 天</option><option value={30}>近 30 天</option><option value={90}>近 90 天</option><option value={365}>近 365 天</option>
        </select>
      </label>
    </div>
    {isPending && <p role="status" className="oj-card p-5 text-sm text-ink-300">正在載入營運數據…</p>}
    {isError && <div role="alert" className="oj-card flex flex-wrap items-center gap-3 p-5 text-sm text-verdict-wa">營運數據載入失敗。<button className="oj-btn-secondary" onClick={() => void refetch()}>重試</button></div>}
    {data && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="新註冊帳號" value={number(data.usage.signups)} note="期間內建立、未申請刪除" />
        <Metric label="登入訪客" value={number(data.usage.loggedInVisitors)} note="至少有一次頁面瀏覽的帳號" />
        <Metric label="解題人數" value={number(data.usage.solvers)} note={`${number(submissionCount)} 次提交，${number(data.usage.acceptedUsers)} 人曾 AC`} />
        <Metric label="確認收款" value={money(data.billing.confirmedGrossNtd)} note={`${number(data.billing.confirmedPaymentCount)} 筆，未扣退款或手續費`} />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="oj-card min-w-0 p-5">
          <h3 className="font-semibold text-ink-100">一天中什麼時段最多人瀏覽？</h3>
          <p className="mt-1 text-xs text-ink-400">期間內每小時的累計 pageviews，依台灣時間分組</p>
          {data.hourlyTraffic.some(row => row.views > 0) ? <>
            <div className="mt-4 h-56" role="img" aria-label="每小時瀏覽量長條圖">
              <ResponsiveContainer width="100%" height="100%"><BarChart data={data.hourlyTraffic} margin={{ left: 0, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.cursorFill} vertical={false} />
                <XAxis dataKey="hour" tickFormatter={hour => `${hour}時`} tick={{ fill: colors.axisMuted, fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: colors.axisMuted, fontSize: 10 }} allowDecimals={false} width={36} />
                <Tooltip formatter={value => number(Number(value))} labelFormatter={hour => `${hour}:00–${hour}:59`} contentStyle={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, color: colors.tooltipText }} />
                <Bar dataKey="views" name="瀏覽量" fill="#5b8def" radius={[3, 3, 0, 0]} />
              </BarChart></ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm"><p>最多：<strong className="text-ink-50">{peak?.hour}:00–{peak?.hour}:59</strong>（{number(peak?.views ?? 0)}）</p><p>最少：<strong className="text-ink-50">{quiet?.hour}:00–{quiet?.hour}:59</strong>（{number(quiet?.views ?? 0)}）</p></div>
          </> : <p className="mt-8 text-sm text-ink-400">這段期間還沒有瀏覽資料。</p>}
        </div>
        <div className="oj-card p-5">
          <h3 className="font-semibold text-ink-100">使用者做了什麼？</h3>
          <p className="mt-1 text-xs text-ink-400">由平台事件計算；各項不代表同一批使用者的連續轉換</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <Stat label="測驗開始次數" value={data.usage.examStarts} />
            <Stat label="AC 提交" value={totals.AC ?? 0} />
            <Stat label="WA 提交" value={totals.WA ?? 0} />
            <Stat label="發表文章" value={data.usage.publishedPosts} />
            <Stat label="發表留言" value={data.usage.publishedComments} />
            <Stat label="累計提交" value={submissionCount} />
          </dl>
          <p className="mt-6 border-t border-ink-700 pt-4 text-xs leading-5 text-ink-400">匿名訪客沒有可識別 ID，這裡的「登入訪客」只計有登入且成功送出瀏覽事件的人；瀏覽次數不等於不重複訪客數。</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="NT$200 已付款" value={number(data.billing.paidAt200)} note="期間內成功付款筆數" />
        <Metric label="NT$2,000 已付款" value={number(data.billing.paidAt2000)} note="期間內成功付款筆數" />
        <Metric label="目前有效訂閱" value={number(data.billing.activeSubscriptions)} note={`約 ${money(data.billing.committedRecurringNtdPerMonth)} / 月，非實收`} />
        <Metric label="期間內退訂" value={number(data.billing.cancelledSubscriptions)} note="停止續扣；已付權益依到期日結束" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Events title="付款紀錄（最近 30 筆）" empty="期間內尚無付款事件" rows={data.billing.recentPayments.map(row => ({ id: row.id, handle: row.user.handle, detail: `${row.period === "MONTHLY" ? "月繳" : "年繳"} · ${money(row.amountNtd)} · ${row.status === "APPROVED" ? "已付款" : row.status === "AUTHORIZED" ? "僅授權未請款" : "已退款"}`, at: date(row.paidAt ?? row.createdAt) }))} />
        <Events title="退訂紀錄（最近 30 筆）" empty="期間內沒有定期訂閱退訂" rows={data.billing.recentCancellations.map(row => ({ id: row.id, handle: row.user.handle, detail: `${row.period === "MONTHLY" ? "月繳" : "年繳"} · ${money(row.amountNtd)}`, at: date(row.cancelledAt) }))} />
      </div>
      <p className="text-xs leading-5 text-ink-400">付款金額是已確認付款的毛額；退款狀態：{Object.entries(data.billing.refundStatuses).map(([status, count]) => `${status} ${count}`).join("、") || "無"}。授權未請款、待付款不計收入；資料無法取代金流對帳。</p>
    </>}
  </section>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="oj-card p-4"><p className="text-xs text-ink-400">{label}</p><p className="mt-2 font-mono text-2xl font-semibold text-ink-50">{value}</p><p className="mt-2 text-xs text-ink-400">{note}</p></div>;
}
function Stat({ label, value }: { label: string; value: number }) {
  return <div><dt className="text-ink-400">{label}</dt><dd className="mt-1 font-mono text-lg text-ink-50">{number(value)}</dd></div>;
}
function Events({ title, rows, empty }: { title: string; rows: { id: string; handle: string; detail: string; at: string }[]; empty: string }) {
  return <section className="oj-card min-w-0 p-5"><h3 className="font-semibold text-ink-100">{title}</h3>{rows.length ? <div className="mt-3 max-h-80 overflow-y-auto"><ul className="divide-y divide-ink-700">{rows.map(row => <li key={row.id} className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-3 text-sm"><div className="min-w-0"><p className="font-semibold text-ink-100">{row.handle}</p><p className="text-ink-300">{row.detail}</p></div><time className="text-xs text-ink-400">{row.at}</time></li>)}</ul></div> : <p className="mt-4 text-sm text-ink-400">{empty}</p>}</section>;
}
