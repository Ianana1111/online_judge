import { notFound } from "next/navigation";
import { serverFetch, serverFetchDetailed } from "@/lib/serverApi";
import type { Achievement, ProblemListResponse, UserProfile, UserStats } from "@/lib/types";
import UserProfileClient from "@/components/UserProfileClient";

export default async function DashboardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [profileResult, stats, problemList, achievements] = await Promise.all([
    serverFetchDetailed<UserProfile>(`/users/${handle}`),
    serverFetch<UserStats>(`/users/${handle}/stats`),
    serverFetch<ProblemListResponse>(`/problems?pageSize=1`),
    serverFetch<Achievement[]>(`/achievements/${handle}`),
  ]);
  // A real 404 (no such handle) is the only case that should render as "this page doesn't
  // exist" — a shared profile link caught mid-cold-start previously 404'd on any API failure.
  if (!profileResult.ok) {
    if (profileResult.notFound) notFound();
    throw new Error(`Failed to load profile "${handle}"`);
  }

  return (
    <UserProfileClient profile={profileResult.data} stats={stats} problemList={problemList} achievements={achievements} />
  );
}
