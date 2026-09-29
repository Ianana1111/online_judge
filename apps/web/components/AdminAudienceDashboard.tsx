"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AudienceDashboard } from "@/lib/types";

const n = (value: number) => value.toLocaleString("zh-TW");
const regions: Record<string, string> = { TPE: "臺北市", NWT: "新北市", TAO: "桃園市", TXG: "臺中市", TNN: "臺南市", KHH: "高雄市", KEE: "基隆市", HSZ: "新竹市", CYI: "嘉義市", HSQ: "新竹縣", MIA: "苗栗縣", CHA: "彰化縣", NAN: "南投縣", YUN: "雲林縣", CYQ: "嘉義縣", PIF: "屏東縣", ILA: "宜蘭縣", HUA: "花蓮縣", TTT: "臺東縣", PEN: "澎湖縣", KIN: "金門縣", LIE: "連江縣" };
const sources: Record<string, string> = { DIRECT: "直接／來源未知", REFERRAL: "外部網站導入", INTERNAL: "站內來源／無法還原入口" };

export default function AdminAudienceDashboard() {
  const [days, setDays] = useState(30);
  const [source, setSource] = useState<AudienceDashboard["source"]>("all");
  const query = useQuery({ queryKey: ["analytics", "audience", days, source], queryFn: () => apiFetch<AudienceDashboard>(`/analytics/audience?days=${days}&source=${source}`), staleTime: 30_000 });
  const data = query.data;
  const taiwan = data?.regions.filter(row => row.country === "TW") ?? [];
  const taiwanTotal = taiwan.reduce((sum, row) => sum + row.visitors, 0);
  const foreign = data?.regions.filter(row => row.country && row.country !== "TW").reduce((sum, row) => sum + row.visitors, 0) ?? 0;
  const unknown = data?.regions.filter(row => !row.country).reduce((sum, row) => sum + row.visitors, 0) ?? 0;
  const regionTotals = new Map<string, { visitors: number; anonymous: number }>();
  taiwan.forEach(row => {
    const label = regions[row.region?.replace(/^TW-/, "") ?? ""] ?? "台灣・縣市未知";
    const old = regionTotals.get(label) ?? { visitors: 0, anonymous: 0 };
    regionTotals.set(label, { visitors: old.visitors + row.visitors, anonymous: old.anonymous + row.anonymous });
  });
  const ranked = [...regionTotals].sort((a, b) => b[1].visitors - a[1].visitors);
  const max = Math.max(1, ...ranked.map(([, row]) => row.visitors));

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold tracking-widest text-brand-light">AUDIENCE INSIGHTS</p><h1 className="mt-2 font-display text-2xl font-semibold text-ink-50">訪客與台灣地區分析</h1><p className="mt-2 text-sm leading-6 text-ink-300">觀察有實際互動、尚未登入或尚未訂閱的瀏覽者。</p></div>
      <div className="flex flex-wrap gap-3">
        <label className="space-y-1 text-xs text-ink-300"><span className="block">期間（台灣時間）</span><select className="oj-input" value={days} onChange={e => setDays(Number(e.target.value))}><option value={7}>近 7 天</option><option value={30}>近 30 天</option><option value={90}>近 90 天</option><option value={365}>近 365 天</option></select></label>
        <label className="space-y-1 text-xs text-ink-300"><span className="block">進站來源</span><select className="oj-input" value={source} onChange={e => setSource(e.target.value as AudienceDashboard["source"])}><option value="all">所有來源</option><option value="direct">直接／來源未知</option><option value="referral">外部網站導入</option></select></label>
      </div>
    </div>
    {query.isPending && <p role="status" className="oj-card p-6 text-ink-300">正在整理訪客資料…</p>}
    {query.isError && <div role="alert" className="oj-card p-6 text-ink-200">無法載入訪客資料。<button className="oj-btn-secondary ml-3" onClick={() => void query.refetch()}>重試</button></div>}
    {data && <>
      <div className="oj-panel p-4 text-sm leading-6 text-ink-300">
        <strong className="text-ink-100">如何判讀：</strong>「有互動」需頁面可見累計至少 10 秒，且有點擊、捲動或鍵盤操作，並排除已知機器人與管理員。這是估計，不是真人身分驗證。
        <p className="mt-1">數字以不重複瀏覽器計算；不同裝置、清除 Cookie 會分開計算。未登入不代表從未註冊，來源未知也可能來自 LINE、Discord 或隱藏來源的連結。</p>
      </div>
      {!data.coverage.configured && <p role="alert" className="oj-card border-brand/40 p-4 text-sm text-ink-200">追蹤尚未啟用：需要在網站與 API 設定相同的分析簽章金鑰。</p>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="有互動的訪客" value={data.totals.engaged} note={`共 ${n(data.totals.visitors)} 個已追蹤瀏覽器；未達門檻者不計入此卡`} />
        <Metric label="有互動・未登入" value={data.totals.anonymous} note="所選流量中，期間內未觀察到登入的瀏覽器" />
        <Metric label="有互動・免費會員" value={data.totals.free} note="有登入，期間內未觀察到有效 Pro 權益" />
        <Metric label="有互動・無自動續訂會員" value={data.totals.unsubscribed} note="有登入，期間內未觀察到有效自動續訂；可能仍有 Pro 權益" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <section className="oj-card min-w-0 p-5">
          <h2 className="font-semibold text-ink-50">他們在台灣哪裡？</h2><p className="mt-2 text-xs leading-5 text-ink-400">有互動訪客的最近一次可用 IP 地區，每個瀏覽器只分配一個地區。</p>
          <div className="my-5 flex flex-wrap gap-3 text-xs text-ink-200"><span className="rounded-full bg-brand/10 px-3 py-1.5">台灣 {n(taiwanTotal)}</span><span className="rounded-full bg-ink-800 px-3 py-1.5">其他國家 {n(foreign)}</span><span className="rounded-full bg-ink-800 px-3 py-1.5">定位未知 {n(unknown)}</span></div>
          {ranked.length ? <ol className="space-y-4">{ranked.map(([name, row]) => <li key={name}><div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm"><span className="text-ink-100">{name}</span><span className="text-xs tabular-nums text-ink-300">{n(row.visitors)} 位 · 未登入 {n(row.anonymous)}</span></div><div className="h-2 rounded-full bg-ink-800" aria-hidden="true"><div className="h-full rounded-full bg-brand" style={{ width: `${row.visitors / max * 100}%` }} /></div></li>)}</ol> : <p className="py-8 text-sm text-ink-400">目前沒有可定位到台灣的互動訪客。</p>}
          <p className="mt-6 border-t border-ink-700 pt-4 text-xs leading-5 text-ink-400">依 Vercel 的 IP 概略定位，不是 GPS，也不是住址。行動網路、VPN、公司或學校網路可能顯示出口所在地；未知資料不會猜成某個縣市。本站分析資料不保存完整 IP。</p>
        </section>
        <div className="space-y-5">
          <section className="oj-card p-5"><h2 className="font-semibold text-ink-50">有互動訪客從哪裡來？</h2><p className="mt-2 text-xs leading-5 text-ink-400">直接進站與外部導入分開看；真人也可能從其他網站來。</p>
            {data.sources.length ? <ul className="mt-4 divide-y divide-ink-700">{data.sources.map(row => <li key={row.source} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span className="text-ink-200">{sources[row.source] ?? "未知來源"}</span><span className="text-xs tabular-nums text-ink-300">{n(row.visitors)} 位 · 未登入 {n(row.anonymous)}</span></li>)}</ul> : <p className="py-6 text-sm text-ink-400">這段期間還沒有互動資料。</p>}
            <p className="mt-3 text-xs leading-5 text-ink-400">同一瀏覽器可能從多個來源進站，來源人數不能直接相加。</p>
          </section>
          <section className="oj-card p-5"><h2 className="font-semibold text-ink-50">每天有多少人留下來？</h2>
            {data.daily.length ? <div className="mt-4 max-h-80 overflow-auto"><table className="oj-table text-xs"><thead><tr><th>日期</th><th className="text-right">有互動</th><th className="text-right">未登入</th></tr></thead><tbody>{data.daily.map(row => <tr key={row.date}><td>{row.date}</td><td className="text-right tabular-nums">{n(row.visitors)}</td><td className="text-right tabular-nums">{n(row.anonymous)}</td></tr>)}</tbody></table></div> : <p className="py-6 text-sm text-ink-400">開始累積互動後，這裡會顯示每日趨勢。</p>}
          </section>
        </div>
      </div>
      <p className="text-xs leading-6 text-ink-400">新追蹤起始：{data.trackingSince ? new Date(data.trackingSince).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }) : "尚未收到資料"}。所選期間原始瀏覽中，{n(data.coverage.trackedPageviews)} 筆有新識別資料，{n(data.coverage.legacyPageviews)} 筆為舊版或無法識別的瀏覽；後者不納入訪客與地區統計。尊重 Do Not Track／Global Privacy Control，封鎖追蹤的流量可能不會被記錄。</p>
    </>}
  </div>;
}
function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return <div className="oj-card p-4"><p className="text-xs text-ink-300">{label}</p><p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-ink-50">{n(value)}</p><p className="mt-3 text-xs leading-5 text-ink-400">{note}</p></div>;
}
