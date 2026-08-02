import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch, serverFetchAuthed } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import { previewText } from "@/lib/textPreview";
import { stripProblemNumber } from "@/lib/problemTitle";
import type { ProblemDetail } from "@/lib/types";
import ProblemView from "@/components/ProblemView";

// Metadata must reflect the same page for every visitor (search engines don't have a session), so
// this uses the public serverFetch rather than the authed one the page body uses for
// solvedByMe/cpeAppearances — Next dedupes identical fetches within a request, so this doesn't add
// a second round-trip beyond what the authed call already needs.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const problem = await serverFetch<ProblemDetail>(`/problems/${slug}`);
  if (!problem) return {};

  const title = stripProblemNumber(problem.title, problem.uvaId);
  const description = previewText(problem.statementMd, 160);
  const url = `${SITE_URL}/problems/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: stripProblemNumber(problem.title, problem.uvaId),
    description: previewText(problem.statementMd, 300),
    url: `${SITE_URL}/problems/${slug}`,
    learningResourceType: "Programming problem",
    educationalLevel: "★".repeat(problem.difficulty),
    isAccessibleForFree: true,
    ...(problem.tags.length > 0 ? { keywords: problem.tags.join(", ") } : {}),
    ...(problem.sourceUrl ? { isBasedOn: problem.sourceUrl } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProblemView problem={problem} contestId={contestId} />
    </>
  );
}
