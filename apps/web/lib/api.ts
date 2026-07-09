const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// When the API lives on a different domain than the web app (e.g. Railway + Vercel), the browser
// won't let this page's JS read a cookie set by the API's origin via document.cookie, so the API
// echoes the CSRF token in JSON response bodies (login/refresh/me) and we keep it here instead.
// Same-origin/local dev never needs this — readCookie() below still works there as a fallback.
let inMemoryCsrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  inMemoryCsrfToken = token;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function csrfHeader(): string {
  return inMemoryCsrfToken ?? readCookie("csrf_token") ?? "";
}

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "x-csrf-token": csrfHeader() },
    })
      .then(async (res) => {
        if (res.ok) {
          const body = (await res.json().catch(() => null)) as { csrfToken?: string } | null;
          if (body?.csrfToken) setCsrfToken(body.csrfToken);
        }
        return res.ok;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isRetry?: boolean;
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const isMutating = method !== "GET" && method !== "HEAD";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isMutating) {
    headers["x-csrf-token"] = csrfHeader();
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401 && !opts.isRetry && path !== "/auth/refresh") {
    const refreshed = await doRefresh();
    if (refreshed) {
      return apiFetch<T>(path, { ...opts, isRetry: true });
    }
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const hasMessage = body !== null && typeof body === "object" && "message" in body;
    const message = hasMessage ? String((body as { message: unknown }).message) : res.statusText;
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export function openSubmissionStream(submissionId: string): EventSource {
  return new EventSource(apiUrl(`/submissions/${submissionId}/stream`), { withCredentials: true });
}
