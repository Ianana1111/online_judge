import type { Metadata } from "next";
import { serverFetch } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { ContestDetail } from "@/lib/types";
import ContestDetailClient from "@/components/ContestDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const contest = await serverFetch<ContestDetail>(`/contests/${id}`);
  if (!contest) return {};

  const title = contest.title;
  const description = `Take the ${contest.title} virtual exam — ${contest.problems.length} problems, ${contest.durationMin} minutes, same conditions as the real sitting.`;
  const url = `${SITE_URL}/contests/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ContestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContestDetailClient contestId={id} />;
}
