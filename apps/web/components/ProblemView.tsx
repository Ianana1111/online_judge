"use client";

import { useState } from "react";
import StatementRenderer from "@/components/StatementRenderer";
import SubmissionPanel from "@/components/SubmissionPanel";
import SubmissionHistory from "@/components/SubmissionHistory";
import DiscussionPanel from "@/components/DiscussionPanel";
import SplitPane from "@/components/SplitPane";
import type { ProblemDetail } from "@/lib/types";
import { useExamTimerStore } from "@/store/examTimer";

export default function ProblemView({ problem, contestId }: { problem: ProblemDetail; contestId?: string }) {
  const [tab, setTab] = useState<"statement" | "history" | "discussion">("statement");
  const examActive = useExamTimerStore((s) => s.active);
  const remaining = useExamTimerStore((s) => s.remainingMs());
  const locked = examActive && remaining <= 0;

  const left = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-ink-50">
          {problem.sourceUrl ? (
            <a href={problem.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
              {problem.title}
            </a>
          ) : (
            problem.title
          )}
        </h1>
        <span className="font-mono text-base text-brand">{"★".repeat(problem.difficulty)}</span>
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
                <p className="mb-1 text-xs font-medium text-ink-400">Sample input {s.ord}</p>
                <pre className="oj-card overflow-x-auto p-2 font-mono text-xs">{s.input}</pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-ink-400">Sample output {s.ord}</p>
                <pre className="oj-card overflow-x-auto p-2 font-mono text-xs">{s.output}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "history" && <SubmissionHistory problemId={problem.id} />}
      {tab === "discussion" && <DiscussionPanel problemId={problem.id} />}
    </div>
  );

  const right = <SubmissionPanel problemId={problem.id} slug={problem.slug} contestId={contestId} locked={locked} />;

  return <SplitPane left={left} right={right} />;
}
