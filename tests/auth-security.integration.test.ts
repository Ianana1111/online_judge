import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AuthService } from "../apps/api/src/auth/auth.service";
import { CsrfGuard } from "../apps/api/src/common/csrf.guard";
import { prisma } from "../packages/db/src/index";
import { TokenService } from "../apps/api/src/auth/token.service";
import { AuthGuard } from "../apps/api/src/auth/auth.guard";
import { createRedisConnection } from "../apps/api/src/common/redis.providers";

it("rejects refresh and deletion credentials when used as an access token", () => {
  const tokens = new TokenService();
  expect(() => tokens.verifyAccessToken(tokens.signDeleteReauthToken("test"))).toThrow();
  expect(() => tokens.verifyAccessToken(tokens.signRefreshToken({ sub: "test", jti: "session" }))).toThrow();
  expect(() => tokens.verifyRefreshToken(tokens.signAccessToken({ sub: "test", sid: "session", role: "USER", handle: "test" }))).toThrow();
});

it("rejects cross-site auth bootstrap requests without blocking signed gateway webhooks", () => {
  const guard = new CsrfGuard();
  const check = (path: string, headers: Record<string, string>) => guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ method: "POST", path, headers }) }) } as never);
  for (const path of ["/auth/login", "/auth/register", "/auth/refresh"]) {
    expect(() => check(path, { origin: "https://evil.example" })).toThrow("Untrusted request origin");
    expect(() => check(path, { origin: "null" })).toThrow();
    expect(() => check(path, { "sec-fetch-site": "cross-site" })).toThrow();
    expect(check(path, { origin: (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim() })).toBe(true);
  }
  expect(check("/billing/ecpay/return", {})).toBe(true);
});

describe.skipIf(process.env.RUN_DB_TESTS !== "1")("live session authorization", () => {
  const users: string[] = [], keys: string[] = []; const tokens = new TokenService();
  let redis: ReturnType<typeof createRedisConnection>;
  beforeAll(() => { const url = new URL(process.env.DATABASE_URL ?? "invalid:"); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable services required"); redis = createRedisConnection(); });
  afterAll(async () => { await prisma.user.deleteMany({ where: { id: { in: users } } }); if (keys.length) await redis.del(...keys); await redis.quit(); await prisma.$disconnect(); });
  async function fixture() {
    const sid = randomUUID(); const user = await prisma.user.create({ data: { handle: `auth_${sid}`, email: `${sid}@example.test`, role: "ADMIN" } }); users.push(user.id);
    const key = `refresh:${user.id}:${sid}`; keys.push(key); await redis.set(key, "1", "EX", 60);
    const token = tokens.signAccessToken({ sub: user.id, sid, handle: user.handle, role: "ADMIN" });
    const req: { path: string; cookies: { access_token: string }; user?: { id: string; role: string } } = { path: "/posts", cookies: { access_token: token } };
    const context = { getHandler: () => ({}), getClass: () => ({}), switchToHttp: () => ({ getRequest: () => req }) };
    const guard = new AuthGuard({ getAllAndOverride: () => false } as never, tokens, redis);
    return { user, key, req, check: () => guard.canActivate(context as never) };
  }
  it("revokes an otherwise unexpired access token when its session is removed", async () => {
    const f = await fixture(); expect(await f.check()).toBe(true); await redis.del(f.key); await expect(f.check()).rejects.toThrow();
  });
  it("uses the current database role instead of a stale administrator claim", async () => {
    const f = await fixture(); await prisma.user.update({ where: { id: f.user.id }, data: { role: "USER" } }); await f.check(); expect(f.req.user?.role).toBe("USER");
  });
  it("enforces pending deletion in the API while preserving the recovery route", async () => {
    const f = await fixture(); await prisma.user.update({ where: { id: f.user.id }, data: { deletionRequestedAt: new Date() } }); await expect(f.check()).rejects.toThrow("Account deletion is pending"); f.req.path = "/users/me/cancel-deletion"; expect(await f.check()).toBe(true);
  });
  it("an old logout does not revoke a newly issued session", async () => {
    const f = await fixture(), oldSid = randomUUID(), newSid = randomUUID();
    const oldKey = `refresh:${f.user.id}:${oldSid}`, newKey = `refresh:${f.user.id}:${newSid}`, current = `refresh:current:${f.user.id}`;
    keys.push(oldKey, newKey, current); await redis.mset(oldKey, "1", newKey, "1", current, newSid);
    const auth = new AuthService(tokens, {} as never, redis);
    await auth.logout(tokens.signRefreshToken({ sub: f.user.id, jti: oldSid }));
    expect(await redis.get(oldKey)).toBeNull(); expect(await redis.get(newKey)).toBe("1"); expect(await redis.get(current)).toBe(newSid);
  });
  it("Google reauthentication checks the linked subject without rotating or creating sessions", async () => {
    const f = await fixture(), googleId = randomUUID();
    await prisma.user.update({ where: { id: f.user.id }, data: { googleId } });
    const auth = new AuthService(tokens, {} as never, redis);
    await auth.verifyGoogleReauthentication(f.user.id, googleId);
    await expect(auth.verifyGoogleReauthentication(f.user.id, "another-google-account")).rejects.toThrow();
    await expect(auth.verifyGoogleReauthentication("missing-account", googleId)).rejects.toThrow();
    expect(await f.check()).toBe(true);
    expect(await redis.get(f.key)).toBe("1");
    expect(await prisma.user.findUnique({ where: { googleId: "another-google-account" } })).toBeNull();
  });
});

it("reports a session-store outage instead of falsely confirming logout", async () => {
  const tokens = new TokenService(), redis = { eval: vi.fn().mockRejectedValue(new Error("Redis unavailable")) };
  const auth = new AuthService(tokens, {} as never, redis as never);
  await expect(auth.logout(tokens.signRefreshToken({ sub: "fixture", jti: "session" }))).rejects.toThrow("Redis unavailable");
});
