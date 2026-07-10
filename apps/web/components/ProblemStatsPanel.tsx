"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ProblemStats } from "@/lib/types";

export default function ProblemStatsPanel({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["problem-stats", slug],
    queryFn: () => apiFetch<ProblemStats>(`/problems/${slug}/stats`),
  });

  if (isLoading) return <p className="text-sm text-ink-400">Loading…</p>;
  if (!data || data.solvedCount === 0) {
    return <p className="text-sm text-ink-400">Nobody's solved this one yet — be the first, and these stats fill in.</p>;
  }

  return (
    <div className="space-y-4">
      {data.yourBest && (
        <div className="oj-card border-brand/30 p-4">
          <p className="text-sm text-ink-300">
            Your best: <span className="font-mono text-brand">{data.yourBest.timeMs} ms</span>
            {data.yourBest.beatsPct !== null && (
              <span className="ml-2 text-ink-400">— beats {data.yourBest.beatsPct}% of solvers</span>
            )}
          </p>
        </div>
      )}

      <div className="oj-card p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
          Runtime — {data.solvedCount} solver{data.solvedCount === 1 ? "" : "s"}
        </p>
        {data.time && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono text-lg text-ink-50">{data.time.minMs} ms</p>
              <p className="text-xs text-ink-500">fastest</p>
            </div>
            <div>
              <p className="font-mono text-lg text-ink-50">{data.time.medianMs} ms</p>
              <p className="text-xs text-ink-500">median</p>
            </div>
            <div>
              <p className="font-mono text-lg text-ink-50">{data.time.maxMs} ms</p>
              <p className="text-xs text-ink-500">slowest</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-ink-500">
        Memory usage isn't shown here — onlinejudge.org's own results page doesn't publish it, so there's no
        real data to display instead of making something up.
      </p>
    </div>
  );
}
