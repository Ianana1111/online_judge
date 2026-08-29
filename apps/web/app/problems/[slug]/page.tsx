import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch, serverFetchAuthedDetailed } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonLd";
import { previewText } from "@/lib/textPreview";
import { stripProblemNumber } from "@/lib/problemTitle";
import type { ProblemDetail } from "@/lib/types";
import ProblemView from "@/components/ProblemView";
import StatementRenderer from "@/components/StatementRenderer";

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
  const result = await serverFetchAuthedDetailed<ProblemDetail>(`/problems/${slug}`);
  // A real 404 (the slug genuinely doesn't exist) is the only case that should render as "this
  // page doesn't exist" — any other failure (the API 5xx-ing, a cold-starting container's 502, a
  // dropped connection) previously collapsed to the same `null` and hit the same notFound(), so a
  // shared problem link caught mid-cold-start 404'd instead of showing a retryable error.
  if (!result.ok) {
    if (result.notFound) notFound();
    throw new Error(`Failed to load problem "${slug}"`);
  }
  const problem = result.data;

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      {/* Fixed to exactly one viewport (56px navbar + the root <main>'s 3rem of py-6) so the page
          itself never scrolls — ProblemView's fullHeight mode gives the left/right panes their own
          independent scrolling instead. Same h-[calc(100vh-56px-3rem)] convention already used by
          app/upgrade/checkout/page.tsx. */}
      <div className="h-[calc(100vh-56px-3rem)] overflow-hidden">
        <ProblemView
          problem={problem}
          contestId={contestId}
          statementNode={<StatementRenderer content={problem.statementMd} />}
          inputSpecNode={problem.inputSpecMd ? <StatementRenderer content={problem.inputSpecMd} /> : null}
          outputSpecNode={problem.outputSpecMd ? <StatementRenderer content={problem.outputSpecMd} /> : null}
          fullHeight
        />
      </div>
    </>
  );
}
