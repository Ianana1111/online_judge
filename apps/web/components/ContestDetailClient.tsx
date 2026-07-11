"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { ContestDetail } from "@/lib/types";
import Scoreboard from "@/components/Scoreboard";
import ExamModeShell from "@/components/ExamModeShell";
import ProblemView from "@/components/ProblemView";

export default function ContestDetailClient({ contestId }: { contestId: string }) {
  const qc = useQueryClient();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProblemSlug, setActiveProblemSlug] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const { data: contest, isLoading } = useQuery({
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
      setError(e instanceof ApiError ? e.message : "Could not join the contest");
    } finally {
      setRegistering(false);
    }
  }

  if (isLoading || !contest) return <p className="text-sm text-ink-400">Loading contest…</p>;

  const scheduledNotStarted = !!contest.startAt && new Date(contest.startAt).getTime() > now;
  const isRunning =
    contest.myParticipant && !scheduledNotStarted && new Date(contest.myParticipant.endsAt).getTime() > now;
  const activeProblem = activeProblemSlug
    ? contest.problems.find((p) => p.problem.slug === activeProblemSlug)?.problem
    : null;

  const inner = activeProblem ? (
    <div>
      <button onClick={() => setActiveProblemSlug(null)} className="mb-4 text-sm text-brand hover:underline">
        ← Back to problem set
      </button>
      <ProblemView problem={activeProblem} contestId={contestId} />
    </div>
  ) : (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">Problems</h2>
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
        <h2 className="mb-2 text-sm font-semibold text-ink-200">Scoreboard</h2>
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
        ← All contests
      </Link>
      <div>
        <h1 className="mb-1 font-display text-2xl font-bold text-ink-50">{contest.title}</h1>
        <p className="font-mono text-xs text-ink-400">
          {contest.kind} · {contest.durationMin} min · penalty {contest.penaltyMin}m/wrong
        </p>
      </div>

      {!contest.myParticipant && (
        <div className="oj-card p-4">
          <p className="mb-3 text-sm text-ink-300">
            {contest.startAt ? (
              <>
                This is a scheduled group session — everyone who registers shares one clock, starting at{" "}
                <span className="font-mono text-ink-100">{new Date(contest.startAt).toLocaleString()}</span> and
                ending {contest.durationMin} minutes later, whether you register early or join right at the
                start.
              </>
            ) : (
              <>
                Starting begins your personal {contest.durationMin}-minute window right now — the clock does
                not stop if you leave.
              </>
            )}
          </p>
          {error && <p className="mb-2 text-sm text-verdict-wa">{error}</p>}
          <button onClick={register} disabled={registering} className="oj-btn-primary">
            {registering ? "Joining…" : contest.startAt ? "Register" : "Start exam"}
          </button>
        </div>
      )}

      {contest.myParticipant && scheduledNotStarted && (
        <div className="oj-card p-4">
          <p className="mb-1 text-sm text-ink-200">You're registered. This contest hasn't started yet.</p>
          <p className="font-mono text-lg font-semibold text-brand">
            Starts at {new Date(contest.startAt!).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            This page refreshes automatically — come back here once the start time arrives.
          </p>
        </div>
      )}

      {inner}
    </div>
  );
}
