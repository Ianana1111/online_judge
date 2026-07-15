"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import DailyGoalRing from "@/components/DailyGoalRing";
import VerdictBadge from "@/components/VerdictBadge";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import type { Achievement, DailyStats, RecommendedProblems, SubmissionListItem, UserProfile } from "@/lib/types";

const REASON_ICON = { collection: "📚", consolidate: "🎯", stretch: "🚀" } as const;

function greeting(handle: string) {
  const hour = new Date().getHours();
  const part = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${handle}`;
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

  if (!user) return null;

  const latestAchievement = achievements?.length
    ? [...achievements].sort((a, b) => +new Date(b.earnedAt) - +new Date(a.earnedAt))[0]
    : null;

  const suggestions = [
    ...(recommended?.collectionNext
      ? [{ ...recommended.collectionNext, kind: "collection" as const, reason: `Next in ${recommended.collectionNext.collectionTitle}` }]
      : []),
    ...(recommended?.consolidate ?? []).map((p) => ({ ...p, kind: "consolidate" as const, reason: "Build your tier" })),
    ...(recommended?.stretch ? [{ ...recommended.stretch, kind: "stretch" as const, reason: "Stretch — one tier up" }] : []),
  ].slice(0, 4);

  return (
    <div className="space-y-6 py-6">
      <OnboardingChecklist />

      <div className="oj-card relative overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ background: "radial-gradient(circle at 15% 20%, rgb(var(--brand)) 0%, transparent 55%)" }}
        />
        <div className="relative flex flex-wrap items-center gap-6">
          <DailyGoalRing solvedToday={daily?.solvedToday ?? 0} goal={daily?.goal ?? 1} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold text-ink-50">{greeting(user.handle)}</h1>

            <div className="mt-3 flex flex-wrap gap-2">
              {daily && daily.currentStreak > 0 ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-xs ${
                    daily.atRisk
                      ? "animate-pulse-soft border-verdict-wa/40 bg-verdict-wa/10 text-verdict-wa"
                      : "border-verdict-tle/40 bg-verdict-tle/10 text-verdict-tle"
                  }`}
                >
                  🔥 {daily.currentStreak}d streak{daily.atRisk ? " — solve today" : ""}
                </span>
              ) : (
                <span className="rounded border border-ink-700 bg-ink-800/60 px-2.5 py-1 font-mono text-xs text-ink-400">
                  Solve today to start a streak
                </span>
              )}
              {recommended && (
                <span className="inline-flex items-center gap-1.5 rounded border border-ink-700 bg-ink-800/60 px-2.5 py-1 font-mono text-xs text-ink-300">
                  <DifficultyStars d={recommended.tier} />
                  <span className="text-ink-500">current tier</span>
                </span>
              )}
              {profile && (
                <span className="rounded border border-ink-700 bg-ink-800/60 px-2.5 py-1 font-mono text-xs text-ink-300">
                  <span className="font-semibold text-ink-50">{profile.solvedCount}</span>{" "}
                  <span className="text-ink-500">solved</span>
                </span>
              )}
              {latestAchievement && (
                <Link
                  href={`/u/${user.handle}`}
                  className="inline-flex items-center gap-1.5 rounded border border-brand/30 bg-brand/5 px-2.5 py-1 font-mono text-xs text-brand transition-colors hover:bg-brand/10"
                >
                  🏆 {latestAchievement.title}
                </Link>
              )}
            </div>

            {recent && recent.items.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-500">Recent:</span>
                {recent.items.slice(0, 5).map((s) => (
                  <VerdictBadge key={s.id} verdict={s.verdict} size="sm" />
                ))}
                <Link href="/submissions" className="ml-1 text-xs text-ink-500 hover:text-brand">
                  view all →
                </Link>
              </div>
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
                className="group oj-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-ink-800/40"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-500">
                    <span>{REASON_ICON[p.kind]}</span>
                    {p.reason}
                  </span>
                  <DifficultyStars d={p.difficulty} />
                </div>
                <h3 className="text-sm font-medium text-ink-50 group-hover:text-brand">{p.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
