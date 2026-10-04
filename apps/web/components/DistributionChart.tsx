"use client";

import { useState } from "react";
import { LANGUAGE_LABEL, type HistogramBucket } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

/** One bar per aggregate bucket. Native buttons keep inspection usable by keyboard and touch. */
export default function DistributionChart<T extends HistogramBucket>({
  buckets, yourBucketIndex, formatRange, unit, yourValueLabel, bounds,
}: {
  buckets: T[];
  yourBucketIndex: number | null;
  formatRange: (b: T) => string;
  unit: string;
  yourValueLabel?: string;
  bounds?: [string, string];
}) {
  const t = useT();
  // Reset inspection when the dataset changes, even if the new data has the same bucket count.
  const signature = JSON.stringify([buckets, yourBucketIndex]);
  const [inspection, setInspection] = useState<{ signature: string; index: number } | null>(null);
  const personal = yourBucketIndex !== null && buckets[yourBucketIndex] ? yourBucketIndex : null;
  const peak = Math.max(1, ...buckets.map(b => b.count));
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const selected = inspection?.signature === signature ? inspection.index : personal ?? buckets.findIndex(b => b.count === peak);
  const selectedBucket = buckets[selected];
  if (!buckets.length) return null;

  return (
    <div className="min-w-0" role="group" aria-label={t(unit === "memory" ? "Memory distribution" : "Runtime distribution")}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-ink-400">{t("Solver count")}</span>
        {personal !== null && <span className="inline-flex items-center gap-1.5 font-medium text-brand">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand" />
          {t("Your position")}{yourValueLabel && <span className="font-mono">· {yourValueLabel}</span>}
        </span>}
      </div>
      <div className="relative pl-7 pt-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-8 text-[10px] tabular-nums text-ink-400">
          {[peak, ...(peak > 1 ? [Math.floor(peak / 2)] : []), 0].map(n => (
            <div key={n} className="absolute flex w-full -translate-y-1/2 items-center gap-2" style={{ top: `${(1 - n / peak) * 100}%` }}><span className="w-5 text-right">{n}</span><span className="flex-1 border-t border-ink-700/60" /></div>
          ))}
        </div>
        <div className="relative grid h-36 gap-1.5" style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))` }}>
          {buckets.map((bucket, i) => (
            <button key={i} type="button" aria-pressed={selected === i}
              aria-label={`${formatRange(bucket)} · ${t("{n} solvers", { n: bucket.count })}${i === personal ? ` · ${t("Your position")}` : ""}`}
              onClick={() => setInspection({ signature, index: i })}
              onFocus={() => setInspection({ signature, index: i })}
              onKeyDown={event => {
                const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                if (!offset) return;
                event.preventDefault();
                const siblings = event.currentTarget.parentElement?.children;
                (siblings?.[(i + offset + buckets.length) % buckets.length] as HTMLElement | undefined)?.focus();
              }}
              className="group relative flex min-w-0 items-end justify-center rounded-t-md outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900">
              {i === personal && <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-7 bottom-0 flex flex-col items-center">
                <span className="z-10 whitespace-nowrap rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-onbrand">{t("You")}</span>
                <span className="w-px flex-1 border-l border-dashed border-brand/60" />
              </span>}
              <span aria-hidden="true" className={`relative w-full max-w-20 rounded-t-md border transition-colors motion-reduce:transition-none ${i === personal ? "border-brand bg-brand" : selected === i ? "border-ink-300 bg-ink-400" : "border-ink-600 bg-ink-600/75 group-hover:bg-ink-500"}`}
                style={{ height: bucket.count ? `${Math.max(3, bucket.count / peak * 100)}%` : "2px" }} />
            </button>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="ml-7 mt-2 flex justify-between gap-2 font-mono text-[10px] text-ink-400">
        <span>{bounds?.[0] ?? formatRange(buckets[0])}</span>
        {buckets.length > 1 && <span className="text-right">{bounds?.[1] ?? formatRange(buckets[buckets.length - 1])}</span>}
      </div>
      <p className="mt-3 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[11px] text-ink-400"><span>{t(unit === "memory" ? "← Less memory" : "← Faster runtime")}</span><span>{t("Select a bar to explore")}</span></p>
      {selectedBucket && <div className="mt-3 rounded-lg border border-ink-700/70 bg-ink-950/40 px-3 py-2.5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          <span className="font-mono font-medium text-ink-100">{formatRange(selectedBucket)}</span>
          <span className="tabular-nums text-ink-300">{t("{n} solvers", { n: selectedBucket.count })} <span className="text-ink-400">· {total ? Math.round(selectedBucket.count / total * 1000) / 10 : 0}%</span></span>
        </div>
        {Object.keys(selectedBucket.languageCounts).length > 0 && <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-400">
          {Object.entries(selectedBucket.languageCounts).sort(([, a], [, b]) => b - a).map(([language, count]) => <li key={language}>{LANGUAGE_LABEL[language] ?? language} <span className="font-mono text-ink-200">{count}</span></li>)}
        </ul>}
      </div>}
    </div>
  );
}
