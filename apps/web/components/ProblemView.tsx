"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SubmissionPanel from "@/components/SubmissionPanel";
import SubmissionHistory from "@/components/SubmissionHistory";
import DiscussionPanel from "@/components/DiscussionPanel";
import ProblemStatsPanel from "@/components/ProblemStatsPanel";
import ProblemNotePanel from "@/components/ProblemNotePanel";
import InfoTooltip from "@/components/InfoTooltip";
import CopyButton from "@/components/CopyButton";
import LockIcon from "@/components/LockIcon";
import { ArchiveIcon } from "@/components/icons";
import SplitPane from "@/components/SplitPane";
import ProblemPrevNext from "@/components/ProblemPrevNext";
import type { ProblemDetail } from "@/lib/types";
import { useExamTimerStore } from "@/store/examTimer";
import { stripProblemNumber } from "@/lib/problemTitle";
import { useT } from "@/lib/i18n/LocaleContext";

const DIFFICULTY_EXPLANATION =
  "Estimated from official ratings where available, otherwise from worldwide solve statistics — for reference only.";

type TabKey = "statement" | "history" | "discussion" | "stats" | "notes";
const TAB_ORDER: TabKey[] = ["statement", "history", "discussion", "stats", "notes"];
const TAB_LABEL: Record<TabKey, string> = {
  statement: "Statement",
  history: "My submissions",
  discussion: "Discussion",
  stats: "Stats",
  notes: "Notes",
};

export default function ProblemView({
  problem,
  contestId,
  statementNode,
  inputSpecNode,
  outputSpecNode,
  fullHeight = false,
  prevNextNode,
  hideDifficulty = false,
}: {
  problem: ProblemDetail;
  contestId?: string;
  // Rendered server-side by the parent Server Component (app/problems/[slug]/page.tsx) instead of
  // calling StatementRenderer from here: this component is "use client", and StatementRenderer
  // pulls in react-markdown/remark/rehype/katex (~99KB gzip) — importing it directly here would
  // ship that whole chunk to the browser on every problem-page load. Passing already-rendered JSX
  // down as props keeps it server-only.
  statementNode: React.ReactNode;
  inputSpecNode: React.ReactNode;
  outputSpecNode: React.ReactNode;
  /** Overrides the default <ProblemPrevNext> (which walks the URL-driven problems/collection list
   * — see that component's own comment). ContestDetailClient passes its own bar here instead: a
   * contest is browsed via local React state, not the URL, and "prev/next" should walk *this
   * contest's* problem order, not whatever list the user happened to arrive from. */
  prevNextNode?: React.ReactNode;
  /** Standalone problem page only — never passed by the contest-embedded usage
   * (ContestDetailClient), which must keep its existing normal-document-flow behavior unchanged.
   * When true, the prev/next bar stays fixed while the rest of the left pane scrolls on its own,
   * and the right pane fills the viewport with an independently-resizable editor/test split. */
  fullHeight?: boolean;
  /** Set by ContestDetailClient once a virtual exam has been started — a real CPE sitting never
   * shows difficulty upfront, so a mock one shouldn't either once you're actually taking it. */
  hideDifficulty?: boolean;
}) {
  const t = useT();
  const [tab, setTab] = useState<TabKey>("statement");
  const examActive = useExamTimerStore((s) => s.active);
  // endsAt is a plain epoch-ms number in the store — a stable, idempotent selector. Computing
  // "remaining" from it requires the current time, which must live in local state instead of
  // being read (via Date.now()) inside the selector itself: a zustand/useSyncExternalStore
  // selector must return the same value for the same store state on every call, and one that
  // doesn't (like calling remainingMs() here used to) makes React retry the render forever and
  // crash with "Maximum update depth exceeded" — exactly what happened opening any problem
  // during a running exam.
  const endsAt = useExamTimerStore((s) => s.endsAt);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!examActive) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [examActive]);
  const remaining = endsAt ? Math.max(0, endsAt - now) : 0;
  const locked = examActive && remaining <= 0;

  const leftHeader = prevNextNode ?? <ProblemPrevNext slug={problem.slug} />;

  const leftBody = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-ink-50">
          {problem.uvaId != null && (
            <span className="mr-2 align-middle font-mono text-lg font-normal text-ink-500">#{problem.uvaId}</span>
          )}
          {problem.sourceUrl ? (
            <a href={problem.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
              {stripProblemNumber(problem.title, problem.uvaId)}
            </a>
          ) : (
            stripProblemNumber(problem.title, problem.uvaId)
          )}
        </h1>
        {!hideDifficulty && (
          <span className="flex items-center gap-1.5 font-mono text-base text-brand">
            {"★".repeat(problem.difficulty)}
            <InfoTooltip text={t(DIFFICULTY_EXPLANATION)} />
          </span>
        )}
      </div>
      <div
        role="tablist"
        aria-label={t("Problem sections")}
        className="mb-4 flex gap-4 border-b border-ink-800 text-sm"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const i = TAB_ORDER.indexOf(tab);
          const next = e.key === "ArrowRight" ? (i + 1) % TAB_ORDER.length : (i - 1 + TAB_ORDER.length) % TAB_ORDER.length;
          setTab(TAB_ORDER[next]);
          document.getElementById(`problem-tab-${TAB_ORDER[next]}`)?.focus();
        }}
      >
        {TAB_ORDER.map((key) => (
          <button
            key={key}
            id={`problem-tab-${key}`}
            role="tab"
            aria-selected={tab === key}
            aria-controls={`problem-tabpanel-${key}`}
            tabIndex={tab === key ? 0 : -1}
            onClick={() => setTab(key)}
            className={`border-b-2 px-1 py-2 ${tab === key ? "border-brand text-brand" : "border-transparent text-ink-400"}`}
          >
            {t(TAB_LABEL[key])}
          </button>
        ))}
      </div>

      {tab === "statement" && (
        <div id="problem-tabpanel-statement" role="tabpanel" aria-labelledby="problem-tab-statement">
          <div className="mb-4 flex gap-4 font-mono text-xs text-ink-400">
            <span>{t("Time limit: {ms} ms", { ms: problem.timeLimitMs })}</span>
            <span>{t("Memory limit: {mb} MB", { mb: Math.round(problem.memoryLimitKb / 1024) })}</span>
          </div>
          {statementNode}
          {inputSpecNode && (
            <>
              <h3 className="mb-2 mt-5 font-display text-lg font-semibold text-ink-50">{t("Input")}</h3>
              {inputSpecNode}
            </>
          )}
          {outputSpecNode && (
            <>
              <h3 className="mb-2 mt-5 font-display text-lg font-semibold text-ink-50">{t("Output")}</h3>
              {outputSpecNode}
            </>
          )}
          {problem.samples.map((s) => (
            <div key={s.ord} className="mt-4 grid gap-2 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-400">{t("Sample input {n}", { n: s.ord })}</p>
                  <CopyButton text={s.input} />
                </div>
                <pre className="oj-card overflow-x-auto p-2 font-mono text-xs">{s.input}</pre>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-400">{t("Sample output {n}", { n: s.ord })}</p>
                  <CopyButton text={s.output} />
                </div>
                <pre className="oj-card overflow-x-auto p-2 font-mono text-xs">{s.output}</pre>
              </div>
            </div>
          ))}

          <div className="mt-6 oj-card p-4">
            {problem.cpeAppearances !== null ? (
              <p className="flex items-start gap-1.5 text-sm text-ink-200">
                <ArchiveIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                {problem.cpeAppearances > 0 ? (
                  <>
                    {t("Appeared in")} <span className="font-semibold text-brand">{problem.cpeAppearances}</span>{" "}
                    {t("past CPE exams.")}
                  </>
                ) : (
                  t("Hasn't appeared in a past CPE exam yet.")
                )}
              </p>
            ) : (
              <p className="flex items-start gap-1.5 text-sm text-ink-400">
                <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="text-ink-300">{t("Pro feature:")}</span> {t("see how many times this problem has appeared in past CPE exams —")}{" "}
                  <Link href="/upgrade" className="text-brand hover:underline">
                    {t("upgrade to unlock")}
                  </Link>
                  .
                </span>
              </p>
            )}
          </div>
        </div>
      )}
      {tab === "history" && (
        <div id="problem-tabpanel-history" role="tabpanel" aria-labelledby="problem-tab-history">
          <SubmissionHistory problemId={problem.id} />
        </div>
      )}
      {tab === "discussion" && (
        <div id="problem-tabpanel-discussion" role="tabpanel" aria-labelledby="problem-tab-discussion">
          <DiscussionPanel problemId={problem.id} />
        </div>
      )}
      {tab === "stats" && (
        <div id="problem-tabpanel-stats" role="tabpanel" aria-labelledby="problem-tab-stats">
          <ProblemStatsPanel slug={problem.slug} />
        </div>
      )}
      {tab === "notes" && (
        <div id="problem-tabpanel-notes" role="tabpanel" aria-labelledby="problem-tab-notes">
          <ProblemNotePanel slug={problem.slug} />
        </div>
      )}
    </div>
  );

  const left = fullHeight ? (
    <div className="flex h-full flex-col">
      <div className="shrink-0 pr-4">{leftHeader}</div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-4">{leftBody}</div>
    </div>
  ) : (
    <div>
      {leftHeader}
      {leftBody}
    </div>
  );

  const right = (
    <SubmissionPanel
      problemId={problem.id}
      slug={problem.slug}
      contestId={contestId}
      locked={locked}
      judgeable={problem.uvaId != null}
      samples={problem.samples}
      fullHeight={fullHeight}
    />
  );

  return <SplitPane left={left} right={right} fullHeight={fullHeight} />;
}
