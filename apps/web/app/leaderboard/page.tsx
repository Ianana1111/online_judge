"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { SkeletonList } from "@/components/Skeleton";
import { FlameIcon, SnowflakeIcon } from "@/components/icons";
import type { LeaderboardRow } from "@/lib/types";

const PERIODS: { key: "all" | "week" | "month"; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
];

const RANKINGS: { key: "score" | "streak"; label: string }[] = [
  { key: "score", label: "Score" },
  { key: "streak", label: "Streak" },
];

const RANK_STYLE: Record<number, string> = {
  1: "border-brand/50 bg-brand/10",
  2: "border-ink-400/40 bg-ink-400/5",
  3: "border-brand-dark/40 bg-brand-dark/5",
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"all" | "week" | "month">("all");
  const [scope, setScope] = useState<"all" | "students">("all");
  const [ranking, setRanking] = useState<"score" | "streak">("score");
  const { user } = useAuthStore();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["leaderboard", period, scope],
    queryFn: () => apiFetch<LeaderboardRow[]>(`/leaderboard?period=${period}&scope=${scope}`),
  });

  // Streak ranking re-sorts the same rows client-side (the API already returns each user's streak
  // regardless of period) instead of a second endpoint — only the display order and rank numbers
  // change, so it re-derives rank from position instead of trusting the score-board's r.rank.
  const displayRows = useMemo(() => {
    if (!rows) return rows;
    if (ranking === "score") return rows;
    return [...rows]
      .filter((r) => r.streak > 0)
      .sort((a, b) => b.streak - a.streak || b.score - a.score)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, ranking]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Leaderboard</h1>
        <p className="mt-1 text-sm text-ink-400">
          {ranking === "score"
            ? "Score is difficulty-weighted (harder problems are worth more) — grinding easy ones only gets you so far."
            : "Ranked by current consecutive-day streak — a day covered by a streak-freeze counts the same as a real solve."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {RANKINGS.map((r) => (
              <button
                key={r.key}
                onClick={() => setRanking(r.key)}
                className={`inline-flex items-center gap-1.5 ${r.key === ranking ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}`}
              >
                {r.key === "streak" && <FlameIcon className="h-3.5 w-3.5" />}
                {r.label}
              </button>
            ))}
          </div>
          {ranking === "score" && (
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={p.key === period ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {user?.isStudent && (
          <div className="flex gap-2">
            <button
              onClick={() => setScope("all")}
              className={scope === "all" ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}
            >
              Global
            </button>
            <button
              onClick={() => setScope("students")}
              className={scope === "students" ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}
            >
              My class
            </button>
          </div>
        )}
      </div>

      {isLoading && <SkeletonList rows={8} />}

      <div className="space-y-1.5">
        {displayRows?.map((r) => {
          const isMe = user?.handle === r.handle;
          return (
            <div
              key={r.userId}
              className={`oj-card flex items-center gap-4 p-3 ${RANK_STYLE[r.rank] ?? ""} ${isMe ? "ring-1 ring-brand" : ""}`}
            >
              <span className="w-8 text-center font-display text-lg font-bold text-ink-400">{r.rank}</span>
              <Link href={`/u/${r.handle}`} className="flex-1 text-sm font-medium text-ink-50 hover:text-brand">
                {r.handle}
                {isMe && <span className="ml-2 text-xs font-normal text-brand">(you)</span>}
              </Link>
              {r.streak > 0 && (
                <span
                  className={`inline-flex items-center gap-1 font-mono text-xs ${r.frozenToday ? "text-sky-400" : "text-verdict-tle"}`}
                  title={r.frozenToday ? "Protected today by a streak-freeze" : "Consecutive days with an AC"}
                >
                  {r.frozenToday ? <SnowflakeIcon className="h-3.5 w-3.5" /> : null}
                  {r.streak}d streak
                </span>
              )}
              {ranking === "score" && <span className="font-mono text-xs text-ink-400">{r.solved} solved</span>}
              <span className="w-16 text-right font-mono text-sm font-semibold text-brand">
                {ranking === "score" ? r.score : `${r.streak}d`}
              </span>
            </div>
          );
        })}
        {displayRows?.length === 0 && (
          <div className="oj-card p-4 text-sm text-ink-400">
            {ranking === "streak" ? (
              <p>Nobody has an active streak right now — solve something today to start one.</p>
            ) : (
              <>
                <p>Nobody's solved anything {period === "all" ? "yet" : "in this period"} — be the first.</p>
                <Link href="/problems" className="mt-2 inline-block text-brand hover:underline">
                  Browse problems →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
