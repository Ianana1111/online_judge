"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { LeaderboardRow } from "@/lib/types";

const PERIODS: { key: "all" | "week" | "month"; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
];

const RANK_STYLE: Record<number, string> = {
  1: "border-brand/50 bg-brand/10",
  2: "border-ink-400/40 bg-ink-400/5",
  3: "border-brand-dark/40 bg-brand-dark/5",
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"all" | "week" | "month">("week");
  const [scope, setScope] = useState<"all" | "students">("all");
  const { user } = useAuthStore();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["leaderboard", period, scope],
    queryFn: () => apiFetch<LeaderboardRow[]>(`/leaderboard?period=${period}&scope=${scope}`),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Leaderboard</h1>
        <p className="mt-1 text-sm text-ink-400">
          Score is difficulty-weighted (harder problems are worth more) — grinding easy ones only gets you so far.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
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

      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}

      <div className="space-y-1.5">
        {rows?.map((r) => {
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
                <span className="font-mono text-xs text-verdict-tle" title="Consecutive days with an AC">
                  {r.streak}d streak
                </span>
              )}
              <span className="font-mono text-xs text-ink-400">{r.solved} solved</span>
              <span className="w-16 text-right font-mono text-sm font-semibold text-brand">{r.score}</span>
            </div>
          );
        })}
        {rows?.length === 0 && (
          <p className="oj-card p-4 text-sm text-ink-400">
            Nobody's solved anything {period === "all" ? "yet" : "in this period"} — be the first.
          </p>
        )}
      </div>
    </div>
  );
}
