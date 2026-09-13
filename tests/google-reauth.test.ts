import { afterEach, expect, it, vi } from "vitest";
import { AuthController } from "../apps/api/src/auth/auth.controller";
import { TokenService } from "../apps/api/src/auth/token.service";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it.each([true, false])("security reauthentication is bound to the same Google identity and session (match: %s)", async (matches) => {
  vi.stubEnv("WEB_ORIGIN", "http://127.0.0.1:55430");
  const auth = { loginWithGoogle: vi.fn(), verifyGoogleReauthentication: vi.fn(async () => { if (!matches) throw new Error("Identity mismatch"); }) };
  const tokens = new TokenService(), controller = new AuthController(auth as never, tokens, { set: vi.fn().mockResolvedValue("OK") } as never);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "fixture-token" }))).mockResolvedValueOnce(new Response(JSON.stringify({ sub: "google-subject", email: "fixture@example.test", email_verified: true }))));
  const res = { cookie: vi.fn(), clearCookie: vi.fn(), redirect: vi.fn() };
  await controller.googleCallback("code", "state", { id: "current-user", role: "USER", handle: "student", sid: "current-session" }, { cookies: { google_oauth_state: "state", google_oauth_intent: "security" } } as never, res as never);
  expect(auth.verifyGoogleReauthentication).toHaveBeenCalledWith("current-user", "google-subject");
  expect(auth.loginWithGoogle).not.toHaveBeenCalled();
  expect(res.redirect).toHaveBeenCalledWith(`http://127.0.0.1:55430/settings?section=security&${matches ? "securityReauth=1" : "securityReauthError=1"}`);
  expect(res.cookie.mock.calls.map(([name]) => name)).toEqual(matches ? ["security_reauth_token"] : []);
  if (matches) {
    const [, proof, options] = res.cookie.mock.calls[0];
    const claims = tokens.verifySecurityReauthToken(proof);
    expect(claims).toMatchObject({ sub: "current-user", sid: "current-session" });
    expect(options).toMatchObject({ httpOnly: true, path: "/auth/mfa", maxAge: 300000 });
    expect(() => tokens.verifyDeleteReauthToken(proof)).toThrow();
    expect(() => tokens.verifyAccessToken(proof)).toThrow();
  }
});

it.each([true, false])("deletion OAuth callback preserves the current session (identity match: %s)", async (matches) => {
  vi.stubEnv("WEB_ORIGIN", "http://127.0.0.1:55430");
  const auth = { loginWithGoogle: vi.fn(), verifyGoogleReauthentication: vi.fn(async () => { if (!matches) throw new Error("Identity mismatch"); }) };
  const redis = { set: vi.fn().mockResolvedValue("OK") };
  const tokens = new TokenService(), controller = new AuthController(auth as never, tokens, redis as never);
  const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "google-test-token" })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ sub: "google-subject", email: "verified@example.test", email_verified: true })));
  vi.stubGlobal("fetch", fetch);
  const res = { cookie: vi.fn(), clearCookie: vi.fn(), redirect: vi.fn() };
  await controller.googleCallback("code", "state", { id: "current-user", role: "USER", handle: "student" },
    { cookies: { google_oauth_state: "state", google_oauth_intent: "delete_account" } } as never, res as never);
  expect(auth.verifyGoogleReauthentication).toHaveBeenCalledWith("current-user", "google-subject");
  expect(auth.loginWithGoogle).not.toHaveBeenCalled();
  expect(res.redirect).toHaveBeenCalledWith(`http://127.0.0.1:55430/settings?${matches ? "reauth=1" : "reauthError=1"}`);
  expect(res.cookie.mock.calls.map(([name]) => name)).toEqual(matches ? ["delete_reauth_token"] : []);
  if (matches) expect(tokens.verifyDeleteReauthToken(res.cookie.mock.calls[0][1]).sub).toBe("current-user");
  for (const call of fetch.mock.calls) expect(call[1].signal).toBeInstanceOf(AbortSignal);
});

it("starting ordinary Google login clears a leftover deletion intent", () => {
  vi.stubEnv("GOOGLE_CLIENT_ID", "local-client"); vi.stubEnv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:55440/auth/google/callback");
  const controller = new AuthController({} as never, new TokenService(), {} as never);
  const res = { cookie: vi.fn(), clearCookie: vi.fn(), redirect: vi.fn() };
  controller.googleStart(undefined, null, res as never);
  expect(res.clearCookie).toHaveBeenCalledWith("google_oauth_intent", { path: "/auth/google" });
});

it.each([true, false])("ordinary Google sign-in requires a verified profile (verified: %s)", async (verified) => {
  vi.stubEnv("WEB_ORIGIN", "http://127.0.0.1:55430");
  const auth = { verifyGoogleReauthentication: vi.fn(), loginWithGoogle: vi.fn().mockResolvedValue({ user: { id: "fixture", handle: "fixture", email: "fixture@example.test", role: "USER" }, accessToken: "access", refreshToken: "refresh", csrfToken: "csrf", accessMaxAgeMs: 60_000, refreshMaxAgeMs: 60_000 }) };
  const controller = new AuthController(auth as never, new TokenService(), { set: vi.fn().mockResolvedValue("OK") } as never);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "google-test-token" })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ sub: "google-subject", email: "verified@example.test", email_verified: verified }))));
  const res = { cookie: vi.fn(), clearCookie: vi.fn(), redirect: vi.fn() };
  await controller.googleCallback("code", "state", null, { cookies: { google_oauth_state: "state" } } as never, res as never);
  expect(auth.verifyGoogleReauthentication).not.toHaveBeenCalled();
  expect(auth.loginWithGoogle).toHaveBeenCalledTimes(verified ? 1 : 0);
  expect(res.cookie.mock.calls.map(([name]) => name)).toEqual(verified ? ["access_token", "refresh_token", "csrf_token"] : []);
  expect(res.redirect).toHaveBeenCalledWith(`http://127.0.0.1:55430${verified ? "" : "/login?error=google_failed"}`);
});
