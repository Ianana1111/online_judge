"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { SkeletonList } from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import SchoolCombobox from "@/components/SchoolCombobox";
import { FlameIcon, SnowflakeIcon, TrophyIcon } from "@/components/icons";
import type { LeaderboardRow } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const PERIODS: { key: "all" | "week" | "month"; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
];

const RANKINGS: { key: "solved" | "streak"; label: string }[] = [
  { key: "solved", label: "Most solved" },
  { key: "streak", label: "Streak" },
];

const RANK_STYLE: Record<number, string> = {
  1: "bg-brand/10",
  2: "bg-ink-400/5",
  3: "bg-brand-dark/5",
};

function formatTime(ms: number | null): string {
  if (ms == null) return "–";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatMemory(kb: number | null): string {
  if (kb == null) return "–";
  return `${Math.round(kb / 1024)} MB`;
}

export default function LeaderboardPage() {
  const t = useT();
  const [period, setPeriod] = useState<"all" | "week" | "month">("all");
  const [scope, setScope] = useState<"all" | "students">("all");
  const [ranking, setRanking] = useState<"solved" | "streak">("solved");
  const [school, setSchool] = useState<string | null>(null);
  const { user } = useAuthStore();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["leaderboard", period, scope, school],
    queryFn: () =>
      apiFetch<LeaderboardRow[]>(
        `/leaderboard?period=${period}&scope=${scope}${school ? `&school=${encodeURIComponent(school)}` : ""}`,
      ),
  });

  // Streak ranking re-sorts the same rows client-side (the API already returns each user's streak
  // regardless of period) instead of a second endpoint — only the display order and rank numbers
  // change, so it re-derives rank from position instead of trusting the API's r.rank (which is
  // solved-count order).
  const displayRows = useMemo(() => {
    if (!rows) return rows;
    if (ranking === "solved") return rows;
    return [...rows]
      .filter((r) => r.streak > 0)
      .sort((a, b) => b.streak - a.streak || b.solved - a.solved)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, ranking]);

  const topAtSchool = school && displayRows && displayRows.length > 0 ? displayRows[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{t("Leaderboard")}</h1>
        <p className="mt-1 text-sm text-ink-400">
          {ranking === "solved"
            ? t("Ranked by how many problems you've solved — grinding a lot beats grinding hard.")
            : t("Ranked by current consecutive-day streak — a day covered by a streak-freeze counts the same as a real solve.")}
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
                {t(r.label)}
              </button>
            ))}
          </div>
          {ranking === "solved" && (
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={p.key === period ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}
                >
                  {t(p.label)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <SchoolCombobox value={school} onChange={setSchool} placeholder={t("All schools")} />
          </div>
          {user?.isStudent && (
            <div className="flex gap-2">
              <button
                onClick={() => setScope("all")}
                className={scope === "all" ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}
              >
                {t("Global")}
              </button>
              <button
                onClick={() => setScope("students")}
                className={scope === "students" ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"}
              >
                {t("My class")}
              </button>
            </div>
          )}
        </div>
      </div>

      {topAtSchool && (
        <div className="oj-card flex items-center gap-2 border-brand/30 bg-brand/5 px-4 py-3 text-sm">
          <TrophyIcon className="h-4 w-4 shrink-0 text-brand" />
          <span className="text-ink-200">
            {t("Top at {school}:", { school: school! })}{" "}
            <Link href={`/u/${topAtSchool.handle}`} className="font-semibold text-brand hover:underline">
              {topAtSchool.handle}
            </Link>
          </span>
        </div>
      )}

      {isLoading && <SkeletonList rows={8} />}

      {!isLoading && displayRows && displayRows.length > 0 && (
        <div className="oj-card overflow-x-auto">
          <table className="oj-table">
            <thead>
              <tr>
                <th>{t("Rank")}</th>
                <th>{t("User")}</th>
                <th>{t("School")}</th>
                <th>{t("Avg time")}</th>
                <th>{t("Avg memory")}</th>
                <th>{t("Total submissions")}</th>
                <th className="text-right">{ranking === "solved" ? t("Solved") : t("Streak")}</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r) => {
                const isMe = user?.handle === r.handle;
                return (
                  <tr key={r.userId} className={`${RANK_STYLE[r.rank] ?? ""} ${isMe ? "ring-1 ring-inset ring-brand" : ""}`}>
                    <td className="font-display font-bold text-ink-400">{r.rank}</td>
                    <td>
                      <Link href={`/u/${r.handle}`} className="flex items-center gap-2.5 font-medium text-ink-50 hover:text-brand">
                        <Avatar avatarUrl={r.avatarUrl} handle={r.handle} size={24} />
                        {r.handle}
                        {isMe && <span className="text-xs font-normal text-brand">{t("(you)")}</span>}
                      </Link>
                    </td>
                    <td className="max-w-[160px] truncate text-xs text-ink-400">{r.school ?? "–"}</td>
                    <td className="font-mono text-xs text-ink-400">{formatTime(r.avgTimeMs)}</td>
                    <td className="font-mono text-xs text-ink-400">{formatMemory(r.avgMemoryKb)}</td>
                    <td className="font-mono text-xs text-ink-400">{r.totalSubmissions}</td>
                    <td className="text-right">
                      {ranking === "solved" ? (
                        <span className="font-mono text-sm font-semibold text-brand">{r.solved}</span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-sm font-semibold ${r.frozenToday ? "text-sky-400" : "text-verdict-tle"}`}
                        >
                          {r.frozenToday ? <SnowflakeIcon className="h-3.5 w-3.5" /> : <FlameIcon className="h-3.5 w-3.5" />}
                          {t("{n}d", { n: r.streak })}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && displayRows?.length === 0 && (
        <div className="oj-card p-4 text-sm text-ink-400">
          {ranking === "streak" ? (
            <p>{t("Nobody has an active streak right now — solve something today to start one.")}</p>
          ) : school ? (
            <p>{t("Nobody from {school} has solved anything yet — be the first.", { school })}</p>
          ) : (
            <>
              <p>
                {period === "all"
                  ? t("Nobody's solved anything yet — be the first.")
                  : t("Nobody's solved anything in this period — be the first.")}
              </p>
              <Link href="/problems" className="mt-2 inline-block text-brand hover:underline">
                {t("Browse problems →")}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
