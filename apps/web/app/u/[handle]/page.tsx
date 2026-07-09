import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/serverApi";
import type { UserProfile, UserStats } from "@/lib/types";
import Heatmap from "@/components/Heatmap";
import StatCharts from "@/components/StatCharts";

export default async function DashboardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [profile, stats] = await Promise.all([
    serverFetch<UserProfile>(`/users/${handle}`),
    serverFetch<UserStats>(`/users/${handle}/stats`),
  ]);
  if (!profile) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{profile.handle}</h1>
        <p className="mt-1 text-sm text-ink-400">
          {profile.solvedCount} solved · joined {new Date(profile.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="oj-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink-200">Activity</h2>
        <Heatmap data={stats?.heatmap ?? []} />
      </div>

      {stats && <StatCharts stats={stats} />}
    </div>
  );
}
