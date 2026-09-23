"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { SkeletonList } from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import SchoolCombobox from "@/components/SchoolCombobox";
import { FlameIcon, TrophyIcon } from "@/components/icons";
import { UNVERIFIED_SCHOOL_FILTER } from "@oj/shared";
import type { LeaderboardRow } from "@/lib/types";
import { useLocale, useT } from "@/lib/i18n/LocaleContext";

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
  1: "bg-brand/[0.04]",
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

function LeaderboardPodium({ rows, ranking, currentHandle, zh }: { rows: LeaderboardRow[]; ranking: "solved" | "streak"; currentHandle?: string; zh: boolean }) {
  const top = rows.slice(0, 3);
  const slots = [
    { row: top[1], rank: 2, bar: "h-20 sm:h-24", tone: "border-ink-500/40 bg-gradient-to-b from-ink-400/15 to-ink-800/30", medal: "border-ink-400/40 bg-ink-400/10 text-ink-200" },
    { row: top[0], rank: 1, bar: "h-28 sm:h-36", tone: "border-brand/50 bg-gradient-to-b from-brand/30 to-brand/[0.06]", medal: "border-brand/50 bg-brand/15 text-brand" },
    { row: top[2], rank: 3, bar: "h-16 sm:h-20", tone: "border-[#cd7f32]/45 bg-gradient-to-b from-[#cd7f32]/20 to-[#cd7f32]/[0.04]", medal: "border-[#cd7f32]/50 bg-[#cd7f32]/10 text-[#d89552]" },
  ];
  return <section className="oj-card overflow-hidden px-3 pb-0 pt-5 sm:px-8 sm:pt-6" aria-label={zh ? "排行榜前三名" : "Leaderboard top three"}>
    <div className="mb-5 flex items-center justify-between gap-3 px-1 sm:mb-6">
      <div><p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-brand">TOP 3</p><h2 className="mt-1 text-lg font-semibold text-ink-100">{zh ? "本期領先者" : "Current leaders"}</h2></div>
      <p className="text-right text-xs text-ink-400">{ranking === "solved" ? (zh ? "依解題數排名" : "Ranked by solved") : (zh ? "依連續解題天數排名" : "Ranked by streak")}</p>
    </div>
    <div className="grid grid-cols-3 items-end gap-1.5 sm:gap-4">
      {slots.map(({ row, rank, bar, tone, medal }) => row ? <Link key={rank} href={`/u/${row.handle}`} className="group flex min-w-0 flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
        <div className="relative transition-transform duration-200 group-hover:-translate-y-1">
          <Avatar avatarUrl={row.avatarUrl} handle={row.handle} size={rank === 1 ? 56 : 44} />
          <span className={`absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border px-1 font-mono text-[10px] font-bold shadow ${medal}`}>{rank}</span>
        </div>
        <p className="mt-2 w-full truncate px-1 text-xs font-semibold text-ink-100 sm:text-sm">{row.handle}</p>
        <p className={`mb-2 mt-0.5 inline-flex items-center gap-1 font-mono text-xs font-semibold ${ranking === "streak" ? "text-verdict-tle" : "text-brand"}`}>
          {ranking === "streak" && <FlameIcon className="h-3 w-3" />}
          {ranking === "solved" ? `${row.solved} ${zh ? "題" : "solved"}` : `${row.streak}d`}
        </p>
        <div className={`${bar} ${tone} relative flex w-full items-start justify-center rounded-t-xl border-x border-t pt-3 transition-[filter] group-hover:brightness-110`}>
          <span className="font-display text-2xl font-bold text-ink-100/80 sm:text-3xl">{rank}</span>
          {row.handle === currentHandle && <span className="absolute bottom-2 rounded-full bg-brand px-2 py-0.5 text-[9px] font-semibold text-onbrand">{zh ? "你" : "YOU"}</span>}
        </div>
      </Link> : <div key={rank} aria-hidden />)}
    </div>
  </section>;
}

export default function LeaderboardPage() {
  const t = useT();
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  const [period, setPeriod] = useState<"all" | "week" | "month">("all");
  const [scope, setScope] = useState<"all" | "students">("all");
  const [ranking, setRanking] = useState<"solved" | "streak">("solved");
  const [school, setSchool] = useState<string | null>(null);
  const { user } = useAuthStore();

  const {
    data: rows,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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

  const topAtSchool =
    school && school !== UNVERIFIED_SCHOOL_FILTER && displayRows && displayRows.length > 0 ? displayRows[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{t("Leaderboard")}</h1>
        <p className="mt-1 text-sm text-ink-400">
          {ranking === "solved"
            ? t("Ranked by how many problems you've solved — grinding a lot beats grinding hard.")
            : t("Ranked by consecutive days with an accepted solution.")}
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
            <SchoolCombobox
              value={school === UNVERIFIED_SCHOOL_FILTER ? null : school}
              onChange={setSchool}
              placeholder={t("All schools")}
            />
          </div>
          <button
            type="button"
            onClick={() => setSchool((s) => (s === UNVERIFIED_SCHOOL_FILTER ? null : UNVERIFIED_SCHOOL_FILTER))}
            title={t("No school claimed, or claimed but not yet verified.")}
            className={
              school === UNVERIFIED_SCHOOL_FILTER ? "oj-btn-primary px-3 py-1.5 text-xs" : "oj-btn-secondary px-3 py-1.5 text-xs"
            }
          >
            {t("Unaffiliated")}
          </button>
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

      {!isLoading && displayRows && displayRows.length > 0 && <LeaderboardPodium rows={displayRows} ranking={ranking} currentHandle={user?.handle} zh={zh} />}

      {isLoading && <SkeletonList rows={8} />}

      {/* Previously the empty-state condition below (displayRows?.length === 0) was also `false`
          on error (undefined !== 0), so a failed fetch rendered nothing at all here — no table,
          no empty message, no indication anything was wrong. */}
      {isError && (
        <div className="oj-card flex flex-col items-center gap-2 p-6 text-center">
          <p className="text-sm text-ink-300">{t("Something went wrong")}</p>
          <button type="button" onClick={() => refetch()} className="oj-btn-secondary px-4 py-1.5 text-xs">
            {t("Try again")}
          </button>
        </div>
      )}

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
                <th className="!text-right">{ranking === "solved" ? t("Solved") : t("Streak")}</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r) => {
                const isMe = user?.handle === r.handle;
                return (
                  <tr key={r.handle} className={`${RANK_STYLE[r.rank] ?? ""} ${isMe ? "ring-1 ring-inset ring-brand" : ""}`}>
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
                          className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-verdict-tle"
                        >
                          <FlameIcon className="h-3.5 w-3.5" />
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
          ) : school === UNVERIFIED_SCHOOL_FILTER ? (
            <p>{t("Nobody unaffiliated has solved anything yet — be the first.")}</p>
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
