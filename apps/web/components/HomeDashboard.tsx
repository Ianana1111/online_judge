"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import DailyGoalRing from "@/components/DailyGoalRing";
import VerdictBadge from "@/components/VerdictBadge";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import { stripProblemNumber } from "@/lib/problemTitle";
import type {
  Achievement,
  DailyStats,
  LeaderboardRow,
  RecommendedProblems,
  SubmissionListItem,
  UserProfile,
  UserStats,
} from "@/lib/types";

const REASON_ICON = { collection: "📚", consolidate: "🎯", stretch: "🚀" } as const;
const REASON_ACCENT = {
  collection: "border-l-sky-400/70",
  consolidate: "border-l-brand/70",
  stretch: "border-l-verdict-wa/70",
} as const;

const ACHIEVEMENT_ICON: Record<string, string> = {
  first_ac: "🎯",
  solved_10: "🌱",
  solved_50: "🌿",
  solved_100: "🌳",
  first_4star: "💎",
  streak_7: "🔥",
  streak_30: "⚡",
  collection_cleared: "🏆",
  first_virtual_exam: "📝",
};

const RANK_MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function greeting(handle: string) {
  const hour = new Date().getHours();
  const part = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const emoji = hour < 5 ? "🌙" : hour < 12 ? "☀️" : hour < 18 ? "🌤️" : "🌆";
  return { text: `${part}, ${handle}`, emoji };
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
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
 * number next to a fire emoji. */
function StreakFlame({ streak, atRisk }: { streak: number; atRisk: boolean }) {
  if (streak <= 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl grayscale opacity-40">🔥</span>
        <span className="text-[10px] uppercase tracking-wide text-ink-600">no streak yet</span>
      </div>
    );
  }
  const size = streak >= 30 ? "text-4xl" : streak >= 7 ? "text-3xl" : "text-2xl";
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`${size} ${atRisk ? "animate-pulse-soft" : ""}`}>🔥</span>
      <span className={`font-display font-bold tabular-nums ${atRisk ? "text-verdict-wa" : "text-verdict-tle"}`}>{streak}</span>
      <span className="text-[10px] uppercase tracking-wide text-ink-500">{atRisk ? "at risk today" : "day streak"}</span>
    </div>
  );
}

/** Compact GitHub-style heatmap scoped to the last ~10 weeks (the full-year version on the profile
 * page is the right call there, but would dwarf everything else crammed onto the homepage). */
function MiniHeatmap({ data }: { data: { date: string; count: number }[] }) {
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
                title={`${day.date}: ${day.count} submission${day.count === 1 ? "" : "s"}`}
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
      ? [{ ...recommended.collectionNext, kind: "collection" as const, reason: `Next in ${recommended.collectionNext.collectionTitle}` }]
      : []),
    ...(recommended?.consolidate ?? []).map((p) => ({ ...p, kind: "consolidate" as const, reason: "Build your tier" })),
    ...(recommended?.stretch ? [{ ...recommended.stretch, kind: "stretch" as const, reason: "Stretch — one tier up" }] : []),
  ].slice(0, 4);

  const { text: greetText, emoji: greetEmoji } = greeting(user.handle);

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
            <h1 className="font-display text-2xl font-bold text-ink-50">
              {greetText} <span className="align-middle">{greetEmoji}</span>
            </h1>
            {latestAchievement ? (
              <Link href={`/u/${user.handle}`} className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline">
                🏆 Latest: {latestAchievement.title}
              </Link>
            ) : (
              <p className="mt-1 text-xs text-ink-500">Ready to pick up where you left off?</p>
            )}
            <Link
              href={suggestions[0] ? `/problems/${suggestions[0].slug}` : "/problems"}
              className="oj-btn-primary mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm"
            >
              Continue solving <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="hidden sm:block">
            <StreakFlame streak={daily?.currentStreak ?? 0} atRisk={!!daily?.atRisk} />
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 divide-x divide-ink-800 overflow-hidden rounded border border-ink-800 sm:grid-cols-4">
          <div className="sm:hidden">
            <StatCell
              value={daily && daily.currentStreak > 0 ? `🔥 ${daily.currentStreak}` : "–"}
              label={daily?.atRisk ? "at risk today" : "day streak"}
              valueClassName={daily?.atRisk ? "text-verdict-wa animate-pulse-soft" : daily && daily.currentStreak > 0 ? "text-verdict-tle" : "text-ink-600"}
            />
          </div>
          <StatCell value={<DifficultyStars d={recommended?.tier ?? 1} />} label="current tier" />
          <StatCell value={profile ? profile.solvedCount : "–"} label="solved" />
          <StatCell
            value={myRank ? <span>{RANK_MEDAL[myRank] ?? "🏅"} #{myRank}</span> : "–"}
            label="rank this week"
            valueClassName={myRank && myRank <= 3 ? "text-verdict-tle" : "text-ink-50"}
          />
          <div className="hidden sm:block">
            <StatCell
              value={achievements ? achievements.length : "–"}
              label="achievements"
              valueClassName="text-brand"
            />
          </div>
        </div>
      </div>

      <div className="oj-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-200">Recent activity</h2>
          <Link href="/submissions" className="text-xs text-ink-500 hover:text-brand">
            view all →
          </Link>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="overflow-x-auto">
            {stats ? (
              <MiniHeatmap data={stats.heatmap} />
            ) : (
              <div className="h-[95px] w-[123px] animate-pulse rounded bg-ink-800/60" />
            )}
            <p className="mt-2 text-[11px] text-ink-500">last 10 weeks</p>
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
                    {s.problemTitle ? stripProblemNumber(s.problemTitle) : "Submission"}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-[10px] text-ink-500">{timeAgo(s.createdAt)}</span>
                    <VerdictBadge verdict={s.verdict} size="sm" />
                  </span>
                </Link>
              ))
            ) : (
              <p className="px-2 py-1.5 text-sm text-ink-400">No submissions yet — solve something to light up your heatmap.</p>
            )}
          </div>
        </div>
      </div>

      <div className="oj-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-200">Recommended for you</h2>
          <Link href="/problems" className="text-xs text-ink-500 hover:text-brand">
            browse all →
          </Link>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-sm text-ink-400">
            No new recommendations yet —{" "}
            <Link href="/problems" className="text-brand hover:underline">
              browse the problem list
            </Link>{" "}
            to get started.
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm text-brand">
                    {REASON_ICON[p.kind]}
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
            <h2 className="text-sm font-semibold text-ink-200">Trophy case</h2>
            <Link href={`/u/${user.handle}`} className="text-xs text-ink-500 hover:text-brand">
              view profile →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <div
                key={a.code}
                title={`${a.title} — ${a.description} (${new Date(a.earnedAt).toLocaleDateString()})`}
                className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 py-1.5 pl-1.5 pr-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-base">
                  {ACHIEVEMENT_ICON[a.code] ?? "🏆"}
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
