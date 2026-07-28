import { notFound } from "next/navigation";
import { serverFetchAuthed } from "@/lib/serverApi";
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
  // solvedByMe and Pro-gated fields (cpeAppearances) depend on who's asking — plain serverFetch
  // never forwarded the session cookie, so every visitor (Pro or not, solved or not) got the
  // same anonymous response.
  const problem = await serverFetchAuthed<ProblemDetail>(`/problems/${slug}`);
  if (!problem) notFound();

  return <ProblemView problem={problem} contestId={contestId} />;
}
