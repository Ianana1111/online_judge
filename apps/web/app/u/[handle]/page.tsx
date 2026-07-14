import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/serverApi";
import type { ProblemListResponse, UserProfile, UserStats } from "@/lib/types";
import Heatmap from "@/components/Heatmap";
import StatChartsLoader from "@/components/StatChartsLoader";
import SolvedRing from "@/components/SolvedRing";

const DIFFICULTY_TIERS = [1, 2, 3, 4];

export default async function DashboardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [profile, stats, problemList] = await Promise.all([
    serverFetch<UserProfile>(`/users/${handle}`),
    serverFetch<UserStats>(`/users/${handle}/stats`),
    serverFetch<ProblemListResponse>(`/problems?pageSize=1`),
  ]);
  if (!profile) notFound();

  const totalProblems = problemList?.total ?? 0;
  const solvedByDifficulty = new Map(stats?.solvedByDifficulty.map((d) => [d.difficulty, d.count]) ?? []);
  const maxStreak = stats?.heatmap.reduce(
    (best, cur) => {
      if (cur.count > 0) {
        best.running += 1;
        best.max = Math.max(best.max, best.running);
      } else {
        best.running = 0;
      }
      return best;
    },
    { running: 0, max: 0 },
  ).max ?? 0;

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
            <h1 className="font-display text-3xl font-bold text-ink-50">{profile.handle}</h1>
            <p className="mt-1 text-sm text-ink-400">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>

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
                  🔥 {maxStreak}d best streak
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="oj-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink-200">Activity</h2>
        <Heatmap data={stats?.heatmap ?? []} />
      </div>

      {stats && <StatChartsLoader stats={stats} />}
    </div>
  );
}
