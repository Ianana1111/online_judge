"use client";

import type { Achievement, ProblemListResponse, UserProfile, UserStats } from "@/lib/types";
import Heatmap, { computeMaxStreak } from "@/components/Heatmap";
import StatChartsLoader from "@/components/StatChartsLoader";
import SolvedRing from "@/components/SolvedRing";
import Avatar from "@/components/Avatar";
import { ACHIEVEMENT_ICONS, FlameIcon, TrophyIcon } from "@/components/icons";
import { useT } from "@/lib/i18n/LocaleContext";

const DIFFICULTY_TIERS = [1, 2, 3, 4];

export default function UserProfileClient({
  profile,
  stats,
  problemList,
  achievements,
}: {
  profile: UserProfile;
  stats: UserStats | null;
  problemList: ProblemListResponse | null;
  achievements: Achievement[] | null;
}) {
  const t = useT();
  const totalProblems = problemList?.total ?? 0;
  const solvedByDifficulty = new Map(stats?.solvedByDifficulty.map((d) => [d.difficulty, d.count]) ?? []);
  // computeMaxStreak walks actual calendar-day gaps rather than array position — `heatmap` only
  // contains days with count > 0, so two active days that aren't actually consecutive (e.g. Mon
  // and Thu, with a silent gap on Tue/Wed) must not count as a 2-day streak.
  const maxStreak = computeMaxStreak(stats?.heatmap ?? []);
  const hasAchievements = !!achievements && achievements.length > 0;

  return (
    <div className="space-y-8">
      <div className="oj-card relative overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ background: "radial-gradient(circle at 15% 20%, rgb(var(--brand)) 0%, transparent 55%)" }}
        />
        <div className="relative flex flex-wrap items-center gap-6">
          <SolvedRing solved={profile.solvedCount} total={totalProblems} />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Avatar avatarUrl={profile.avatarUrl} handle={profile.handle} size={56} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-3xl font-bold text-ink-50">{profile.handle}</h1>
                  {profile.plan === "PRO" && (
                    <span className="rounded border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-xs font-semibold text-brand">
                      Pro
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-400">
                  {t("Joined {date}", { date: new Date(profile.createdAt).toLocaleDateString() })}
                  {profile.school && <> · {profile.school}</>}
                </p>
              </div>
            </div>
            {profile.bio && <p className="mt-3 max-w-xl text-sm italic text-ink-300">"{profile.bio}"</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {DIFFICULTY_TIERS.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1.5 rounded border border-ink-700 bg-ink-800/60 px-2.5 py-1 font-mono text-xs text-ink-300"
                >
                  <span className="text-brand">{"★".repeat(d)}</span>
                  <span className="text-ink-500">{solvedByDifficulty.get(d) ?? 0}</span>
                </span>
              ))}
              {maxStreak > 0 && (
                <span className="flex items-center gap-1.5 rounded border border-verdict-tle/40 bg-verdict-tle/10 px-2.5 py-1 font-mono text-xs text-verdict-tle">
                  <FlameIcon className="h-3.5 w-3.5" /> {t("{n}d best streak", { n: maxStreak })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="oj-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink-200">{t("Activity")}</h2>
        <Heatmap handle={profile.handle} initialHeatmap={stats?.heatmap ?? []} joinDate={profile.createdAt} />
      </div>

      {/* Achievements left, the stat donut right — same two-surfaces-side-by-side pattern as
          HomeDashboard's hero/trophy layout, collapsing to one column when there are no
          achievements yet rather than leaving an empty slot beside the chart. */}
      <div className={`grid gap-5 ${hasAchievements ? "lg:grid-cols-2 lg:items-start" : ""}`}>
        {hasAchievements && (
          <div className="oj-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink-200">{t("Achievements")}</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {achievements!.map((a) => (
                <div
                  key={a.code}
                  className="flex items-start gap-2 rounded border border-brand/30 bg-brand/5 px-3 py-2"
                  title={new Date(a.earnedAt).toLocaleDateString()}
                >
                  <span className="text-brand">
                    {(() => {
                      const AchievementIcon = ACHIEVEMENT_ICONS[a.code] ?? TrophyIcon;
                      return <AchievementIcon className="h-5 w-5" />;
                    })()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-50">{a.title}</p>
                    <p className="text-xs text-ink-400">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats && <StatChartsLoader stats={stats} />}
      </div>
    </div>
  );
}
