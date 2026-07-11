import type { Response } from "express";

export interface SessionCookies {
  accessToken: string;
  accessMaxAgeMs: number;
  refreshToken: string;
  refreshMaxAgeMs: number;
  csrfToken: string;
}

const isProd = () => process.env.NODE_ENV === "production";

// SameSite=None cookies (needed when the web app and API are on unrelated domains, e.g. Vercel +
// Railway) get silently dropped by Safari's ITP and an increasing share of Chrome/Firefox users'
// third-party-cookie blocking — a browser policy, not something SameSite=None can work around. The
// durable fix is putting the API on a subdomain of the same parent domain as the web app (e.g.
// api.judge.tw alongside judge.tw) and setting Domain to that shared parent, so the browser treats
// the cookie as same-site between them instead of third-party. COOKIE_DOMAIN opts into that once
// the subdomain + DNS are actually in place; unset, cookies stay host-only exactly as before.
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN; // e.g. ".judge.tw" — note the leading dot

function baseCookieOpts() {
  if (!isProd()) return { secure: false, sameSite: "lax" as const };
  return { secure: true, sameSite: "none" as const, ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}) };
}

export function setAuthCookies(res: Response, session: SessionCookies): void {
  res.cookie("access_token", session.accessToken, {
    httpOnly: true,
    ...baseCookieOpts(),
    maxAge: session.accessMaxAgeMs,
    path: "/",
  });
  res.cookie("refresh_token", session.refreshToken, {
    httpOnly: true,
    ...baseCookieOpts(),
    maxAge: session.refreshMaxAgeMs,
    path: "/",
  });
  setCsrfCookie(res, session.csrfToken, session.refreshMaxAgeMs);
}

// Not HttpOnly, in principle: the double-submit pattern normally has the client read this via
// document.cookie. Cross-domain (prod), the browser won't let JS on the web app's origin read a
// cookie set by the API's origin at all, so the API also echoes csrfToken in JSON response
// bodies (see AuthController) and the web app keeps it in memory instead. The cookie still gets
// set either way — the guard only compares header vs. cookie, it doesn't care how the client
// learned the value.
export function setCsrfCookie(res: Response, csrfToken: string, maxAge: number): void {
  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    ...baseCookieOpts(),
    maxAge,
    path: "/",
  });
}

export function clearAuthCookies(res: Response): void {
  // clearCookie must be called with the same Domain attribute the cookie was originally set with,
  // or the browser won't recognize it as the same cookie and won't actually clear it.
  const domainOpt = isProd() && COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {};
  for (const name of ["access_token", "refresh_token", "csrf_token"]) {
    res.clearCookie(name, { path: "/", ...domainOpt });
  }
}
