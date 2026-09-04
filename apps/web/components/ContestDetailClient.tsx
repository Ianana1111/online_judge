"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { ContestConflictBody, ContestDetail } from "@/lib/types";
import { useAuthStore } from "@/store/auth";
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

/** ProblemView's prevNextNode override for a contest — same look as the standalone page's
 * <ProblemPrevNext>, but walks *this contest's* problem order (by label, A/B/C/...) via the local
 * activeProblemSlug state instead of a URL-driven list, since a contest is never browsed by URL. */
function ContestProblemNav({
  problems,
  currentSlug,
  onNavigate,
}: {
  problems: ContestDetail["problems"];
  currentSlug: string;
  onNavigate: (slug: string) => void;
}) {
  const t = useT();
  const index = problems.findIndex((cp) => cp.problem.slug === currentSlug);
  const prev = index > 0 ? problems[index - 1] : null;
  const next = index < problems.length - 1 ? problems[index + 1] : null;

  return (
    <div className="oj-card mb-4 flex items-center justify-between gap-3 px-3 py-2">
      {prev ? (
        <button
          type="button"
          onClick={() => onNavigate(prev.problem.slug)}
          className="group flex min-w-0 flex-1 items-center gap-1.5 text-left text-sm text-ink-300 hover:text-brand"
        >
          <span aria-hidden className="shrink-0 transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          <span className="truncate">
            {prev.label}. {prev.problem.title}
          </span>
        </button>
      ) : (
        <span className="flex-1 text-sm text-ink-500">{t("← Start of list")}</span>
      )}

      <span className="shrink-0 font-mono text-xs text-ink-500">
        {t("{n} / {total} · {context}", { n: index + 1, total: problems.length, context: t("Problems") })}
      </span>

      {next ? (
        <button
          type="button"
          onClick={() => onNavigate(next.problem.slug)}
          className="group flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right text-sm text-ink-300 hover:text-brand"
        >
          <span className="truncate">
            {next.label}. {next.problem.title}
          </span>
          <span aria-hidden className="shrink-0 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </button>
      ) : (
        <span className="flex-1 text-right text-sm text-ink-500">{t("End of list →")}</span>
      )}
    </div>
  );
}

export default function ContestDetailClient({ contestId }: { contestId: string }) {
  const t = useT();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<ContestConflictBody["conflictingContest"] | null>(null);
  const [switching, setSwitching] = useState(false);
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
    setConflict(null);
    setRegistering(true);
    try {
      await apiFetch(`/contests/${contestId}/register`, { method: "POST" });
      await qc.invalidateQueries({ queryKey: ["contest", contestId] });
      await qc.invalidateQueries({ queryKey: ["contests", "me"] });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.body && typeof e.body === "object" && "conflictingContest" in e.body) {
        setConflict((e.body as ContestConflictBody).conflictingContest);
      } else {
        setError(e instanceof ApiError ? e.message : t("Could not join the contest"));
      }
    } finally {
      setRegistering(false);
    }
  }

  // The one-click resolution offered on the conflict card: end the other exam that's currently
  // live, then immediately continue into this one — the guided version of "end early, then go
  // start what I actually wanted," so the user never has to make two separate trips.
  async function endConflictAndRegister() {
    if (!conflict) return;
    setError(null);
    setSwitching(true);
    try {
      await apiFetch(`/contests/${conflict.id}/end`, { method: "POST" });
      setConflict(null);
      await qc.invalidateQueries({ queryKey: ["contest", conflict.id] });
      await qc.invalidateQueries({ queryKey: ["contests", "me"] });
      await register();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not end that exam"));
    } finally {
      setSwitching(false);
    }
  }

  async function endThisAttempt() {
    setError(null);
    try {
      await apiFetch(`/contests/${contestId}/end`, { method: "POST" });
      await qc.invalidateQueries({ queryKey: ["contest", contestId] });
      await qc.invalidateQueries({ queryKey: ["contests", "me"] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not end this exam"));
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
  // Their latest attempt has ended (and it's not just "hasn't started yet" for a scheduled
  // sitting) — canStartNewAttempt tells us whether that also means a fresh attempt is on offer
  // (individual/virtual contests only; a scheduled group sitting is one-shot).
  const finished = !!contest.myParticipant && !isRunning && !scheduledNotStarted;
  const canReattempt = finished && contest.canStartNewAttempt;
  const activeProblem = activeProblemSlug
    ? contest.problems.find((p) => p.problem.slug === activeProblemSlug)?.problem
    : null;

  // fullHeight only while actually viewing one problem inside the running exam (the LeetCode-style
  // split-pane workspace) — the problem-list/scoreboard menu, and any of this same JSX rendered
  // after the exam ends for review, stay normal-flow/scrollable, so this is built per call site
  // rather than once as a shared constant.
  // Takes `contest` as an explicit parameter (shadowing the outer one) rather than closing over it
  // — the early `if (!contest) return` above narrows the outer binding for the rest of *this*
  // render, but TypeScript can't carry that narrowing into a nested function declaration, since in
  // general nothing stops the outer binding from being reassigned before the inner function runs.
  function buildInner(contest: ContestDetail, fullHeight: boolean) {
    if (activeProblem) {
      return fullHeight ? (
        <div className="flex h-full min-h-0 flex-col">
          <button
            onClick={() => setActiveProblemSlug(null)}
            className="mb-3 shrink-0 text-left text-sm text-brand hover:underline"
          >
            {t("← Back to problem set")}
          </button>
          <div className="min-h-0 flex-1">
            <ProblemView
              problem={activeProblem}
              contestId={contestId}
              statementNode={<StatementRenderer content={activeProblem.statementMd} />}
              inputSpecNode={activeProblem.inputSpecMd ? <StatementRenderer content={activeProblem.inputSpecMd} /> : null}
              outputSpecNode={activeProblem.outputSpecMd ? <StatementRenderer content={activeProblem.outputSpecMd} /> : null}
              fullHeight
              hideDifficulty
              attemptNumber={contest.myParticipant?.attemptNumber}
              prevNextNode={
                <ContestProblemNav problems={contest.problems} currentSlug={activeProblem.slug} onNavigate={setActiveProblemSlug} />
              }
            />
          </div>
        </div>
      ) : (
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
            hideDifficulty
            attemptNumber={contest.myParticipant?.attemptNumber}
            prevNextNode={
              <ContestProblemNav problems={contest.problems} currentSlug={activeProblem.slug} onNavigate={setActiveProblemSlug} />
            }
          />
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("Problems")}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {contest.problems.map((cp) => {
              // Only highlighted while *this* attempt is still running — once it ends (or when
              // browsing a past attempt), the problem list goes back to plain/unmarked; the
              // scoreboard is where a solve stays visible permanently (see Scoreboard's own
              // liveUserId prop for the matching live-only highlight there).
              const solved = isRunning && contest.solvedProblemIds.includes(cp.problem.id);
              return (
                <button
                  key={cp.problem.id}
                  onClick={() => setActiveProblemSlug(cp.problem.slug)}
                  disabled={!contest.myParticipant}
                  className={`oj-card flex items-center justify-between p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    solved ? "border-verdict-ac/50 bg-verdict-ac/10 hover:border-verdict-ac" : "hover:border-brand"
                  }`}
                >
                  <span className={`font-mono ${solved ? "text-verdict-ac" : "text-brand"}`}>{cp.label}</span>
                  <span className="flex-1 px-3 text-ink-100">{cp.problem.title}</span>
                  {/* Hidden once the exam has actually started (myParticipant exists) — a real CPE
                      sitting never shows difficulty upfront either. Solved status (see above) takes
                      over as the meaningful signal on this button at that point. */}
                  {!contest.myParticipant && (
                    <span className="font-mono text-xs text-ink-500">{"★".repeat(cp.problem.difficulty)}</span>
                  )}
                  {solved && <span className="font-mono text-xs text-verdict-ac">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("Scoreboard")}</h2>
          <Scoreboard contestId={contestId} problems={contest.problems} liveUserId={isRunning ? (user?.id ?? null) : null} />
        </div>
      </div>
    );
  }

  if (isRunning && contest.myParticipant) {
    return (
      <ExamModeShell
        contestId={contestId}
        title={contest.myParticipant.attemptNumber > 1 ? `${contest.title} (#${contest.myParticipant.attemptNumber})` : contest.title}
        endsAtIso={contest.myParticipant.endsAt}
        homeHref={contest.kind === "GPE" ? "/gpe" : "/cpe"}
        fullHeight={!!activeProblem}
        solvedCount={contest.solvedProblemIds.length}
        totalProblems={contest.problems.length}
        onEnd={endThisAttempt}
      >
        {buildInner(contest, !!activeProblem)}
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
          {contest.myParticipant && contest.myParticipant.attemptNumber > 1 && (
            <> · {t("attempt #{n}", { n: contest.myParticipant.attemptNumber })}</>
          )}
        </p>
      </div>

      {conflict && (
        <div className="oj-card border-verdict-wa/40 p-4">
          <p className="mb-3 text-sm text-ink-300">
            {t("You're already in the middle of")} <span className="font-medium text-ink-50">{conflict.title}</span>
            {" — "}
            {t("only one exam can run at a time.")}
          </p>
          {error && <p className="mb-2 text-sm text-verdict-wa">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Link href={`/contests/${conflict.id}`} className="oj-btn-secondary px-4 py-1.5 text-sm">
              {t("Go finish it")}
            </Link>
            <button onClick={endConflictAndRegister} disabled={switching} className="oj-btn-primary px-4 py-1.5 text-sm">
              {switching ? t("Switching…") : t("End that one & start this instead")}
            </button>
          </div>
        </div>
      )}

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

      {canReattempt && (
        <div className="oj-card p-4">
          <p className="mb-3 text-sm text-ink-300">
            {t("You finished attempt #{n} of this sitting.", { n: contest.myParticipant!.attemptNumber })}{" "}
            {t("Starting again begins a brand new timed attempt (#{n}) — your scoreboard entry only ever keeps whichever attempt scored best.", {
              n: contest.myParticipant!.attemptNumber + 1,
            })}
          </p>
          {error && <p className="mb-2 text-sm text-verdict-wa">{error}</p>}
          <button onClick={register} disabled={registering} className="oj-btn-primary">
            {registering ? t("Starting…") : t("Attempt again")}
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

      {contest.myAttempts.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("Your attempts")}</h2>
          <div className="oj-card divide-y divide-ink-800">
            {contest.myAttempts.map((a, idx) => {
              const prev = idx > 0 ? contest.myAttempts[idx - 1] : null;
              const delta = prev ? a.solvedCount - prev.solvedCount : null;
              return (
                <div key={a.attemptNumber} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink-100">
                      {t("Attempt #{n}", { n: a.attemptNumber })}{" "}
                      <span className="font-mono text-xs text-ink-500">{new Date(a.startedAt).toLocaleString()}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {a.status === "RUNNING"
                        ? t("In progress")
                        : a.endedEarly
                          ? t("Ended early")
                          : t("Time expired")}
                      {delta !== null && delta !== 0 && (
                        <span className={delta > 0 ? "text-verdict-ac" : "text-verdict-wa"}>
                          {" · "}
                          {delta > 0 ? `+${delta}` : delta} {t("vs. previous")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right font-mono text-sm">
                    <span className="text-ink-100">{a.solvedCount}</span>
                    <span className="text-ink-500"> {t("solved")}</span>
                    <span className="ml-2 text-ink-400">{a.penalty}p</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {buildInner(contest, false)}
    </div>
  );
}
