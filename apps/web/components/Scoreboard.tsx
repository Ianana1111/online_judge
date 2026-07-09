"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ContestProblemRef, Scoreboard as ScoreboardT } from "@/lib/types";

export default function Scoreboard({ contestId, problems }: { contestId: string; problems: ContestProblemRef[] }) {
  const { data, isLoading } = useQuery({
    queryKey: ["scoreboard", contestId],
    queryFn: () => apiFetch<ScoreboardT>(`/contests/${contestId}/scoreboard`),
    refetchInterval: 12_000,
  });

  if (isLoading) return <p className="text-sm text-ink-400">Loading scoreboard…</p>;
  if (!data || data.standings.length === 0)
    return <p className="text-sm text-ink-400">No submissions yet — the board fills in as people solve problems.</p>;

  return (
    <div className="oj-card overflow-x-auto">
      {data.frozen && (
        <div className="border-b border-ink-700 bg-verdict-pe/10 px-3 py-1.5 text-xs text-verdict-pe">
          Scoreboard frozen — standings for the last stretch are hidden until the contest ends.
        </div>
      )}
      <table className="oj-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Handle</th>
            <th>Solved</th>
            <th>Penalty</th>
            {problems.map((p) => (
              <th key={p.label} className="text-center">
                {p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.standings.map((row) => (
            <tr key={row.userId}>
              <td className="font-mono">{row.rank}</td>
              <td className="font-medium text-ink-50">{row.handle}</td>
              <td className="font-mono">{row.solvedCount}</td>
              <td className="font-mono text-ink-400">{row.penalty}</td>
              {problems.map((p) => {
                const cell = row.problems[p.label];
                return (
                  <td key={p.label} className="text-center font-mono text-xs">
                    {cell?.solved ? (
                      <span className="text-verdict-ac">
                        +{cell.attempts > 1 ? cell.attempts - 1 : ""}
                        <span className="block text-[10px] text-ink-400">{cell.solveMin}m</span>
                      </span>
                    ) : cell?.attempts ? (
                      <span className="text-verdict-wa">-{cell.attempts}</span>
                    ) : (
                      <span className="text-ink-600">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
