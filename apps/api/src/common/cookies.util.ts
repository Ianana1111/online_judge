import type { Response } from "express";

export interface SessionCookies {
  accessToken: string;
  accessMaxAgeMs: number;
  refreshToken: string;
  refreshMaxAgeMs: number;
  csrfToken: string;
}

const isProd = () => process.env.NODE_ENV === "production";

export function setAuthCookies(res: Response, session: SessionCookies): void {
  res.cookie("access_token", session.accessToken, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    maxAge: session.accessMaxAgeMs,
    path: "/",
  });
  res.cookie("refresh_token", session.refreshToken, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    maxAge: session.refreshMaxAgeMs,
    path: "/",
  });
  // Not HttpOnly: the web app's client-side fetch wrapper reads this cookie via
  // document.cookie to populate the x-csrf-token header (double-submit pattern).
  res.cookie("csrf_token", session.csrfToken, {
    httpOnly: false,
    secure: isProd(),
    sameSite: "lax",
    maxAge: session.refreshMaxAgeMs,
    path: "/",
  });
}

export function clearAuthCookies(res: Response): void {
  for (const name of ["access_token", "refresh_token", "csrf_token"]) {
    res.clearCookie(name, { path: "/" });
  }
}
