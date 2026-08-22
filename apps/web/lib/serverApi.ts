import { cookies } from "next/headers";

// Server Components run inside the `web` container itself, so `NEXT_PUBLIC_API_URL`
// (which points at `localhost:4000` for the browser) would resolve to the web container,
// not the api container. Use the internal docker-network hostname here instead.
const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Server-side fetch for public (unauthenticated) data used in Server Components. Cached for 15s
 * (safe only because the response never varies by requester) — never use this for anything the
 * API computes differently for a logged-in vs anonymous caller, or Pro vs Free (see
 * serverFetchAuthed below). */
export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 15 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Server-side fetch that forwards the caller's own session cookie, for endpoints whose response
 * depends on who's asking (solvedByMe, Pro-gated fields like cpeAppearances, etc.). Only GET
 * requests need this cookie forwarded — the API's CsrfGuard exempts non-mutating methods, so no
 * CSRF token is needed here. Never cached (`no-store`): Next's fetch cache key doesn't vary by
 * cookie, so caching a personalized response here would leak one user's view to the next visitor
 * of the same URL. */
export async function serverFetchAuthed<T>(path: string): Promise<T | null> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Result of a "detailed" fetch below — distinguishes a real 404 (the resource genuinely doesn't
 * exist, so `notFound()` is the right call) from every other failure (5xx, a cold-starting
 * container's 502, a timeout, a dropped connection), which should NOT render as "this page
 * doesn't exist." Plain `serverFetch`/`serverFetchAuthed` above collapse both cases to `null`,
 * which is fine for callers that already tolerate missing data (the homepage's problem list, the
 * sitemap) but was actively wrong for the two pages that call `notFound()` on `null` — a shared
 * problem or profile link hitting the API mid-cold-start rendered a hard 404 instead of a retry. */
export type DetailedFetchResult<T> = { ok: true; data: T } | { ok: false; notFound: true } | { ok: false; notFound: false };

/** Public (unauthenticated) counterpart to `serverFetch`, for the one or two call sites that need
 * to tell a real 404 apart from a transient failure — see `DetailedFetchResult`. */
export async function serverFetchDetailed<T>(path: string): Promise<DetailedFetchResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 15 } });
    if (res.status === 404) return { ok: false, notFound: true };
    if (!res.ok) return { ok: false, notFound: false };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, notFound: false };
  }
}

/** Authenticated counterpart to `serverFetchAuthed` — see `DetailedFetchResult`. */
export async function serverFetchAuthedDetailed<T>(path: string): Promise<DetailedFetchResult<T>> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (res.status === 404) return { ok: false, notFound: true };
    if (!res.ok) return { ok: false, notFound: false };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, notFound: false };
  }
}
