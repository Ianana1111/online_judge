// Server Components run inside the `web` container itself, so `NEXT_PUBLIC_API_URL`
// (which points at `localhost:4000` for the browser) would resolve to the web container,
// not the api container. Use the internal docker-network hostname here instead.
const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Server-side fetch for public (unauthenticated) data used in Server Components. */
export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 15 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
