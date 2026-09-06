"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { UserStats, Verdict } from "@/lib/types";
import { LANGUAGE_LABEL, VERDICT_LABEL } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";
import { useChartColors } from "@/lib/useChartColors";

// Fixed categorical order/hues — never reassigned based on which languages appear in the data.
const LANGUAGE_ORDER = ["cpp17", "c11", "python3", "java17"];
const LANGUAGE_COLOR: Record<string, string> = {
  cpp17: "#5B8DEF",
  c11: "#B98CE0",
  python3: "#6FCF97",
  java17: "#E8A33D",
};

// Reserved status colors — same mapping used by VerdictBadge, never reused for anything else.
const VERDICT_ORDER: Verdict[] = ["AC", "WA", "TLE", "MLE", "RE", "RF", "CE", "PE", "OLE", "SE"];
const VERDICT_COLOR: Record<Verdict, string> = {
  AC: "#2fae5e",
  WA: "#d9534f",
  TLE: "#e08a2f",
  MLE: "#c9772f",
  RE: "#c44f6b",
  RF: "#b34a9e",
  CE: "#8b8f9b",
  PE: "#c9a13b",
  OLE: "#b3672f",
  SE: "#7a5cc9",
  PENDING: "#4a6fa5",
  JUDGING: "#4a6fa5",
};

const DIFFICULTY_COLOR = "#e8a33d";
const DIFFICULTY_OPACITY = [0.4, 0.6, 0.8, 1];

type ChartKind = "language" | "verdict" | "difficulty";
type Slice = { key: string; name: string; value: number; color: string; opacity?: number };

/** One shared donut instead of three differently-shaped charts (pie / stacked bar / bar) — a tab
 * strip swaps which breakdown fills it, so "language usage," "verdict breakdown," and "solved by
 * difficulty" read as three views of the same kind of thing rather than three unrelated widgets. */
export default function StatCharts({ stats }: { stats: UserStats }) {
  const t = useT();
  const colors = useChartColors();
  const [kind, setKind] = useState<ChartKind>("language");
  const tooltipStyle = {
    background: colors.tooltipBg,
    border: `1px solid ${colors.tooltipBorder}`,
    borderRadius: 6,
    fontSize: 12,
    color: colors.tooltipText,
  };

  const langData: Slice[] = LANGUAGE_ORDER.map((key) => ({
    key,
    name: t(LANGUAGE_LABEL[key] ?? key),
    value: stats.languageBreakdown.find((l) => l.languageKey === key)?.count ?? 0,
    color: LANGUAGE_COLOR[key],
  })).filter((d) => d.value > 0);

  const verdictData: Slice[] = VERDICT_ORDER.map((v) => ({
    key: v,
    name: t(VERDICT_LABEL[v]),
    value: stats.verdictBreakdown.find((x) => x.verdict === v)?.count ?? 0,
    color: VERDICT_COLOR[v],
  }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const difficultyData: Slice[] = [1, 2, 3, 4]
    .map((d, i) => ({
      key: String(d),
      name: "★".repeat(d),
      value: stats.solvedByDifficulty.find((x) => x.difficulty === d)?.count ?? 0,
      color: DIFFICULTY_COLOR,
      opacity: DIFFICULTY_OPACITY[i],
    }))
    .filter((d) => d.value > 0);

  const TABS: Record<ChartKind, { label: string; data: Slice[] }> = {
    language: { label: t("Language usage"), data: langData },
    verdict: { label: t("Verdict breakdown"), data: verdictData },
    difficulty: { label: t("Solved by difficulty"), data: difficultyData },
  };
  const active = TABS[kind];

  return (
    <div className="oj-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-200">{active.label}</h3>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(TABS) as ChartKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={k === kind ? "oj-btn-primary px-2.5 py-1 text-xs" : "oj-btn-secondary px-2.5 py-1 text-xs"}
            >
              {TABS[k].label}
            </button>
          ))}
        </div>
      </div>
      {active.data.length === 0 ? (
        <p className="text-sm text-ink-400">{t("No data yet.")}</p>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={180}>
            <PieChart>
              <Pie data={active.data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {active.data.map((d) => (
                  <Cell key={d.key} fill={d.color} fillOpacity={d.opacity ?? 1} stroke={colors.chartStroke} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
            {active.data.map((d) => (
              <li key={d.key} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color, opacity: d.opacity ?? 1 }} />
                <span className="flex-1 truncate text-ink-300">{d.name}</span>
                <span className="font-mono text-ink-500">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
