"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import VerdictBadge from "@/components/VerdictBadge";
import type { ProblemStats, SubmissionResultTab } from "@/lib/types";
import { LANGUAGE_LABEL } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

// recharts is a large charting bundle — deferred the same way ProblemStatsPanel defers it, since
// this only renders once a submission actually comes back AC, not on first paint of the tab.
const DistributionChart = dynamic(() => import("@/components/DistributionChart"), {
  ssr: false,
  loading: () => <div className="h-[140px] animate-pulse rounded bg-ink-900" />,
}) as typeof import("@/components/DistributionChart").default;

/** Content of the submission-result tab (ProblemView) for one verdict. AC gets the LeetCode-style
 * runtime/memory-percentile + distribution-chart + code layout; everything else just shows the
 * badge (CE additionally shows where compilation failed). */
export default function SubmissionResultPanel({ slug, resultTab }: { slug: string; resultTab: SubmissionResultTab }) {
  const t = useT();
  const isAc = resultTab.verdict === "AC";

  const { data } = useQuery({
    queryKey: ["problem-stats-run", slug, resultTab.timeMs, resultTab.memoryKb],
    queryFn: () =>
      apiFetch<ProblemStats>(
        `/problems/${slug}/stats?runTimeMs=${resultTab.timeMs}` +
          (resultTab.memoryKb != null ? `&runMemoryKb=${resultTab.memoryKb}` : ""),
      ),
    enabled: isAc && resultTab.timeMs != null,
  });

  if (resultTab.verdict === "CE") {
    return (
      <div>
        <div className="mb-4">
          <VerdictBadge verdict="CE" />
        </div>
        <p className="mb-2 text-sm text-ink-300">{t("Compile error:")}</p>
        <pre className="oj-card overflow-x-auto p-3 font-mono text-xs text-verdict-ce">{resultTab.compileError}</pre>
      </div>
    );
  }

  if (!isAc) {
    return (
      <div>
        <VerdictBadge verdict={resultTab.verdict} />
      </div>
    );
  }

  const yourRun = data?.yourRun ?? null;

  return (
    <div>
      <div className="mb-4">
        {/* Deliberately its own key, not VERDICT_LABEL's shared "Accepted" (→ "通過" everywhere
            else a verdict badge shows — history, scoreboard, stats) — this big AC-screen heading
            keeps the literal English word in both locales instead. */}
        <p className="font-display text-2xl font-bold text-verdict-ac">{t("Accept")}</p>
        <p className="text-xs text-ink-500">
          {t("Submitted at {time}", { time: new Date(resultTab.createdAt).toLocaleString() })}
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="oj-card p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Runtime")}</p>
          <p className="font-mono text-xl text-ink-50">{resultTab.timeMs} ms</p>
          {yourRun?.beatsTimePct != null && (
            <p className="mt-1 text-xs text-ink-400">{t("Beats {pct}%", { pct: yourRun.beatsTimePct })}</p>
          )}
        </div>
        {resultTab.memoryKb != null && (
          <div className="oj-card p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Memory")}</p>
            <p className="font-mono text-xl text-ink-50">{Math.round(resultTab.memoryKb / 1024)} MB</p>
            {yourRun?.beatsMemoryPct != null && (
              <p className="mt-1 text-xs text-ink-400">{t("Beats {pct}%", { pct: yourRun.beatsMemoryPct })}</p>
            )}
          </div>
        )}
      </div>

      {data && data.timeHistogram.length > 0 && (
        <div className="oj-card mb-4 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Runtime distribution")}</p>
          <DistributionChart
            buckets={data.timeHistogram}
            yourBucketIndex={yourRun?.timeBucketIndex ?? null}
            unit="runtime"
            formatRange={(b) => (b.minMs === b.maxMs ? `${Math.round(b.minMs)} ms` : `${Math.round(b.minMs)}–${Math.round(b.maxMs)} ms`)}
          />
        </div>
      )}

      {data && data.memoryAvailable && data.memoryHistogram && (
        <div className="oj-card mb-4 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Memory distribution")}</p>
          <DistributionChart
            buckets={data.memoryHistogram}
            yourBucketIndex={yourRun?.memoryBucketIndex ?? null}
            unit="memory"
            formatRange={(b) =>
              b.minKb === b.maxKb ? `${Math.round(b.minKb / 1024)} MB` : `${Math.round(b.minKb / 1024)}–${Math.round(b.maxKb / 1024)} MB`
            }
          />
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
          {t("Code")} · {t(LANGUAGE_LABEL[resultTab.languageKey] ?? resultTab.languageKey)}
        </p>
        <pre className="oj-card overflow-x-auto p-3 font-mono text-xs">{resultTab.sourceCode}</pre>
      </div>
    </div>
  );
}
