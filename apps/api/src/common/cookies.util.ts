import type { Response } from "express";

export interface SessionCookies {
  accessToken: string;
  accessMaxAgeMs: number;
  refreshToken: string;
  refreshMaxAgeMs: number;
  csrfToken: string;
}

const isProd = () => process.env.NODE_ENV === "production";

// In production the web app and API live on different domains (e.g. Vercel + Railway), so
// cookies must be SameSite=None (which requires Secure) to be sent cross-site at all. In dev
// they're same-site (different localhost ports), where Lax is fine and Secure would require
// HTTPS we don't have locally.
function baseCookieOpts() {
  return isProd() ? ({ secure: true, sameSite: "none" } as const) : ({ secure: false, sameSite: "lax" } as const);
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
  for (const name of ["access_token", "refresh_token", "csrf_token"]) {
    res.clearCookie(name, { path: "/" });
  }
}
