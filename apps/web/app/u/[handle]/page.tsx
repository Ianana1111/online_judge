import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch, serverFetchDetailed } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { Achievement, ProblemListResponse, UserProfile, UserStats } from "@/lib/types";
import UserProfileClient from "@/components/UserProfileClient";

// Without this, every public profile shared out (Discord, group chats, etc.) previewed as the
// generic homepage — the whole point of a public profile link is showing who it is and what
// they've done before anyone even clicks it.
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const profile = await serverFetch<UserProfile>(`/users/${handle}`);
  if (!profile) return {};

  const title = `${profile.handle} — judge.tw`;
  const description = profile.bio
    ? profile.bio
    : `${profile.solvedCount} problems solved on judge.tw${profile.school ? ` · ${profile.school}` : ""}`;
  const url = `${SITE_URL}/u/${profile.handle}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // No og:image: avatarUrl is a base64 data: URI (see the User.avatarUrl schema comment), which
    // OG crawlers can't fetch as an image URL — including it here would silently do nothing.
    openGraph: { type: "profile", title, description, url },
    twitter: { card: "summary", title, description },
  };
}

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
