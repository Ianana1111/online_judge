"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { UserStats, Verdict } from "@/lib/types";
import { LANGUAGE_LABEL, VERDICT_LABEL } from "@/lib/types";

// Fixed categorical order/hues — never reassigned based on which languages appear in the data.
const LANGUAGE_ORDER = ["cpp17", "c11", "python3", "java17"];
const LANGUAGE_COLOR: Record<string, string> = {
  cpp17: "#5B8DEF",
  c11: "#B98CE0",
  python3: "#6FCF97",
  java17: "#E8A33D",
};

// Reserved status colors — same mapping used by VerdictBadge, never reused for anything else.
const VERDICT_ORDER: Verdict[] = ["AC", "WA", "TLE", "MLE", "RE", "CE", "PE", "OLE", "SE"];
const VERDICT_COLOR: Record<Verdict, string> = {
  AC: "#2fae5e",
  WA: "#d9534f",
  TLE: "#e08a2f",
  MLE: "#c9772f",
  RE: "#c44f6b",
  CE: "#8b8f9b",
  PE: "#c9a13b",
  OLE: "#b3672f",
  SE: "#7a5cc9",
  PENDING: "#4a6fa5",
  JUDGING: "#4a6fa5",
};

const tooltipStyle = {
  background: "#141a22",
  border: "1px solid #2a3441",
  borderRadius: 6,
  fontSize: 12,
  color: "#e8ecef",
};

export default function StatCharts({ stats }: { stats: UserStats }) {
  const langData = LANGUAGE_ORDER.map((key) => ({
    key,
    name: LANGUAGE_LABEL[key] ?? key,
    value: stats.languageBreakdown.find((l) => l.languageKey === key)?.count ?? 0,
  })).filter((d) => d.value > 0);

  const verdictData = VERDICT_ORDER.map((v) => ({
    verdict: v,
    name: VERDICT_LABEL[v],
    count: stats.verdictBreakdown.find((x) => x.verdict === v)?.count ?? 0,
  }));

  const difficultyData = [1, 2, 3, 4].map((d) => ({
    difficulty: `★`.repeat(d),
    count: stats.solvedByDifficulty.find((x) => x.difficulty === d)?.count ?? 0,
  }));

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="oj-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-200">Language usage</h3>
        {langData.length === 0 ? (
          <p className="text-sm text-ink-400">No accepted submissions yet.</p>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={langData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {langData.map((d) => (
                    <Cell key={d.key} fill={LANGUAGE_COLOR[d.key]} stroke="#0e1218" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="space-y-1.5 text-xs">
              {langData.map((d) => (
                <li key={d.key} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: LANGUAGE_COLOR[d.key] }} />
                  <span className="text-ink-300">{d.name}</span>
                  <span className="font-mono text-ink-500">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="oj-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-200">Verdict breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={verdictData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" tick={{ fill: "#6b7a8b", fontSize: 11 }} axisLine={{ stroke: "#2a3441" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: "#9aa8b5", fontSize: 11 }}
              axisLine={{ stroke: "#2a3441" }}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1c2530" }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {verdictData.map((d) => (
                <Cell key={d.verdict} fill={VERDICT_COLOR[d.verdict]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="oj-card p-4 sm:col-span-2">
        <h3 className="mb-3 text-sm font-semibold text-ink-200">Solved by difficulty</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={difficultyData} margin={{ left: 8, right: 16 }}>
            <XAxis dataKey="difficulty" tick={{ fill: "#9aa8b5", fontSize: 12 }} axisLine={{ stroke: "#2a3441" }} />
            <YAxis tick={{ fill: "#6b7a8b", fontSize: 11 }} axisLine={{ stroke: "#2a3441" }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1c2530" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {difficultyData.map((_, i) => (
                <Cell key={i} fill="#e8a33d" fillOpacity={0.4 + i * 0.2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
