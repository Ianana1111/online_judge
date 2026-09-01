"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  AlertOctagonIcon,
  AlertTriangleIcon,
  AlignLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuIcon,
  MaximizeIcon,
  SlashCircleIcon,
  TerminalIcon,
  XCircleIcon,
} from "@/components/icons";
import type { ProblemStats, SubmissionResultTab, Verdict } from "@/lib/types";
import { LANGUAGE_LABEL } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

// recharts is a large charting bundle — deferred the same way ProblemStatsPanel defers it, since
// this only renders once a submission actually comes back AC, not on first paint of the tab.
const DistributionChart = dynamic(() => import("@/components/DistributionChart"), {
  ssr: false,
  loading: () => <div className="h-[140px] animate-pulse rounded bg-ink-900" />,
}) as typeof import("@/components/DistributionChart").default;

// A full-word heading + a dedicated line-art glyph per verdict — this is the "how it's presented"
// layer for this panel. Deliberately separate from VerdictBadge's short-code labels (VERDICT_LABEL,
// e.g. "WA"): those stay as the terse competitive-programming abbreviation everywhere else in the
// app (the tab header above this panel, submission history, ...), but a whole panel built around
// nothing but a 2-3 letter code is what read as bare/unfinished here.
const VERDICT_TITLE: Record<Verdict, string> = {
  PENDING: "Pending",
  JUDGING: "Judging",
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
  RE: "Runtime Error",
  RF: "Restricted Function",
  CE: "Compile Error",
  PE: "Presentation Error",
  OLE: "Output Limit Exceeded",
  SE: "System Error",
};

const VERDICT_ICON: Record<Verdict, typeof CheckCircleIcon> = {
  PENDING: ClockIcon,
  JUDGING: ClockIcon,
  AC: CheckCircleIcon,
  WA: XCircleIcon,
  TLE: ClockIcon,
  MLE: CpuIcon,
  RE: AlertTriangleIcon,
  RF: SlashCircleIcon,
  CE: TerminalIcon,
  PE: AlignLeftIcon,
  OLE: MaximizeIcon,
  SE: AlertOctagonIcon,
};

// Written out as full literal classes (not `text-verdict-${verdict.toLowerCase()}`) so Tailwind's
// class scanner actually picks them up — same reasoning as VerdictBadge's VERDICT_STYLE map.
const VERDICT_TEXT_COLOR: Record<Verdict, string> = {
  PENDING: "text-verdict-pending",
  JUDGING: "text-verdict-pending",
  AC: "text-verdict-ac",
  WA: "text-verdict-wa",
  TLE: "text-verdict-tle",
  MLE: "text-verdict-mle",
  RE: "text-verdict-re",
  RF: "text-verdict-rf",
  CE: "text-verdict-ce",
  PE: "text-verdict-pe",
  OLE: "text-verdict-ole",
  SE: "text-verdict-se",
};

function StatChip({ icon: Icon, children }: { icon: typeof CheckCircleIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-ink-700 bg-ink-900 px-2.5 py-1 font-mono text-xs text-ink-300">
      <Icon className="h-3.5 w-3.5 text-ink-500" />
      {children}
    </span>
  );
}

/** Content of the submission-result tab (ProblemView) for one verdict. Every verdict gets the same
 * icon + spelled-out heading + timestamp treatment; AC additionally gets the LeetCode-style
 * runtime/memory-percentile + distribution-chart + code layout, CE gets a styled compiler-output
 * block, and everything else gets a short plain-language explanation of what the verdict means
 * (plus whatever of time/memory this run actually has — there is no output/diff data to show for
 * WA and friends, so this deliberately doesn't pretend otherwise). */
export default function SubmissionResultPanel({
  slug,
  resultTab,
  timeLimitMs,
  memoryLimitKb,
}: {
  slug: string;
  resultTab: SubmissionResultTab;
  timeLimitMs?: number;
  memoryLimitKb?: number;
}) {
  const t = useT();
  const { verdict } = resultTab;
  const isAc = verdict === "AC";
  const isCe = verdict === "CE";

  const { data } = useQuery({
    queryKey: ["problem-stats-run", slug, resultTab.timeMs, resultTab.memoryKb],
    queryFn: () =>
      apiFetch<ProblemStats>(
        `/problems/${slug}/stats?runTimeMs=${resultTab.timeMs}` +
          (resultTab.memoryKb != null ? `&runMemoryKb=${resultTab.memoryKb}` : ""),
      ),
    enabled: isAc && resultTab.timeMs != null,
  });

  const Icon = VERDICT_ICON[verdict];
  const colorClass = VERDICT_TEXT_COLOR[verdict];
  const header = (
    <div className="mb-4 flex items-start gap-3">
      <Icon className={`mt-0.5 h-8 w-8 shrink-0 ${colorClass}`} />
      <div>
        <p className={`font-display text-2xl font-bold ${colorClass}`}>{t(VERDICT_TITLE[verdict])}</p>
        <p className="text-xs text-ink-500">
          {t("Submitted at {time}", { time: new Date(resultTab.createdAt).toLocaleString() })}
        </p>
      </div>
    </div>
  );

  if (isCe) {
    return (
      <div>
        {header}
        <p className="mb-3 text-sm text-ink-300">{t("Your code didn't compile — fix the errors below and try again.")}</p>
        <div className="oj-card overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-ink-800 bg-ink-800/60 px-3 py-1.5 text-xs font-medium text-ink-400">
            <TerminalIcon className="h-3.5 w-3.5" />
            {t("Compiler output")}
          </div>
          <pre className="overflow-x-auto p-3 font-mono text-xs text-verdict-ce">{resultTab.compileError}</pre>
        </div>
      </div>
    );
  }

  if (!isAc) {
    const chips: ReactNode[] = [];
    if (resultTab.timeMs != null) {
      chips.push(
        <StatChip key="time" icon={ClockIcon}>
          {resultTab.timeMs} ms
        </StatChip>,
      );
    }
    if (resultTab.memoryKb != null) {
      chips.push(
        <StatChip key="mem" icon={CpuIcon}>
          {Math.round(resultTab.memoryKb / 1024)} MB
        </StatChip>,
      );
    }

    return (
      <div>
        {header}
        {chips.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{chips}</div>}
        <div className="oj-card p-4">
          <p className="text-sm leading-relaxed text-ink-200">{verdictHint(t, verdict, timeLimitMs, memoryLimitKb)}</p>
          {verdictTip(t, verdict) && <p className="mt-2.5 text-xs text-ink-500">{verdictTip(t, verdict)}</p>}
        </div>
      </div>
    );
  }

  const yourRun = data?.yourRun ?? null;

  return (
    <div>
      {header}

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

function verdictHint(t: ReturnType<typeof useT>, verdict: Verdict, timeLimitMs?: number, memoryLimitKb?: number): string {
  switch (verdict) {
    case "WA":
      return t("Your program ran to completion, but its output didn't match the expected answer on at least one test case.");
    case "TLE":
      return timeLimitMs != null
        ? t("Your program was still running when it hit this problem's {ms} ms time limit.", { ms: timeLimitMs })
        : t("Your program took too long to finish and hit this problem's time limit.");
    case "MLE":
      return memoryLimitKb != null
        ? t("Your program used more memory than this problem's {mb} MB limit allows.", { mb: Math.round(memoryLimitKb / 1024) })
        : t("Your program used more memory than this problem allows.");
    case "RE":
      return t(
        "Your program crashed while running — common causes include out-of-bounds array access, division by zero, or dereferencing a null pointer.",
      );
    case "RF":
      return t("Your submission used a function or feature that isn't allowed for this problem.");
    case "PE":
      return t("Your output was almost right, but its formatting — spacing or line breaks — didn't exactly match what was expected.");
    case "OLE":
      return t("Your program printed far more output than expected — check for an infinite loop or unbounded printing.");
    case "SE":
      return t("Something went wrong on our end while judging this submission — this isn't an issue with your code. Try submitting again.");
    default:
      return "";
  }
}

function verdictTip(t: ReturnType<typeof useT>, verdict: Verdict): string | null {
  if (verdict === "WA") {
    return t("Want to find out where it went wrong? Use the Run panel to test your code against your own input and compare the output yourself.");
  }
  if (verdict === "RE") {
    return t("Use the Run panel with your own input to try to reproduce the crash and narrow down where it happens.");
  }
  return null;
}
