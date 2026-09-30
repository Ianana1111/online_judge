"use client";
import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { DailyTrafficPoint, TopPageRow, TopReferrerRow, TrafficSummary } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";
import { useChartColors } from "@/lib/useChartColors";
export default function AdminTrafficDashboard() {
  const t = useT();
  const isAdmin = useAuthStore(s => s.user?.role === "ADMIN");
  const colors = useChartColors();
  const tooltipStyle = { background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 6, fontSize: 12, color: colors.tooltipText };
  const TRAFFIC_DAYS = 30;
  const { data: trafficSummary } = useQuery({
    queryKey: ["analytics", "traffic-summary"],
    queryFn: () => apiFetch<TrafficSummary>(`/analytics/traffic/summary?days=${TRAFFIC_DAYS}`),
    enabled: isAdmin,
  });
  const { data: dailyTraffic } = useQuery({
    queryKey: ["analytics", "traffic-daily"],
    queryFn: () => apiFetch<DailyTrafficPoint[]>(`/analytics/traffic/daily?days=${TRAFFIC_DAYS}`),
    enabled: isAdmin,
  });
  const { data: topPages } = useQuery({
    queryKey: ["analytics", "traffic-top-pages"],
    queryFn: () => apiFetch<TopPageRow[]>(`/analytics/traffic/top-pages?days=${TRAFFIC_DAYS}&limit=12`),
    enabled: isAdmin,
  });
  const { data: topReferrers } = useQuery({
    queryKey: ["analytics", "traffic-top-referrers"],
    queryFn: () => apiFetch<TopReferrerRow[]>(`/analytics/traffic/top-referrers?days=${TRAFFIC_DAYS}&limit=12`),
    enabled: isAdmin,
  });

  return (
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink-200">{t("Site traffic (last {n} days)", { n: TRAFFIC_DAYS })}</h2>
          <p className="text-xs text-ink-500">{t("Bot/crawler traffic and known referrer-spam domains filtered server-side.")}</p>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-2">
          <div className="oj-card p-4">
            <p className="text-xs text-ink-400">{t("Pageviews")}</p>
            <p className="mt-1 font-mono text-2xl text-ink-50">
              {trafficSummary ? trafficSummary.totalViews.toLocaleString() : "—"}
            </p>
          </div>
          <div className="oj-card p-4">
            <p className="text-xs text-ink-400">{t("Distinct pages viewed")}</p>
            <p className="mt-1 font-mono text-2xl text-ink-50">
              {trafficSummary ? trafficSummary.distinctPaths.toLocaleString() : "—"}
            </p>
          </div>
        </div>
        <div className="oj-card p-4">
          {!dailyTraffic || dailyTraffic.length === 0 ? (
            <p className="text-sm text-ink-400">{t("No traffic data yet.")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyTraffic} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.cursorFill} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: colors.axisMuted, fontSize: 10 }}
                  axisLine={{ stroke: colors.gridLine }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: colors.axisMuted, fontSize: 11 }} axisLine={{ stroke: colors.gridLine }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#5b8def" strokeWidth={2} dot={false} name={t("Pageviews")} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="oj-card p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{t("Top pages")}</h3>
            {!topPages || topPages.length === 0 ? (
              <p className="text-sm text-ink-400">{t("No data yet.")}</p>
            ) : (
              <table className="oj-table">
                <tbody>
                  {topPages.map((p) => (
                    <tr key={p.path}>
                      <td className="max-w-[220px] truncate font-mono text-xs" title={p.path}>
                        {p.path}
                      </td>
                      <td className="w-16 text-right font-mono">{p.count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="oj-card p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{t("Top external referrers")}</h3>
            {!topReferrers || topReferrers.length === 0 ? (
              <p className="text-sm text-ink-400">{t("No external referrers yet.")}</p>
            ) : (
              <table className="oj-table">
                <tbody>
                  {topReferrers.map((r) => (
                    <tr key={r.referrer}>
                      <td className="max-w-[220px] truncate font-mono text-xs" title={r.referrer}>
                        {r.referrer}
                      </td>
                      <td className="w-16 text-right font-mono">{r.count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

  );
}
