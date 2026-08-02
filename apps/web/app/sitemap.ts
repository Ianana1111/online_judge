import type { MetadataRoute } from "next";
import { serverFetch } from "@/lib/serverApi";
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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [problems, collections, posts] = await Promise.all([
    serverFetch<ProblemListResponse>("/problems?pageSize=1000"),
    serverFetch<CollectionListItem[]>("/collections"),
    serverFetch<PostListItem[]>("/posts"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  const problemEntries: MetadataRoute.Sitemap = (problems?.items ?? []).map((p) => ({
    url: `${SITE_URL}/problems/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const collectionEntries: MetadataRoute.Sitemap = (collections ?? []).map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${SITE_URL}/discussion/${p.id}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...problemEntries, ...collectionEntries, ...postEntries];
}
