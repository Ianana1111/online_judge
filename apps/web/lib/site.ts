// The public-facing origin — used for sitemap/robots URLs, canonical links, and Open Graph
// image/URLs, which all need an absolute address regardless of which internal API host serverApi
// talks to.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://judge.tw";
export const SITE_NAME = "judge.";
