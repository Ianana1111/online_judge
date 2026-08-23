"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { ContestDetail } from "@/lib/types";
import Scoreboard from "@/components/Scoreboard";
import ExamModeShell from "@/components/ExamModeShell";
import ProblemView from "@/components/ProblemView";
import { Skeleton } from "@/components/Skeleton";
import { useT } from "@/lib/i18n/LocaleContext";

// Markdown/KaTeX parsing is a large chunk unrelated to the rest of this page — deferring it out
// of the initial page JS keeps the surrounding content interactive sooner. Unlike the plain
// problem page (app/problems/[slug]/page.tsx), contest problems are only known after a
// client-side fetch, so there's no Server Component boundary available to render this ahead of
// time — code-splitting is the next best thing here.
const StatementRenderer = dynamic(() => import("@/components/StatementRenderer"), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function ContestDetailClient({ contestId }: { contestId: string }) {
  const t = useT();
  const qc = useQueryClient();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProblemSlug, setActiveProblemSlug] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const { data: contest, isLoading, isError, refetch } = useQuery({
    queryKey: ["contest", contestId],
    queryFn: () => apiFetch<ContestDetail>(`/contests/${contestId}`),
    refetchInterval: 15_000,
  });

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  async function register() {
    setError(null);
    setRegistering(true);
    try {
      await apiFetch(`/contests/${contestId}/register`, { method: "POST" });
      await qc.invalidateQueries({ queryKey: ["contest", contestId] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not join the contest"));
    } finally {
      setRegistering(false);
    }
  }

  if (isLoading) return <p className="text-sm text-ink-400">{t("Loading contest…")}</p>;

  // Previously fell into the same "Loading contest…" branch as the isLoading check above — with
  // no isError check, a failed fetch left isLoading false and contest undefined forever, so an
  // API error or slow cold start showed a permanent, misleading loading message instead of any
  // indication something was actually wrong.
  if (isError || !contest) {
    return (
      <div className="oj-card flex flex-col items-center gap-2 p-6 text-center">
        <p className="text-sm text-ink-300">{t("Something went wrong")}</p>
        <button type="button" onClick={() => refetch()} className="oj-btn-secondary px-4 py-1.5 text-xs">
          {t("Try again")}
        </button>
      </div>
    );
  }

  const scheduledNotStarted = !!contest.startAt && new Date(contest.startAt).getTime() > now;
  const isRunning =
    contest.myParticipant && !scheduledNotStarted && new Date(contest.myParticipant.endsAt).getTime() > now;
  const activeProblem = activeProblemSlug
    ? contest.problems.find((p) => p.problem.slug === activeProblemSlug)?.problem
    : null;

  const inner = activeProblem ? (
    <div>
      <button onClick={() => setActiveProblemSlug(null)} className="mb-4 text-sm text-brand hover:underline">
        {t("← Back to problem set")}
      </button>
      <ProblemView
        problem={activeProblem}
        contestId={contestId}
        statementNode={<StatementRenderer content={activeProblem.statementMd} />}
        inputSpecNode={activeProblem.inputSpecMd ? <StatementRenderer content={activeProblem.inputSpecMd} /> : null}
        outputSpecNode={activeProblem.outputSpecMd ? <StatementRenderer content={activeProblem.outputSpecMd} /> : null}
      />
    </div>
  ) : (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("Problems")}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {contest.problems.map((cp) => (
            <button
              key={cp.problem.id}
              onClick={() => setActiveProblemSlug(cp.problem.slug)}
              disabled={!contest.myParticipant}
              className="oj-card flex items-center justify-between p-3 text-left transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="font-mono text-brand">{cp.label}</span>
              <span className="flex-1 px-3 text-ink-100">{cp.problem.title}</span>
              <span className="font-mono text-xs text-ink-500">{"★".repeat(cp.problem.difficulty)}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("Scoreboard")}</h2>
        <Scoreboard contestId={contestId} problems={contest.problems} />
      </div>
    </div>
  );

  if (isRunning && contest.myParticipant) {
    return (
      <ExamModeShell
        contestId={contestId}
        title={contest.title}
        endsAtIso={contest.myParticipant.endsAt}
        homeHref={contest.kind === "GPE" ? "/gpe" : "/cpe"}
      >
        {inner}
      </ExamModeShell>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/contests" className="inline-block text-sm text-ink-400 hover:text-brand">
        {t("← All contests")}
      </Link>
      <div>
        <h1 className="mb-1 font-display text-2xl font-bold text-ink-50">{contest.title}</h1>
        <p className="font-mono text-xs text-ink-400">
          {contest.kind} · {t("{n} min", { n: contest.durationMin })} · {t("penalty {n}m/wrong", { n: contest.penaltyMin })}
        </p>
      </div>

      {!contest.myParticipant && (
        <div className="oj-card p-4">
          <p className="mb-3 text-sm text-ink-300">
            {contest.startAt ? (
              <>
                {t("This is a scheduled group session — everyone who registers shares one clock, starting at")}{" "}
                <span className="font-mono text-ink-100">{new Date(contest.startAt).toLocaleString()}</span>{" "}
                {t("and ending {n} minutes later, whether you register early or join right at the start.", {
                  n: contest.durationMin,
                })}
              </>
            ) : (
              t("Starting begins your personal {n}-minute window right now — the clock does not stop if you leave.", {
                n: contest.durationMin,
              })
            )}
          </p>
          {error && <p className="mb-2 text-sm text-verdict-wa">{error}</p>}
          <button onClick={register} disabled={registering} className="oj-btn-primary">
            {registering ? t("Joining…") : contest.startAt ? t("Register for contest") : t("Start exam")}
          </button>
        </div>
      )}

      {contest.myParticipant && scheduledNotStarted && (
        <div className="oj-card p-4">
          <p className="mb-1 text-sm text-ink-200">{t("You're registered. This contest hasn't started yet.")}</p>
          <p className="font-mono text-lg font-semibold text-brand">
            {t("Starts at {when}", { when: new Date(contest.startAt!).toLocaleString() })}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {t("This page refreshes automatically — come back here once the start time arrives.")}
          </p>
        </div>
      )}

      {inner}
    </div>
  );
}
