"use client";

import { serverNow } from "@/lib/serverClock";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SubmissionPanel from "@/components/SubmissionPanel";
import SubmissionResultPanel from "@/components/SubmissionResultPanel";
import SubmissionHistory from "@/components/SubmissionHistory";
import DiscussionPanel from "@/components/DiscussionPanel";
import ProblemStatsPanel from "@/components/ProblemStatsPanel";
import ProblemNotePanel from "@/components/ProblemNotePanel";
import CopyButton from "@/components/CopyButton";
import LockIcon from "@/components/LockIcon";
import VerdictBadge from "@/components/VerdictBadge";
import { ArchiveIcon } from "@/components/icons";
import SplitPane from "@/components/SplitPane";
import { Skeleton } from "@/components/Skeleton";
import { WorkspaceLogo, WorkspaceAccountControls } from "@/components/WorkspaceChrome";
import ProblemPrevNext from "@/components/ProblemPrevNext";
import type { ProblemDetail, SubmissionResultTab } from "@/lib/types";
import { useExamTimerStore } from "@/store/examTimer";
import { stripProblemNumber } from "@/lib/problemTitle";
import { useT } from "@/lib/i18n/LocaleContext";
import { useIsDesktop } from "@/lib/useIsDesktop";

// Keep first-load suspense inside this tab so it cannot hide/dispose the editor.
const OfficialEditorialPanel = dynamic(() => import("@/components/OfficialEditorialPanel"), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

type TabKey = "statement" | "history" | "editorial" | "discussion" | "stats" | "notes" | "result";
const TAB_ORDER: TabKey[] = ["statement", "history", "editorial", "discussion", "stats", "notes"];
const TAB_LABEL: Record<TabKey, string> = {
  statement: "Statement",
  history: "My submissions",
  editorial: "Official editorial",
  discussion: "Discussion",
  stats: "Stats",
  notes: "Notes",
  result: "", // never looked up — the result tab's own label is its verdict, not a fixed string.
};

export default function ProblemView({
  problem,
  contestId,
  contestParticipantId,
  statementNode,
  inputSpecNode,
  outputSpecNode,
  fullHeight: fillViewport = false,
  prevNextNode,
  hideDifficulty = false,
  attemptNumber,
}: {
  problem: ProblemDetail;
  contestId?: string;
  contestParticipantId?: string;
  /** Set by ContestDetailClient to the current attempt's number — namespaces the code draft (see
   * SubmissionPanel's storageKey) so a fresh re-attempt never inherits code left over from a
   * previous attempt (or from standalone practice on the same problem outside any contest), which
   * would otherwise let someone instantly re-submit an already-known-correct answer instead of
   * actually re-solving it. */
  attemptNumber?: number;
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
  const isDesktop = useIsDesktop();
  // Stacked mobile panes need normal document flow and the editor's explicit height.
  const fullHeight = fillViewport && isDesktop;
  const [actionsContainer, setActionsContainer] = useState<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<TabKey>("statement");
  const [resultTab, setResultTab] = useState<SubmissionResultTab | null>(null);
  // Standalone problem pages are desktop workspaces with their own pane scrollers. Lock both
  // document roots so a wheel event over the outer gutters cannot move the whole page; the CSS
  // flex layout also accounts for banners that appear above the navbar after hydration.
  useEffect(() => {
    if (!fillViewport) return;
    document.documentElement.classList.add("problem-workspace-active");
    document.body.classList.add("problem-workspace-active");
    return () => {
      document.documentElement.classList.remove("problem-workspace-active");
      document.body.classList.remove("problem-workspace-active");
    };
  }, [fillViewport]);
  const tabOrder: TabKey[] = resultTab ? [...TAB_ORDER, "result"] : TAB_ORDER;
  function closeResultTab(e: React.MouseEvent) {
    e.stopPropagation();
    setResultTab(null);
    setTab((cur) => (cur === "result" ? "statement" : cur));
  }
  const examActive = useExamTimerStore((s) => s.active);
  // endsAt is a plain epoch-ms number in the store — a stable, idempotent selector. Computing
  // "remaining" from it requires the current time, which must live in local state instead of
  // being read (via serverNow()) inside the selector itself: a zustand/useSyncExternalStore
  // selector must return the same value for the same store state on every call, and one that
  // doesn't (like calling remainingMs() here used to) makes React retry the render forever and
  // crash with "Maximum update depth exceeded" — exactly what happened opening any problem
  // during a running exam.
  const endsAt = useExamTimerStore((s) => s.endsAt);
  const [now, setNow] = useState(() => serverNow());
  useEffect(() => {
    if (!examActive) return;
    const interval = setInterval(() => setNow(serverNow()), 1000);
    return () => clearInterval(interval);
  }, [examActive]);
  const remaining = endsAt ? Math.max(0, endsAt - now) : 0;
  const locked = examActive && remaining <= 0;

  const leftHeader = prevNextNode ?? <ProblemPrevNext slug={problem.slug} compact={!contestId} />;

  const problemTabs = (
      <div
        role="tablist"
        aria-label={t("Problem sections")}
        className="flex shrink-0 gap-4 overflow-x-auto border-b border-ink-700 bg-ink-800/35 px-4 text-sm sm:px-5 [&>button]:shrink-0 [&>button]:whitespace-nowrap"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const i = tabOrder.indexOf(tab);
          const next = e.key === "ArrowRight" ? (i + 1) % tabOrder.length : (i - 1 + tabOrder.length) % tabOrder.length;
          setTab(tabOrder[next]);
          document.getElementById(`problem-tab-${tabOrder[next]}`)?.focus();
        }}
      >
        {tabOrder.map((key) =>
          key === "result" && resultTab ? (
            <button
              key={key}
              id={`problem-tab-${key}`}
              role="tab"
              aria-selected={tab === key}
              aria-controls={`problem-tabpanel-${key}`}
              tabIndex={tab === key ? 0 : -1}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 border-b-2 px-1 py-2 ${tab === key ? "border-brand text-brand" : "border-transparent text-ink-400"}`}
            >
              <VerdictBadge verdict={resultTab.verdict} size="sm" />
              <span
                role="button"
                aria-label={t("Close result")}
                tabIndex={0}
                onClick={closeResultTab}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") closeResultTab(e as unknown as React.MouseEvent);
                }}
                className="rounded px-1 text-ink-500 hover:bg-ink-800 hover:text-ink-200"
              >
                ×
              </span>
            </button>
          ) : (
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
          ),
        )}
      </div>
  );

  const leftBody = (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <h1 className="min-w-0 font-statement text-[27px] leading-tight font-bold tracking-normal text-ink-50">
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
          <span className="shrink-0 pt-1 font-mono text-sm text-brand">{"★".repeat(problem.difficulty)}</span>
        )}
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
              <h3 className="mb-2 mt-5 font-statement text-lg font-semibold tracking-normal text-ink-50">{t("Input")}</h3>
              {inputSpecNode}
            </>
          )}
          {outputSpecNode && (
            <>
              <h3 className="mb-2 mt-5 font-statement text-lg font-semibold tracking-normal text-ink-50">{t("Output")}</h3>
              {outputSpecNode}
            </>
          )}
          {problem.samples.map((s) => (
            <div key={s.ord} className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-400">{t("Sample input {n}", { n: s.ord })}</p>
                  <CopyButton text={s.input} />
                </div>
                <pre className="oj-card max-w-full overflow-x-auto p-2 font-mono text-xs">{s.input}</pre>
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-400">{t("Sample output {n}", { n: s.ord })}</p>
                  <CopyButton text={s.output} />
                </div>
                <pre className="oj-card max-w-full overflow-x-auto p-2 font-mono text-xs">{s.output}</pre>
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
      {tab === "editorial" && (
        <div id="problem-tabpanel-editorial" role="tabpanel" aria-labelledby="problem-tab-editorial">
          <OfficialEditorialPanel slug={problem.slug} examLocked={Boolean(contestId && examActive && remaining > 0)} />
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
      {tab === "result" && resultTab && (
        <div id="problem-tabpanel-result" role="tabpanel" aria-labelledby="problem-tab-result">
          <SubmissionResultPanel
            slug={problem.slug}
            resultTab={resultTab}
            timeLimitMs={problem.timeLimitMs}
            memoryLimitKb={problem.memoryLimitKb}
          />
        </div>
      )}
    </div>
  );

  const left = (
    <section className={`problem-panel flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900 ${fullHeight ? "h-full" : ""}`}>
      {problemTabs}
      <div className={`problem-panel-content px-4 py-5 sm:px-5 ${fullHeight ? "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]" : ""}`}>
        {leftBody}
      </div>
    </section>
  );

  const right = (
    <SubmissionPanel
      problemId={problem.id}
      slug={problem.slug}
      contestId={contestId}
      contestParticipantId={contestParticipantId}
      locked={locked}
      judgeable={problem.judgeable}
      samples={problem.samples}
      checkerType={problem.checkerType}
      fullHeight={fullHeight}
      actionsContainer={isDesktop ? actionsContainer : undefined}
      attemptNumber={attemptNumber}
      onResult={(result) => {
        setResultTab(result);
        setTab("result");
      }}
    />
  );

  return (
    <div className={`coding-workspace flex min-h-0 flex-col gap-3 ${fullHeight ? "h-full" : ""}`}>
      <div className="problem-toolbar relative z-30 grid min-h-11 shrink-0 grid-cols-[minmax(0,1fr)_auto] lg:min-h-8 items-center gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-2 lg:col-start-1 lg:row-start-1">{!contestId && <WorkspaceLogo />}{leftHeader}</div>
        <div ref={setActionsContainer} className="problem-actions hidden items-center justify-center lg:col-start-2 lg:row-start-1 lg:flex" />
        {!contestId && <div className="justify-self-end lg:col-start-3 lg:row-start-1"><WorkspaceAccountControls /></div>}
      </div>
      <div className={fullHeight ? "min-h-0 flex-1" : "min-w-0"}>
        <SplitPane left={left} right={right} fullHeight={fullHeight} />
      </div>
    </div>
  );
}
