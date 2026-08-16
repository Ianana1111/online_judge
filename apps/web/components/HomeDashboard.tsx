"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import DailyGoalRing from "@/components/DailyGoalRing";
import VerdictBadge from "@/components/VerdictBadge";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import { stripProblemNumber } from "@/lib/problemTitle";
import {
  ACHIEVEMENT_ICONS,
  BookOpenIcon,
  CalendarCheckIcon,
  CloudSunIcon,
  FlameIcon,
  LayersIcon,
  MedalIcon,
  MoonIcon,
  RocketIcon,
  SnowflakeIcon,
  SparklesIcon,
  SunIcon,
  SunsetIcon,
  TrophyIcon,
} from "@/components/icons";
import type {
  Achievement,
  DailyProblem,
  DailyStats,
  LeaderboardRow,
  RecommendedProblems,
  SubmissionListItem,
  UserProfile,
  UserStats,
} from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const REASON_ICON = { collection: BookOpenIcon, consolidate: LayersIcon, stretch: RocketIcon } as const;
const REASON_ACCENT = {
  collection: "border-l-sky-400/70",
  consolidate: "border-l-brand/70",
  stretch: "border-l-verdict-wa/70",
} as const;

const RANK_MEDAL_CLASS: Record<number, string> = { 1: "text-yellow-400", 2: "text-slate-300", 3: "text-amber-600" };

type Translate = ReturnType<typeof useT>;

function greeting(handle: string, t: Translate) {
  const hour = new Date().getHours();
  const part =
    hour < 5 ? t("Still up") : hour < 12 ? t("Good morning") : hour < 18 ? t("Good afternoon") : t("Good evening");
  const Icon = hour < 5 ? MoonIcon : hour < 12 ? SunIcon : hour < 18 ? CloudSunIcon : SunsetIcon;
  return { text: `${part}, ${handle}`, Icon };
}

function timeAgo(iso: string, t: Translate): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return t("just now");
  if (min < 60) return t("{n}m ago", { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t("{n}h ago", { n: hr });
  const day = Math.floor(hr / 24);
  if (day < 30) return t("{n}d ago", { n: day });
  return new Date(iso).toLocaleDateString();
}

/** Filled stars in brand color + dimmed stars for the remainder of the 1–4 scale, so a tier or
 * problem's difficulty reads at a glance instead of needing the count spelled out. */
function DifficultyStars({ d }: { d: number }) {
  return (
    <span className="font-mono text-xs">
      <span className="text-brand">{"★".repeat(d)}</span>
      <span className="text-ink-700">{"★".repeat(Math.max(0, 4 - d))}</span>
    </span>
  );
}

/** One cell of the hero's stat strip — big tabular number, small uppercase label underneath. */
function StatCell({ value, label, valueClassName = "text-ink-50" }: { value: ReactNode; label: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-ink-900/60 px-3 py-3.5 text-center">
      <span className={`font-display text-xl font-bold tabular-nums ${valueClassName}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-ink-500">{label}</span>
    </div>
  );
}

/** The streak's visual size/intensity grows with its length — a small ember for a fresh streak, a
 * full blaze past a month — so "keep it alive" reads as a stake worth protecting, not just a
 * number next to a flame icon. A frozen day shows as a cool-toned snowflake instead of the warm
 * "at risk" red, since it's already protected — nothing left to worry about today. */
function StreakFlame({ streak, atRisk, frozenToday }: { streak: number; atRisk: boolean; frozenToday: boolean }) {
  const t = useT();
  if (streak <= 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        <FlameIcon className="h-6 w-6 text-ink-700" />
        <span className="text-[10px] uppercase tracking-wide text-ink-600">{t("no streak yet")}</span>
      </div>
    );
  }
  const size = streak >= 30 ? "h-10 w-10" : streak >= 7 ? "h-8 w-8" : "h-6 w-6";
  if (frozenToday) {
    return (
      <div className="flex flex-col items-center gap-1">
        <SnowflakeIcon className={`${size} text-sky-400`} />
        <span className="font-display font-bold tabular-nums text-sky-400">{streak}</span>
        <span className="text-[10px] uppercase tracking-wide text-ink-500">{t("protected today")}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <FlameIcon className={`${size} text-verdict-tle ${atRisk ? "animate-pulse-soft" : ""}`} />
      <span className={`font-display font-bold tabular-nums ${atRisk ? "text-verdict-wa" : "text-verdict-tle"}`}>{streak}</span>
      <span className="text-[10px] uppercase tracking-wide text-ink-500">{atRisk ? t("at risk today") : t("day streak")}</span>
    </div>
  );
}

/** Offered only when there's actually something to protect (atRisk) and the user has one in
 * stock — spends it via POST /users/me/streak-freeze and refetches daily() so the flame/ring
 * above flip to the "protected today" state immediately. */
function StreakFreezeButton({ freezeCount }: { freezeCount: number }) {
  const t = useT();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => apiFetch("/users/me/streak-freeze", { method: "POST" }),
    onSuccess: () => {
      setError(null);
      qc.invalidateQueries({ queryKey: ["daily"] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : t("Couldn't use a freeze — try again.")),
  });

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        title={t("Life gets busy — spend one to keep your streak alive today without solving anything.")}
        className="inline-flex items-center gap-1.5 rounded border border-sky-400/40 bg-sky-400/10 px-2.5 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-400/20 disabled:opacity-50"
      >
        <SnowflakeIcon className="h-3.5 w-3.5" />
        {mutation.isPending ? t("Using…") : t("Use a freeze ({n} left)", { n: freezeCount })}
      </button>
      {error && <p className="max-w-[160px] text-center text-[10px] text-verdict-wa">{error}</p>}
    </div>
  );
}

/** The same problem for every visitor, all day (see problems.service.dailyPick) — a shared "did you
 * do today's?" reference point rather than a personal recommendation, which is what the separate
 * "Recommended for you" section below is already for. */
function DailyProblemCard({ problem }: { problem: DailyProblem }) {
  const t = useT();
  return (
    <div className="oj-card relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ background: "radial-gradient(circle at 90% 10%, rgb(var(--brand)) 0%, transparent 55%)" }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
            <SparklesIcon className="h-3.5 w-3.5" /> {t("Today's problem")}
          </div>
          <Link href={`/problems/${problem.slug}`} className="mt-1.5 block truncate font-display text-lg font-bold text-ink-50 hover:text-brand">
            {problem.uvaId != null && <span className="mr-1.5 font-mono text-sm font-normal text-ink-500">#{problem.uvaId}</span>}
            {stripProblemNumber(problem.title, problem.uvaId)}
          </Link>
          <div className="mt-1.5 flex items-center gap-2">
            <DifficultyStars d={problem.difficulty} />
            {problem.tags.slice(0, 2).map((t) => (
              <span key={t} className="rounded border border-ink-700 bg-ink-800/60 px-1.5 py-0.5 text-[11px] text-ink-400">
                {t}
              </span>
            ))}
          </div>
        </div>
        {problem.solvedByMe ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded border border-verdict-ac/40 bg-verdict-ac/10 px-3 py-1.5 text-xs font-medium text-verdict-ac">
            ✓ {t("Solved")}
          </span>
        ) : (
          <Link href={`/problems/${problem.slug}`} className="oj-btn-primary shrink-0 px-3 py-1.5 text-xs">
            {t("Solve it →")}
          </Link>
        )}
      </div>
    </div>
  );
}

/** Compact GitHub-style heatmap scoped to the last ~10 weeks (the full-year version on the profile
 * page is the right call there, but would dwarf everything else crammed onto the homepage). */
function MiniHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const t = useT();
  const WEEKS = 10;
  const byDate = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, count: byDate.get(iso) ?? 0 });
  }
  const lead = new Date(days[0].date).getDay();
  const leading: ({ date: string; count: number } | null)[] = Array.from({ length: lead }, () => null);
  const padded: ({ date: string; count: number } | null)[] = leading.concat(days);
  const weeks: (typeof padded)[] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
  const max = Math.max(1, ...days.map((d) => d.count));

  function level(count: number): string {
    if (count <= 0) return "bg-ink-800";
    const ratio = count / max;
    if (ratio > 0.75) return "bg-brand";
    if (ratio > 0.5) return "bg-brand/75";
    if (ratio > 0.25) return "bg-brand/50";
    return "bg-brand/25";
  }

  return (
    <div className="inline-flex gap-[3px]">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day, di) =>
            day ? (
              <div
                key={di}
                title={t("{date}: {count} submissions", { date: day.date, count: day.count })}
                className={`h-[11px] w-[11px] rounded-sm ${level(day.count)}`}
              />
            ) : (
              <div key={di} className="h-[11px] w-[11px]" />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/** Shown instead of the logged-out hero once a session is confirmed — the homepage's job for a
 * returning user is "get me back into solving," not re-pitching what the site is. */
export default function HomeDashboard() {
  const t = useT();
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
  // Public endpoint (same problem for everyone), but only worth fetching once there's a
  // logged-in dashboard to show it on.
  const { data: dailyProblem } = useQuery({
    queryKey: ["daily-problem"],
    queryFn: () => apiFetch<DailyProblem>("/problems/daily"),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
  const { data: recent } = useQuery({
    queryKey: ["recent-submissions"],
    queryFn: () => apiFetch<{ items: SubmissionListItem[] }>("/submissions?user=me&pageSize=5"),
    enabled: !!user,
  });
  // Same queryKey OnboardingChecklist uses for the same handle, so react-query dedupes the two
  // components down to a single network request instead of firing it twice on this page.
  const { data: profile } = useQuery({
    queryKey: ["users", user?.handle, "profile"],
    queryFn: () => apiFetch<UserProfile>(`/users/${user!.handle}`),
    enabled: !!user,
  });
  const { data: achievements } = useQuery({
    queryKey: ["achievements", user?.handle],
    queryFn: () => apiFetch<Achievement[]>(`/achievements/${user!.handle}`),
    enabled: !!user,
  });
  const { data: stats } = useQuery({
    queryKey: ["users", user?.handle, "stats"],
    queryFn: () => apiFetch<UserStats>(`/users/${user!.handle}/stats`),
    enabled: !!user,
  });
  const { data: weekBoard } = useQuery({
    queryKey: ["leaderboard", "week", "all"],
    queryFn: () => apiFetch<LeaderboardRow[]>("/leaderboard?period=week&scope=all"),
    enabled: !!user,
    staleTime: 60_000,
  });

  if (!user) return null;

  const latestAchievement = achievements?.length
    ? [...achievements].sort((a, b) => +new Date(b.earnedAt) - +new Date(a.earnedAt))[0]
    : null;
  const myRank = weekBoard?.find((r) => r.handle === user.handle)?.rank ?? null;

  const suggestions = [
    ...(recommended?.collectionNext
      ? [
          {
            ...recommended.collectionNext,
            kind: "collection" as const,
            reason: t("Next in {collection}", { collection: recommended.collectionNext.collectionTitle }),
          },
        ]
      : []),
    ...(recommended?.consolidate ?? []).map((p) => ({ ...p, kind: "consolidate" as const, reason: t("Build your tier") })),
    ...(recommended?.stretch ? [{ ...recommended.stretch, kind: "stretch" as const, reason: t("Stretch — one tier up") }] : []),
  ].slice(0, 4);

  const { text: greetText, Icon: GreetIcon } = greeting(user.handle, t);

  return (
    <div className="space-y-6 py-6">
      <OnboardingChecklist />

      <div className="oj-card relative overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ background: "radial-gradient(circle at 12% 15%, rgb(var(--brand)) 0%, transparent 50%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ background: "radial-gradient(circle at 95% 85%, rgb(var(--verdict-ac)) 0%, transparent 45%)" }}
        />

        <div className="relative flex flex-wrap items-center gap-6">
          <DailyGoalRing solvedToday={daily?.solvedToday ?? 0} goal={daily?.goal ?? 1} />
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-50">
              {greetText} <GreetIcon className="h-5 w-5 text-brand" />
            </h1>
            {latestAchievement ? (
              <Link href={`/u/${user.handle}`} className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline">
                <TrophyIcon className="h-3.5 w-3.5" /> {t("Latest: {title}", { title: latestAchievement.title })}
              </Link>
            ) : (
              <p className="mt-1 text-xs text-ink-500">{t("Ready to pick up where you left off?")}</p>
            )}
            {daily && daily.loginStreak > 1 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                <CalendarCheckIcon className="h-3.5 w-3.5 text-sky-400" />
                {t("{n} days in a row you've shown up", { n: daily.loginStreak })}
                {daily.loginMilestoneHit && t(" — bonus streak-freeze earned!")}
              </p>
            )}
            <Link
              href={suggestions[0] ? `/problems/${suggestions[0].slug}` : "/problems"}
              className="oj-btn-primary mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm"
            >
              {t("Continue solving")} <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="hidden flex-col items-center gap-2 sm:flex">
            <StreakFlame streak={daily?.currentStreak ?? 0} atRisk={!!daily?.atRisk} frozenToday={!!daily?.frozenToday} />
            {daily?.atRisk && daily.streakFreezeCount > 0 && <StreakFreezeButton freezeCount={daily.streakFreezeCount} />}
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 divide-x divide-ink-800 overflow-hidden rounded border border-ink-800 sm:grid-cols-4">
          <div className="sm:hidden">
            <StatCell
              value={
                daily && daily.currentStreak > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    {daily.frozenToday ? <SnowflakeIcon className="h-4 w-4" /> : <FlameIcon className="h-4 w-4" />} {daily.currentStreak}
                  </span>
                ) : (
                  "–"
                )
              }
              label={daily?.frozenToday ? t("protected today") : daily?.atRisk ? t("at risk today") : t("day streak")}
              valueClassName={
                daily?.frozenToday
                  ? "text-sky-400"
                  : daily?.atRisk
                    ? "text-verdict-wa animate-pulse-soft"
                    : daily && daily.currentStreak > 0
                      ? "text-verdict-tle"
                      : "text-ink-600"
              }
            />
          </div>
          <StatCell value={<DifficultyStars d={recommended?.tier ?? 1} />} label={t("current tier")} />
          <StatCell value={profile ? profile.solvedCount : "–"} label={t("solved")} />
          <StatCell
            value={
              myRank ? (
                <span className="inline-flex items-center gap-1">
                  <MedalIcon className={`h-4 w-4 ${RANK_MEDAL_CLASS[myRank] ?? "text-ink-500"}`} /> #{myRank}
                </span>
              ) : (
                "–"
              )
            }
            label={t("rank this week")}
            valueClassName={myRank && myRank <= 3 ? "text-verdict-tle" : "text-ink-50"}
          />
          <div className="hidden sm:block">
            <StatCell
              value={achievements ? achievements.length : "–"}
              label={t("achievements")}
              valueClassName="text-brand"
            />
          </div>
        </div>
      </div>

      {dailyProblem && <DailyProblemCard problem={dailyProblem} />}

      <div className="oj-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-200">{t("Recent activity")}</h2>
          <Link href="/submissions" className="text-xs text-ink-500 hover:text-brand">
            {t("view all →")}
          </Link>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="overflow-x-auto">
            {stats ? (
              <MiniHeatmap data={stats.heatmap} />
            ) : (
              <div className="h-[95px] w-[123px] animate-pulse rounded bg-ink-800/60" />
            )}
            <p className="mt-2 text-[11px] text-ink-500">{t("last 10 weeks")}</p>
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            {recent && recent.items.length > 0 ? (
              recent.items.map((s) => (
                <Link
                  key={s.id}
                  href={s.problemSlug ? `/problems/${s.problemSlug}` : "/submissions"}
                  className="flex items-center justify-between gap-3 rounded px-2 py-1.5 transition-colors hover:bg-ink-800/50"
                >
                  <span className="min-w-0 truncate text-sm text-ink-200">
                    {s.problemTitle ? stripProblemNumber(s.problemTitle) : t("Submission")}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-[10px] text-ink-500">{timeAgo(s.createdAt, t)}</span>
                    <VerdictBadge verdict={s.verdict} size="sm" />
                  </span>
                </Link>
              ))
            ) : (
              <p className="px-2 py-1.5 text-sm text-ink-400">
                {t("No submissions yet — solve something to light up your heatmap.")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="oj-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-200">{t("Recommended for you")}</h2>
          <Link href="/problems" className="text-xs text-ink-500 hover:text-brand">
            {t("browse all →")}
          </Link>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-sm text-ink-400">
            {t("No new recommendations yet —")}{" "}
            <Link href="/problems" className="text-brand hover:underline">
              {t("browse the problem list")}
            </Link>{" "}
            {t("to get started.")}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((p) => (
              <Link
                key={p.id}
                href={`/problems/${p.slug}`}
                className={`group oj-card border-l-2 p-4 transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-ink-800/40 ${REASON_ACCENT[p.kind]}`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                    {(() => {
                      const ReasonIcon = REASON_ICON[p.kind];
                      return <ReasonIcon className="h-4 w-4" />;
                    })()}
                  </div>
                  <DifficultyStars d={p.difficulty} />
                </div>
                <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-500">{p.reason}</p>
                <h3 className="text-sm font-medium text-ink-50 group-hover:text-brand">{stripProblemNumber(p.title)}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>

      {achievements && achievements.length > 0 && (
        <div className="oj-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-200">{t("Trophy case")}</h2>
            <Link href={`/u/${user.handle}`} className="text-xs text-ink-500 hover:text-brand">
              {t("view profile →")}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <div
                key={a.code}
                title={t("{title} — {description} ({date})", {
                  title: a.title,
                  description: a.description,
                  date: new Date(a.earnedAt).toLocaleDateString(),
                })}
                className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 py-1.5 pl-1.5 pr-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-brand">
                  {(() => {
                    const AchievementIcon = ACHIEVEMENT_ICONS[a.code] ?? TrophyIcon;
                    return <AchievementIcon className="h-4 w-4" />;
                  })()}
                </span>
                <span className="text-xs font-medium text-ink-100">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
