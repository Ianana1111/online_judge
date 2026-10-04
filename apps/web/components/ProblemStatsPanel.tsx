"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import DistributionChart from "@/components/DistributionChart";
import { ClockIcon, CpuIcon } from "@/components/icons";
import { LANGUAGE_LABEL, type ProblemStats } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";

const number = (n: number) => String(Math.round(n * 100) / 100);
const memory = (kb: number) => kb < 1024 ? `${number(kb)} KB` : `${number(kb / 1024)} MB`;

export default function ProblemStatsPanel({ slug }: { slug: string }) {
  const t = useT();
  const { user, status } = useAuthStore();
  const [language, setLanguage] = useState("");
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["problem-stats", slug, user?.id ?? null, language],
    queryFn: () => apiFetch<ProblemStats>(`/problems/${slug}/stats${language ? `?language=${language}` : ""}`),
    enabled: status === "ready",
  });
  const best = data?.yourBest;
  const sampleCount = data?.solvedCount ?? 0;

  return (
    <div className="space-y-4 pb-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink-50">{t("Your solution, in context")}</h2>
          <p className="mt-1 text-xs text-ink-400">{t("One solver, one fastest accepted submission.")}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-400">
          {t("Compare")}
          <select value={language} onChange={event => setLanguage(event.target.value)} aria-label={t("Comparison language")}
            className="min-h-9 rounded-lg border border-ink-700 bg-ink-900 py-1.5 pl-2.5 pr-7 text-xs text-ink-100 outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <option value="">{t("All languages")}</option>
            {Object.entries(LANGUAGE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
      </div>
      {isLoading || status !== "ready" ? <div role="status" aria-label={t("Loading statistics")} className="space-y-4"><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-80 w-full rounded-xl" /></div>
        : isError ? <div role="alert" className="oj-card rounded-xl p-6 text-center">
          <p className="text-sm text-ink-300">{t("Statistics could not be loaded.")}</p>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="oj-btn-ghost mt-3 px-4 py-2 text-xs">{t("Try again")}</button>
        </div>
        : !data || !sampleCount ? <div className="oj-card flex min-h-52 flex-col items-center justify-center rounded-xl p-6 text-center">
          <ClockIcon className="mb-3 h-7 w-7 text-ink-400" />
          <p className="font-medium text-ink-100">{t("The first benchmark is yours to set")}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-400">{t(language ? "No accepted submissions in this language yet. Try another language or set the first record." : "Nobody's solved this one yet — be the first, and these stats fill in.")}</p>
        </div> : <>
          {best ? <div className="overflow-hidden rounded-xl border border-brand/30 bg-gradient-to-br from-brand/[0.08] to-ink-900">
            <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
              <div>
                <p className="text-xs font-medium text-ink-300">{t("Your fastest AC")}</p>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-ink-50">{number(best.timeMs)}<span className="ml-1.5 text-sm font-normal text-ink-400">ms</span></p>
                {best.languageKey && <span className="mt-2 inline-block rounded-md border border-ink-700 bg-ink-900 px-2 py-0.5 text-[11px] text-ink-300">{LANGUAGE_LABEL[best.languageKey] ?? best.languageKey}</span>}
              </div>
              <div className="border-l border-brand/20 pl-4 sm:pl-5">
                <p className="text-xs font-medium text-ink-300">{t("Runtime rank")}{(best.timeTies ?? 0) > 1 && <span className="ml-1 text-ink-400">· {t("Tied")}</span>}</p>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-brand">{best.timeRank ? `#${best.timeRank}` : "—"}<span className="ml-1.5 text-sm font-normal text-ink-400">/ {sampleCount}</span></p>
                <p className="mt-2 text-xs leading-relaxed text-ink-300">{sampleCount > 1 && best.beatsPct != null ? t("Faster than {pct}% of solvers", { pct: best.beatsPct }) : t("More comparisons as solvers join")}</p>
              </div>
            </div>
            <div className="border-t border-brand/15 px-4 py-2.5 text-[11px] text-ink-400 sm:px-5">{t("Gold marks your position in each distribution.")}</div>
          </div> : <div className="rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm leading-relaxed text-ink-300">{t(user ? "Get an AC in this comparison group to see your position." : "Log in and get an AC to see your position.")}</div>}

          <section className="oj-card rounded-xl p-4 sm:p-5" aria-label={t("Runtime analysis")}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-100"><ClockIcon className="h-4 w-4 text-ink-400" />{t("Runtime")}</h3>
              <span className="rounded-md bg-ink-800 px-2 py-1 text-[11px] text-ink-300">{t("{n} solvers", { n: sampleCount })}</span>
            </div>
            <DistributionChart buckets={data.timeHistogram} yourBucketIndex={data.yourTimeBucketIndex} unit="runtime"
              yourValueLabel={best ? `${number(best.timeMs)} ms` : undefined}
              bounds={data.time ? [`${number(data.time.minMs)} ms`, `${number(data.time.maxMs)} ms`] : undefined}
              formatRange={b => b.minMs === b.maxMs ? `${number(b.minMs)} ms` : `${number(b.minMs)}–${number(b.maxMs)} ms`} />
            {data.time && <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-700/70 pt-3 text-center">
              {[["fastest", data.time.minMs], ["median", data.time.medianMs], ["slowest", data.time.maxMs]].map(([label, value]) => <div key={label}><p className="text-[11px] text-ink-400">{t(String(label))}</p><p className="mt-1 font-mono text-xs text-ink-200">{number(Number(value))} ms</p></div>)}
            </div>}
          </section>

          <section className="oj-card rounded-xl p-4 sm:p-5" aria-label={t("Memory analysis")}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-100"><CpuIcon className="h-4 w-4 text-ink-400" />{t("Memory")}</h3>
              {best?.memoryKb != null && <span className="font-mono text-sm font-medium text-brand">{memory(best.memoryKb)}</span>}
            </div>
            <p className="mb-5 text-[11px] leading-relaxed text-ink-400">{t("Memory from each solver's fastest AC, not their lowest-memory submission.")}</p>
            {data.memoryAvailable && data.memoryHistogram?.length ? <>
              <DistributionChart buckets={data.memoryHistogram} yourBucketIndex={data.yourMemoryBucketIndex} unit="memory"
                yourValueLabel={best?.memoryKb != null ? memory(best.memoryKb) : undefined}
                bounds={data.memory ? [memory(data.memory.minKb), memory(data.memory.maxKb)] : undefined}
                formatRange={b => b.minKb === b.maxKb ? memory(b.minKb) : `${memory(b.minKb)}–${memory(b.maxKb)}`} />
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-ink-400">
                <span>{t("{n} memory readings", { n: data.memory?.solverCount ?? data.memoryHistogram.reduce((sum, b) => sum + b.count, 0) })}</span>
                {best?.beatsMemoryPct != null && (data.memory?.solverCount ?? 0) > 1 && <span className="text-ink-300">{t("Less memory than {pct}% of solvers", { pct: best.beatsMemoryPct })}</span>}
                {best && best.memoryKb == null && <span>{t("Your memory reading is unavailable.")}</span>}
              </div>
            </> : <p className="rounded-lg bg-ink-950/50 px-4 py-5 text-center text-xs text-ink-400">{t("No memory readings available yet.")}</p>}
          </section>
          <p className="px-1 text-[11px] leading-relaxed text-ink-400">{t("Ties share a rank and do not count as outperformed. Runtime can vary between runs; compare the same language for a more useful benchmark.")}</p>
        </>}
    </div>
  );
}
