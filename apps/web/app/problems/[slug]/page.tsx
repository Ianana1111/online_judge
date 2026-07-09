import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/serverApi";
import type { ProblemDetail } from "@/lib/types";
import ProblemView from "@/components/ProblemView";

export default async function ProblemPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ contestId?: string }>;
}) {
  const { slug } = await params;
  const { contestId } = await searchParams;
  const problem = await serverFetch<ProblemDetail>(`/problems/${slug}`);
  if (!problem) notFound();

  return <ProblemView problem={problem} contestId={contestId} />;
}
