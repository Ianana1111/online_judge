import type { CommunityPage } from "@/lib/community";
import type { MetadataRoute } from "next";
import { serverFetchDetailed } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { ProblemListResponse, CollectionListItem, ContestListItem } from "@/lib/types";
type SitemapPost = { id: string; createdAt: string; updatedAt: string };

// A build can run while the API is temporarily unavailable. Generate this on request so an
// incomplete build-time snapshot never becomes the sitemap crawlers first see after deploy.
export const dynamic = "force-dynamic";

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
  // A transient API failure still yields static routes, and the next crawler request retries.
  // These list endpoints normally return 200; log failures so a partial response is visible.
  const [problemsResult, collectionsResult, contestsResult, postsResult] = await Promise.all([
    serverFetchDetailed<ProblemListResponse>("/problems?pageSize=1000"),
    serverFetchDetailed<CollectionListItem[]>("/collections"),
    serverFetchDetailed<ContestListItem[]>("/contests"),
    serverFetchDetailed<CommunityPage<SitemapPost>>("/posts/sitemap"),
  ]);
  for (const [name, result] of [
    ["problems", problemsResult],
    ["collections", collectionsResult],
    ["contests", contestsResult],
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

  const contestEntries: MetadataRoute.Sitemap = contestsResult.ok
    ? contestsResult.data.map((c) => ({ url: `${SITE_URL}/contests/${c.id}`, changeFrequency: "monthly" as const, priority: 0.6 }))
    : [];

  const entries = [...staticEntries, ...problemEntries, ...collectionEntries, ...contestEntries];
  const seen = new Set<string>();
  const cursors = new Set<string>();
  let current = postsResult;
  // A sitemap has a 50,000 URL limit. Fetch metadata in bounded pages, without post bodies.
  // Split this route into a sitemap index before the catalog reaches that limit.
  while (current.ok) {
    for (const p of current.data.items) {
      if (seen.has(p.id)) continue;
      if (entries.length >= 50_000) { console.error("sitemap: URL limit reached; split into a sitemap index"); return entries; }
      seen.add(p.id);
      entries.push({ url: `${SITE_URL}/discussion/${p.id}`, lastModified: Number.isFinite(Date.parse(p.updatedAt)) ? new Date(p.updatedAt) : undefined, changeFrequency: "monthly", priority: 0.5 });
    }
    const cursor = current.data.nextCursor;
    if (!cursor) break;
    if (cursors.has(cursor)) { console.error("sitemap: repeated page cursor"); break; }
    cursors.add(cursor);
    current = await serverFetchDetailed<CommunityPage<SitemapPost>>(`/posts/sitemap?cursor=${encodeURIComponent(cursor)}`);
    if (!current.ok) console.error("sitemap: failed to fetch the next post page");
  }
  return entries;
}
