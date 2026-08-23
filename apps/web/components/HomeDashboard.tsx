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
  GraduationCapIcon,
  LayersIcon,
  MedalIcon,
  MoonIcon,
  RocketIcon,
  SnowflakeIcon,
  SunIcon,
  SunsetIcon,
  TrophyIcon,
} from "@/components/icons";
import type {
  Achievement,
  DailyStats,
  LeaderboardRow,
  RecommendedProblems,
  SubmissionListItem,
  UserProfile,
  UserStats,
} from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const REASON_ICON = { collection: BookOpenIcon, consolidate: LayersIcon, stretch: RocketIcon } as const;
// Fills the recommendation card's left accent stripe — one color per reason a problem was
// suggested, so the three kinds stay distinguishable without reading the label.
const REASON_ACCENT = {
  collection: "bg-verdict-pending/70",
  consolidate: "bg-brand/70",
  stretch: "bg-verdict-wa/70",
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
      <span className="text-ink-500">{"★".repeat(Math.max(0, 4 - d))}</span>
    </span>
  );
}

/** One tile of the hero's stat row — big tabular number over a small mono label. Free-standing
 * tiles separated by gaps rather than cells inside one bordered, divided grid: the divided version
 * read as a spreadsheet row bolted to the bottom of the card, which is most of what made the hero
 * feel boxy. */
function StatTile({ value, label, valueClassName = "text-ink-50" }: { value: ReactNode; label: string; valueClassName?: string }) {
  return (
    <div className="rounded-xl bg-ink-950/50 px-3 py-3.5 text-center">
      <div className={`font-display text-2xl font-bold leading-none tabular-nums ${valueClassName}`}>{value}</div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-500">{label}</div>
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
        <FlameIcon className="h-6 w-6 text-ink-500" />
        <span className="text-[10px] uppercase tracking-wide text-ink-400">{t("no streak yet")}</span>
      </div>
    );
  }
  const size = streak >= 30 ? "h-10 w-10" : streak >= 7 ? "h-8 w-8" : "h-6 w-6";
  if (frozenToday) {
    return (
      <div className="flex flex-col items-center gap-1">
        <SnowflakeIcon className={`${size} text-verdict-pending`} />
        <span className="font-display font-bold tabular-nums text-verdict-pending">{streak}</span>
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
        className="inline-flex items-center gap-1.5 rounded border border-verdict-pending/40 bg-verdict-pending/10 px-2.5 py-1.5 text-xs font-medium text-verdict-pending transition-colors hover:bg-verdict-pending/20 disabled:opacity-50"
      >
        <SnowflakeIcon className="h-3.5 w-3.5" />
        {mutation.isPending ? t("Using…") : t("Use a freeze ({n} left)", { n: freezeCount })}
      </button>
      {error && <p className="max-w-[160px] text-center text-[10px] text-verdict-wa">{error}</p>}
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

  const dailyQuery = useQuery({
    queryKey: ["daily"],
    queryFn: () => apiFetch<DailyStats>("/users/me/daily"),
    enabled: !!user,
  });
  const recommendedQuery = useQuery({
    queryKey: ["recommended"],
    queryFn: () => apiFetch<RecommendedProblems>("/problems/recommended"),
    enabled: !!user,
  });
  const recentQuery = useQuery({
    queryKey: ["recent-submissions"],
    queryFn: () => apiFetch<{ items: SubmissionListItem[] }>("/submissions?user=me&pageSize=5"),
    enabled: !!user,
  });
  // Same queryKey OnboardingChecklist uses for the same handle, so react-query dedupes the two
  // components down to a single network request instead of firing it twice on this page.
  const profileQuery = useQuery({
    queryKey: ["users", user?.handle, "profile"],
    queryFn: () => apiFetch<UserProfile>(`/users/${user!.handle}`),
    enabled: !!user,
  });
  const achievementsQuery = useQuery({
    queryKey: ["achievements", user?.handle],
    queryFn: () => apiFetch<Achievement[]>(`/achievements/${user!.handle}`),
    enabled: !!user,
  });
  const statsQuery = useQuery({
    queryKey: ["users", user?.handle, "stats"],
    queryFn: () => apiFetch<UserStats>(`/users/${user!.handle}/stats`),
    enabled: !!user,
  });
  const weekBoardQuery = useQuery({
    queryKey: ["leaderboard", "week", "all"],
    queryFn: () => apiFetch<LeaderboardRow[]>("/leaderboard?period=week&scope=all"),
    enabled: !!user,
    staleTime: 60_000,
  });
  const { data: daily } = dailyQuery;
  const { data: recommended } = recommendedQuery;
  const { data: recent } = recentQuery;
  const { data: profile } = profileQuery;
  const { data: achievements } = achievementsQuery;
  const { data: stats } = statsQuery;
  const { data: weekBoard } = weekBoardQuery;

  if (!user) return null;

  // Previously, a failed fetch on any of the 7 queries above just left that widget showing its
  // own "–" placeholder with nothing to say why — indistinguishable from "you have no data yet."
  // One shared banner instead of per-widget error UI: redesigning all 7 widgets individually for
  // this is a much larger change than the actual problem (an outage/cold-start being invisible)
  // calls for, and every one of them already has a working retry path (the query itself retries
  // once automatically, and React Query refetches on window refocus by default).
  const anyDashboardQueryFailed = [
    dailyQuery,
    recommendedQuery,
    recentQuery,
    profileQuery,
    achievementsQuery,
    statsQuery,
    weekBoardQuery,
  ].some((q) => q.isError);

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
  const hasTrophies = !!achievements && achievements.length > 0;

  return (
    <div className="space-y-8 py-6">
      {anyDashboardQueryFailed && (
        <div className="oj-card flex items-center justify-between gap-3 border-verdict-wa/30 bg-verdict-wa/5 px-4 py-2.5 text-sm">
          <span className="text-ink-200">{t("Some data on this page failed to load — try refreshing.")}</span>
        </div>
      )}
      {/* The hero is deliberately a different *kind* of surface from everything below it — wider
          radius, a brand-tinted hairline instead of the standard one, and a warm ambient wash that
          fades out rather than stopping at a hard edge. That contrast is what stops the page from
          reading as one uniform stack of identical boxes. */}
      <section className="relative overflow-hidden rounded-2xl border border-brand/20 bg-ink-900 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.11]"
          style={{ background: "radial-gradient(circle at 6% 0%, rgb(var(--brand)) 0%, transparent 58%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ background: "radial-gradient(circle at 100% 100%, rgb(var(--verdict-ac)) 0%, transparent 52%)" }}
        />

        <div className="relative flex flex-wrap items-center gap-6 sm:gap-8">
          <DailyGoalRing solvedToday={daily?.solvedToday ?? 0} goal={daily?.goal ?? 1} />
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <h1 className="flex items-center gap-2.5 font-display text-3xl font-bold tracking-tight text-ink-50">
              {greetText} <GreetIcon className="h-6 w-6 text-brand" />
            </h1>
            {/* Only a verified school appears — an unconfirmed claim gets no badge anywhere, same
                rule the public profile and leaderboard follow. */}
            {user.school && user.schoolVerifiedAt && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-verdict-ac/30 bg-verdict-ac/5 px-2.5 py-0.5 text-xs text-verdict-ac">
                <GraduationCapIcon className="h-3.5 w-3.5" />
                {user.school}
              </span>
            )}
            {latestAchievement ? (
              <Link href={`/u/${user.handle}`} className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline">
                <TrophyIcon className="h-3.5 w-3.5" /> {t("Latest: {title}", { title: latestAchievement.title })}
              </Link>
            ) : (
              <p className="mt-1 text-xs text-ink-500">{t("Ready to pick up where you left off?")}</p>
            )}
            {daily && daily.loginStreak > 1 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                <CalendarCheckIcon className="h-3.5 w-3.5 text-verdict-pending" />
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

        <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="sm:hidden">
            <StatTile
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
                  ? "text-verdict-pending"
                  : daily?.atRisk
                    ? "text-verdict-wa animate-pulse-soft"
                    : daily && daily.currentStreak > 0
                      ? "text-verdict-tle"
                      : "text-ink-400"
              }
            />
          </div>
          <StatTile value={<DifficultyStars d={recommended?.tier ?? 1} />} label={t("current tier")} />
          <StatTile value={profile ? profile.solvedCount : "–"} label={t("solved")} />
          <StatTile
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
            <StatTile
              value={achievements ? achievements.length : "–"}
              label={t("achievements")}
              valueClassName="text-brand"
            />
          </div>
        </div>
      </section>

      {/* Your log and your trophies sit side by side on a wide screen; the log takes the wider
          share since it's the one with real content in it. With nothing earned yet the trophy
          panel is dropped entirely rather than left as an empty third. */}
      <div className={`grid gap-5 ${hasTrophies ? "lg:grid-cols-3 lg:items-start" : ""}`}>
        <div className={`oj-panel p-5 ${hasTrophies ? "lg:col-span-2" : ""}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink-50">{t("Recent activity")}</h2>
            <Link href="/submissions" className="text-xs text-ink-500 transition-colors hover:text-brand">
              {t("view all →")}
            </Link>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="overflow-x-auto">
              {stats ? (
                <MiniHeatmap data={stats.heatmap} />
              ) : (
                <div className="h-[95px] w-[123px] animate-pulse rounded-lg bg-ink-800/60" />
              )}
              <p className="mt-2.5 font-mono text-[10px] uppercase tracking-widest text-ink-500">{t("last 10 weeks")}</p>
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              {recent && recent.items.length > 0 ? (
                recent.items.map((s) => (
                  <Link
                    key={s.id}
                    href={s.problemSlug ? `/problems/${s.problemSlug}` : "/submissions"}
                    className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-ink-800/60"
                  >
                    <span className="min-w-0 truncate text-sm text-ink-200">
                      {s.problemTitle ? stripProblemNumber(s.problemTitle) : t("Submission")}
                    </span>
                    <span className="flex shrink-0 items-center gap-2.5">
                      <span className="font-mono text-[10px] text-ink-500">{timeAgo(s.createdAt, t)}</span>
                      <VerdictBadge verdict={s.verdict} size="sm" />
                    </span>
                  </Link>
                ))
              ) : (
                <p className="px-2.5 py-2 text-sm text-ink-400">
                  {t("No submissions yet — solve something to light up your heatmap.")}
                </p>
              )}
            </div>
          </div>
        </div>

        {hasTrophies && (
          <div className="oj-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink-50">{t("Trophy case")}</h2>
              <Link href={`/u/${user.handle}`} className="text-xs text-ink-500 transition-colors hover:text-brand">
                {t("view profile →")}
              </Link>
            </div>
            <div className="space-y-1.5">
              {achievements.map((a) => (
                <div
                  key={a.code}
                  title={t("{title} — {description} ({date})", {
                    title: a.title,
                    description: a.description,
                    date: new Date(a.earnedAt).toLocaleDateString(),
                  })}
                  className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/5 px-3 py-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-950/60 text-brand">
                    {(() => {
                      const AchievementIcon = ACHIEVEMENT_ICONS[a.code] ?? TrophyIcon;
                      return <AchievementIcon className="h-4 w-4" />;
                    })()}
                  </span>
                  <span className="min-w-0 truncate text-xs font-medium text-ink-100">{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deliberately NOT wrapped in a panel: the heading sits on the page itself and the problem
          cards are the only boxes here. Alternating between boxed regions and bare ones is what
          gives the page a rhythm instead of a uniform grid of outlined rectangles. */}
      <div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-50">{t("Recommended for you")}</h2>
            <p className="mt-0.5 text-xs text-ink-500">{t("Picked from where you are right now.")}</p>
          </div>
          <Link href="/problems" className="shrink-0 text-xs text-ink-500 transition-colors hover:text-brand">
            {t("browse all →")}
          </Link>
        </div>
        {suggestions.length === 0 ? (
          <p className="oj-panel p-5 text-sm text-ink-400">
            {t("No new recommendations yet —")}{" "}
            <Link href="/problems" className="text-brand hover:underline">
              {t("browse the problem list")}
            </Link>{" "}
            {t("to get started.")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {suggestions.map((p) => (
              <Link
                key={p.id}
                href={`/problems/${p.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-ink-800 bg-ink-900/70 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:bg-ink-900"
              >
                {/* The accent stripe encodes *why* this problem is here (collection / consolidate /
                    stretch), so the three kinds stay tellable apart at a glance. */}
                <span className={`absolute inset-y-0 left-0 w-[3px] ${REASON_ACCENT[p.kind]}`} />
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                    {(() => {
                      const ReasonIcon = REASON_ICON[p.kind];
                      return <ReasonIcon className="h-4 w-4" />;
                    })()}
                  </div>
                  <DifficultyStars d={p.difficulty} />
                </div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-500">{p.reason}</p>
                <h3 className="text-sm font-medium leading-snug text-ink-50 transition-colors group-hover:text-brand">
                  {stripProblemNumber(p.title)}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Fixed to the right edge, so it's outside the page flow — rendered last only to reflect
          that it overlays the dashboard rather than occupying a slot in it. */}
      <OnboardingChecklist />
    </div>
  );
}
