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
