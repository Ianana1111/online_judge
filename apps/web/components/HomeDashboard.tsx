"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import DailyGoalRing from "@/components/DailyGoalRing";
import VerdictBadge from "@/components/VerdictBadge";
import type { DailyStats, RecommendedProblems, SubmissionListItem } from "@/lib/types";

const DIFFICULTY_STARS = (d: number) => "★".repeat(d);

/** Shown instead of the logged-out hero once a session is confirmed — the homepage's job for a
 * returning user is "get me back into solving," not re-pitching what the site is. */
export default function HomeDashboard() {
  const { user } = useAuthStore();

  const { data: daily } = useQuery({
    queryKey: ["daily"],
    queryFn: () => apiFetch<DailyStats>("/users/me/daily"),
    enabled: !!user,
  });
  const { data: recommended } = useQuery({
    queryKey: ["recommended"],
    queryFn: () => apiFetch<RecommendedProblems>("/problems/recommended"),
    enabled: !!user,
  });
  const { data: recent } = useQuery({
    queryKey: ["recent-submissions"],
    queryFn: () => apiFetch<{ items: SubmissionListItem[] }>("/submissions?user=me&pageSize=5"),
    enabled: !!user,
  });

  if (!user) return null;

  const suggestions = [
    ...(recommended?.collectionNext ? [{ ...recommended.collectionNext, reason: `Next in ${recommended.collectionNext.collectionTitle}` }] : []),
    ...(recommended?.consolidate ?? []).map((p) => ({ ...p, reason: "Keep building your current tier" })),
    ...(recommended?.stretch ? [{ ...recommended.stretch, reason: "Stretch goal — one tier up" }] : []),
  ].slice(0, 4);

  return (
    <section className="grid gap-4 py-6 sm:grid-cols-[auto_1fr]">
      <div className="oj-card flex items-center gap-4 p-5">
        <DailyGoalRing solvedToday={daily?.solvedToday ?? 0} goal={daily?.goal ?? 1} />
        <div>
          <h1 className="font-display text-xl font-bold text-ink-50">Welcome back, {user.handle}</h1>
          {daily && daily.currentStreak > 0 ? (
            <p className={`mt-1 font-mono text-xs ${daily.atRisk ? "text-verdict-tle" : "text-ink-400"}`}>
              🔥 {daily.currentStreak}d streak{daily.atRisk ? " — solve one today to keep it alive" : ""}
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink-400">Solve today to start a streak.</p>
          )}
          {recent && recent.items.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-ink-500">Recent:</span>
              {recent.items.slice(0, 5).map((s) => (
                <VerdictBadge key={s.id} verdict={s.verdict} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="oj-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink-200">Recommended for you</h2>
        {suggestions.length === 0 ? (
          <p className="text-sm text-ink-400">
            No new recommendations yet —{" "}
            <Link href="/problems" className="text-brand hover:underline">
              browse the problem list
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((p) => (
              <Link key={p.id} href={`/problems/${p.slug}`} className="oj-card p-3 transition-colors hover:border-brand">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-500">{p.reason}</span>
                  <span className="font-mono text-xs text-brand">{DIFFICULTY_STARS(p.difficulty)}</span>
                </div>
                <h3 className="text-sm font-medium text-ink-50">{p.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
