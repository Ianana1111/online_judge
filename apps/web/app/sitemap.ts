import type { MetadataRoute } from "next";
import { serverFetchDetailed } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { ProblemListResponse, CollectionListItem, PostListItem } from "@/lib/types";

// Crawlers re-fetch this on their own schedule; an hour of staleness on "did a new problem/post
// get added" is a non-issue, and it saves hammering the API every time a bot requests it.
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/problems", changeFrequency: "daily", priority: 0.9 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.8 },
  { path: "/discussion", changeFrequency: "daily", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contests", changeFrequency: "weekly", priority: 0.7 },
  { path: "/leaderboard", changeFrequency: "daily", priority: 0.5 },
  { path: "/upgrade", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Next.js attempts to prerender this route at BUILD time (revalidate alone doesn't skip that
  // first static pass) — throwing on a fetch failure here was tried and rejected: it turned "the
  // API happened to be unreachable/cold right as a build ran" into a hard build failure that
  // blocks the ENTIRE site from deploying, which is a much worse outcome than a temporarily
  // incomplete sitemap. None of these three endpoints ever legitimately 404s (they're always-200
  // list endpoints), so a failure here really is transient infrastructure trouble, not a "this
  // doesn't exist" case — logged loudly (Sentry once configured, console in the meantime) so it's
  // at least visible instead of being a silent, undetectable degradation, while still letting the
  // build/deploy succeed with whatever static routes are always safe to list.
  const [problemsResult, collectionsResult, postsResult] = await Promise.all([
    serverFetchDetailed<ProblemListResponse>("/problems?pageSize=1000"),
    serverFetchDetailed<CollectionListItem[]>("/collections"),
    serverFetchDetailed<PostListItem[]>("/posts"),
  ]);
  for (const [name, result] of [
    ["problems", problemsResult],
    ["collections", collectionsResult],
    ["posts", postsResult],
  ] as const) {
    if (!result.ok) console.error(`sitemap: failed to fetch ${name} — falling back to static routes only for this entry`);
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  const problemEntries: MetadataRoute.Sitemap = problemsResult.ok
    ? problemsResult.data.items.map((p) => ({ url: `${SITE_URL}/problems/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 }))
    : [];

  const collectionEntries: MetadataRoute.Sitemap = collectionsResult.ok
    ? collectionsResult.data.map((c) => ({ url: `${SITE_URL}/collections/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }))
    : [];

  const postEntries: MetadataRoute.Sitemap = postsResult.ok
    ? postsResult.data.map((p) => ({
        url: `${SITE_URL}/discussion/${p.id}`,
        lastModified: new Date(p.createdAt),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
    : [];

  return [...staticEntries, ...problemEntries, ...collectionEntries, ...postEntries];
}
