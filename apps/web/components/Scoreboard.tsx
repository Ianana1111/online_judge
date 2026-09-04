"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ContestProblemRef, Scoreboard as ScoreboardT } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

export default function Scoreboard({
  contestId,
  problems,
  liveUserId,
}: {
  contestId: string;
  problems: ContestProblemRef[];
  /** The viewer's own userId, but only while their own attempt is still running — set to null once
   * it ends or when browsing someone else's/a past attempt. Solved cells in that row get a green
   * highlight for the duration, matching the same live-only highlight on the problem list
   * (ContestDetailClient) — but only when the displayed row actually IS the live attempt (see
   * `rowIsLive` below); if the viewer is re-attempting and their best-scoring row is an older,
   * already-finished attempt, that row's cells stay unhighlighted and the `liveAttempt` badge
   * carries the real-time numbers instead, so nothing here ever implies a stale row is updating. */
  liveUserId?: string | null;
}) {
  const t = useT();
  const { data, isLoading } = useQuery({
    queryKey: ["scoreboard", contestId],
    queryFn: () => apiFetch<ScoreboardT>(`/contests/${contestId}/scoreboard`),
    refetchInterval: 12_000,
  });

  if (isLoading) return <p className="text-sm text-ink-400">{t("Loading scoreboard…")}</p>;
  if (!data || data.standings.length === 0)
    return <p className="text-sm text-ink-400">{t("No submissions yet — the board fills in as people solve problems.")}</p>;

  return (
    <div className="oj-card overflow-x-auto">
      {data.frozen && (
        <div className="border-b border-ink-700 bg-verdict-pe/10 px-3 py-1.5 text-xs text-verdict-pe">
          {t("Scoreboard frozen — standings for the last stretch are hidden until the contest ends.")}
        </div>
      )}
      <table className="oj-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t("Handle")}</th>
            <th>{t("Solved count")}</th>
            <th>{t("Penalty")}</th>
            {problems.map((p) => (
              <th key={p.label} className="!text-center">
                {p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.standings.map((row) => {
            // The displayed row (best attempt) is only "truthfully live" when the currently-
            // running attempt IS that best attempt — otherwise the row's own cells are frozen at
            // an older, already-finished attempt and must not be green-highlighted as if they were
            // updating in real time (see ContestsService.computeScoreboard's liveAttempt field).
            const rowIsLive = row.liveAttempt?.attemptNumber === row.attemptNumber;
            const liveElsewhere = row.liveAttempt && !rowIsLive ? row.liveAttempt : null;
            return (
            <tr key={row.userId}>
              <td className="font-mono">{row.rank}</td>
              <td className="font-medium text-ink-50">
                {row.handle}
                {row.attemptNumber > 1 && (
                  <span className="ml-1.5 font-mono text-[10px] font-normal text-ink-500">#{row.attemptNumber}</span>
                )}
                {rowIsLive && (
                  <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-normal text-verdict-tle">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-verdict-tle" aria-hidden />
                    {t("live")}
                  </span>
                )}
                {liveElsewhere && (
                  <span className="ml-1.5 font-mono text-[10px] font-normal text-verdict-tle" title={t("Currently re-attempting")}>
                    🔴 #{liveElsewhere.attemptNumber} {t("in progress")}: {liveElsewhere.solvedCount}/{problems.length}
                  </span>
                )}
              </td>
              <td className="font-mono">{row.solvedCount}</td>
              <td className="font-mono text-ink-400">{row.penalty}</td>
              {problems.map((p) => {
                const cell = row.problems[p.label];
                const live = cell?.solved && rowIsLive && row.userId === liveUserId;
                return (
                  <td key={p.label} className={`text-center font-mono text-xs ${live ? "bg-verdict-ac/10" : ""}`}>
                    {cell?.solved ? (
                      <span className="text-verdict-ac">
                        +{cell.attempts > 1 ? cell.attempts - 1 : ""}
                        <span className="block text-[10px] text-ink-400">{cell.solveMin}m</span>
                      </span>
                    ) : cell?.attempts ? (
                      <span className="text-verdict-wa">-{cell.attempts}</span>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
