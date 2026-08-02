"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatementRenderer from "@/components/StatementRenderer";
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

const DIFFICULTY_EXPLANATION =
  "Curated ratings come first: problems from an officially-rated set (like the CPE 必考49題 one-star selection) keep that rating. Everything else is derived from how many people worldwide have solved it on UVa (more solvers = more introductory), with a minimum floor based on the algorithm topic — a DP or graph problem never rates below what its technique demands.";

export default function ProblemView({ problem, contestId }: { problem: ProblemDetail; contestId?: string }) {
  const [tab, setTab] = useState<"statement" | "history" | "discussion" | "stats" | "notes">("statement");
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
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [examActive]);
  const remaining = endsAt ? Math.max(0, endsAt - now) : 0;
  const locked = examActive && remaining <= 0;

  const left = (
    <div>
      <ProblemPrevNext slug={problem.slug} />
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
        <span className="flex items-center gap-1.5 font-mono text-base text-brand">
          {"★".repeat(problem.difficulty)}
          <InfoTooltip text={DIFFICULTY_EXPLANATION} />
        </span>
      </div>
      <div className="mb-4 flex gap-4 border-b border-ink-800 text-sm">
        <button
          onClick={() => setTab("statement")}
          className={`border-b-2 px-1 py-2 ${tab === "statement" ? "border-brand text-brand" : "border-transparent text-ink-400"}`}
        >
          Statement
        </button>
        <button
          onClick={() => setTab("history")}
          className={`border-b-2 px-1 py-2 ${tab === "history" ? "border-brand text-brand" : "border-transparent text-ink-400"}`}
        >
          My submissions
        </button>
        <button
          onClick={() => setTab("discussion")}
          className={`border-b-2 px-1 py-2 ${tab === "discussion" ? "border-brand text-brand" : "border-transparent text-ink-400"}`}
        >
          Discussion
        </button>
        <button
          onClick={() => setTab("stats")}
          className={`border-b-2 px-1 py-2 ${tab === "stats" ? "border-brand text-brand" : "border-transparent text-ink-400"}`}
        >
          Stats
        </button>
        <button
          onClick={() => setTab("notes")}
          className={`border-b-2 px-1 py-2 ${tab === "notes" ? "border-brand text-brand" : "border-transparent text-ink-400"}`}
        >
          Notes
        </button>
      </div>

      {tab === "statement" && (
        <div>
          <div className="mb-4 flex gap-4 font-mono text-xs text-ink-400">
            <span>Time limit: {problem.timeLimitMs} ms</span>
            <span>Memory limit: {Math.round(problem.memoryLimitKb / 1024)} MB</span>
          </div>
          <StatementRenderer content={problem.statementMd} />
          {problem.inputSpecMd && (
            <>
              <h3 className="mb-2 mt-5 font-display text-lg font-semibold text-ink-50">Input</h3>
              <StatementRenderer content={problem.inputSpecMd} />
            </>
          )}
          {problem.outputSpecMd && (
            <>
              <h3 className="mb-2 mt-5 font-display text-lg font-semibold text-ink-50">Output</h3>
              <StatementRenderer content={problem.outputSpecMd} />
            </>
          )}
          {problem.samples.map((s) => (
            <div key={s.ord} className="mt-4 grid gap-2 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-400">Sample input {s.ord}</p>
                  <CopyButton text={s.input} />
                </div>
                <pre className="oj-card overflow-x-auto p-2 font-mono text-xs">{s.input}</pre>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-400">Sample output {s.ord}</p>
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
                    Appeared in <span className="font-semibold text-brand">{problem.cpeAppearances}</span> past CPE exam
                    {problem.cpeAppearances === 1 ? "" : "s"}.
                  </>
                ) : (
                  "Hasn't appeared in a past CPE exam yet."
                )}
              </p>
            ) : (
              <p className="flex items-start gap-1.5 text-sm text-ink-400">
                <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="text-ink-300">Pro feature:</span> see how many times this problem has appeared in past
                  CPE exams —{" "}
                  <Link href="/upgrade" className="text-brand hover:underline">
                    upgrade to unlock
                  </Link>
                  .
                </span>
              </p>
            )}
          </div>
        </div>
      )}
      {tab === "history" && <SubmissionHistory problemId={problem.id} />}
      {tab === "discussion" && <DiscussionPanel problemId={problem.id} />}
      {tab === "stats" && <ProblemStatsPanel slug={problem.slug} />}
      {tab === "notes" && <ProblemNotePanel slug={problem.slug} />}
    </div>
  );

  const right = (
    <SubmissionPanel
      problemId={problem.id}
      slug={problem.slug}
      contestId={contestId}
      locked={locked}
      judgeable={problem.uvaId != null}
    />
  );

  return <SplitPane left={left} right={right} />;
}
