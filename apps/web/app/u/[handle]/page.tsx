import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/serverApi";
import type { Achievement, ProblemListResponse, UserProfile, UserStats } from "@/lib/types";
import UserProfileClient from "@/components/UserProfileClient";

export default async function DashboardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [profile, stats, problemList, achievements] = await Promise.all([
    serverFetch<UserProfile>(`/users/${handle}`),
    serverFetch<UserStats>(`/users/${handle}/stats`),
    serverFetch<ProblemListResponse>(`/problems?pageSize=1`),
    serverFetch<Achievement[]>(`/achievements/${handle}`),
  ]);
  if (!profile) notFound();

  return <UserProfileClient profile={profile} stats={stats} problemList={problemList} achievements={achievements} />;
}
