"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { LANGUAGE_LABEL } from "@/lib/types";
import type { HistogramBucket } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const LANGUAGE_COLOR: Record<string, string> = {
  cpp17: "#5B8DEF",
  c11: "#B98CE0",
  python3: "#6FCF97",
  java17: "#E8A33D",
};

/**
 * LeetCode-style runtime/memory distribution. Clicking a bar only ever reveals aggregate counts
 * (solvers + language breakdown) for that bucket — never anyone's actual submission or source
 * code, matching this site's existing rule that only a submission's own owner (or an admin) can
 * see its code (see submissions.service.canSeeSource).
 */
export default function DistributionChart<T extends HistogramBucket>({
  buckets,
  yourBucketIndex,
  formatRange,
  unit,
}: {
  buckets: T[];
  yourBucketIndex: number | null;
  formatRange: (b: T) => string;
  unit: string;
}) {
  const t = useT();
  const [selected, setSelected] = useState<number | null>(yourBucketIndex);

  const data = buckets.map((b, i) => ({ index: i, count: b.count, label: formatRange(b) }));
  const selectedBucket = selected !== null ? buckets[selected] : null;
  const selectedLanguages = selectedBucket
    ? Object.entries(selectedBucket.languageCounts).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ left: 8, right: 8 }}>
          <XAxis dataKey="index" tick={false} axisLine={{ stroke: "#2a3441" }} />
          <YAxis tick={{ fill: "#6b7a8b", fontSize: 11 }} axisLine={{ stroke: "#2a3441" }} allowDecimals={false} width={28} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} cursor="pointer" onClick={(_, i) => setSelected(i)}>
            {data.map((d) => (
              <Cell
                key={d.index}
                fill={d.index === yourBucketIndex ? "#e8a33d" : d.index === selected ? "#5B8DEF" : "#3a4653"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {selectedBucket && (
        <div className="mt-2 rounded border border-ink-700 bg-ink-800/40 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-ink-200">{formatRange(selectedBucket)}</span>
            <span className="text-ink-400">
              {selectedBucket.count === 1 ? t("{n} solver", { n: selectedBucket.count }) : t("{n} solvers", { n: selectedBucket.count })}
              {selected === yourBucketIndex && <span className="ml-1.5 text-brand">— {t("you're here")}</span>}
            </span>
          </div>
          {selectedLanguages.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {selectedLanguages.map(([lang, count]) => (
                <li key={lang} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: LANGUAGE_COLOR[lang] ?? "#6b7a8b" }} />
                  <span className="text-ink-300">{t(LANGUAGE_LABEL[lang] ?? lang)}</span>
                  <span className="font-mono text-ink-500">{count}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[11px] text-ink-500">
            {t("Aggregate only — {unit} bucket counts, not anyone's actual code.", { unit: t(unit) })}
          </p>
        </div>
      )}
    </div>
  );
}
