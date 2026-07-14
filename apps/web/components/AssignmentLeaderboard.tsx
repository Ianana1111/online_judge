"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AssignmentLeaderboardRow } from "@/lib/types";

/** Collapsed by default so a short assignment list doesn't turn into a wall of names — classmates
 * are exactly the audience for "who's ahead on this one," not a headline stat. */
export default function AssignmentLeaderboard({ assignmentId }: { assignmentId: string }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["assignment-leaderboard", assignmentId],
    queryFn: () => apiFetch<AssignmentLeaderboardRow[]>(`/assignments/${assignmentId}/leaderboard`),
    enabled: open,
  });

  return (
    <details className="mt-3" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="cursor-pointer text-xs font-medium text-brand hover:underline">Class progress</summary>
      <div className="mt-2 space-y-1">
        {isLoading && <p className="text-xs text-ink-400">Loading…</p>}
        {data?.map((row) => (
          <div
            key={row.userId}
            className={`flex items-center gap-3 rounded border border-ink-800 px-3 py-1.5 text-xs ${
              row.handle === user?.handle ? "ring-1 ring-brand" : ""
            }`}
          >
            <span className="w-6 text-center font-mono text-ink-500">{row.rank}</span>
            <span className="flex-1 text-ink-200">{row.handle}</span>
            <span className="font-mono text-ink-400">
              {row.solvedCount}/{row.totalCount}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}
