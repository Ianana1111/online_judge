import { randomBytes, randomUUID } from "node:crypto";
import argon2 from "../apps/api/node_modules/argon2";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { AccountSecurityService } from "../apps/api/src/auth/account-security.service";
import { acceptedStep, MfaService, totpFor } from "../apps/api/src/auth/mfa.service";
import { digestToken, openSecret, sealSecret } from "../apps/api/src/auth/security-crypto";
import { AuthService } from "../apps/api/src/auth/auth.service";
import { AuthGuard } from "../apps/api/src/auth/auth.guard";
import { TokenService } from "../apps/api/src/auth/token.service";
import { createRedisConnection } from "../apps/api/src/common/redis.providers";
import type { RequestUser } from "../apps/api/src/common/decorators";

it("matches RFC 6238 SHA-1 at 59 seconds, rejects replay and wrong codes", () => {
  const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
  expect(acceptedStep(secret, "287082", null, 59_000)).toBe(1);
  expect(acceptedStep(secret, "287082", 1, 59_000)).toBeNull();
  expect(acceptedStep(secret, "000000", null, 59_000)).toBeNull();
  expect(acceptedStep(secret, "287082", null, 120_000)).toBeNull();
});

it("binds encrypted secrets to an account and rejects tampering", () => {
  vi.stubEnv("ACCOUNT_SECURITY_KEY", randomBytes(32).toString("hex"));
  try {
    const sealed = sealSecret("fixture-secret", "mfa:alice");
    expect(sealed).not.toContain("fixture-secret");
    expect(openSecret(sealed, "mfa:alice")).toBe("fixture-secret");
    expect(() => openSecret(sealed, "mfa:bob")).toThrow();
    const parts = sealed.split("."); parts[2] = Buffer.alloc(16).toString("base64url");
    expect(() => openSecret(parts.join("."), "mfa:alice")).toThrow();
  } finally { vi.unstubAllEnvs(); }
});

describe.skipIf(process.env.RUN_DB_TESTS !== "1")("account recovery and MFA with real PostgreSQL/Redis", () => {
  const ids: string[] = [], addressKeys: string[] = [];
  const sent: { to: string; html: string; idempotencyKey?: string }[] = [];
  const mail = { assertConfigured: vi.fn(), send: vi.fn(async (message) => { sent.push(message); }) };
  const tokens = new TokenService();
  let redis: ReturnType<typeof createRedisConnection>, service: AccountSecurityService, auth: AuthService, mfa: MfaService;
  let passwordHash: string;
  beforeAll(async () => {
    const url = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable services required");
    vi.stubEnv("ACCOUNT_SECURITY_KEY", randomBytes(32).toString("hex"));
    redis = createRedisConnection(); service = new AccountSecurityService(mail as never, redis); auth = new AuthService(tokens, {} as never, redis); mfa = new MfaService(auth, tokens, redis);
    passwordHash = await argon2.hash("correct-password", { type: argon2.argon2id });
  });
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    const keys = [...addressKeys];
    for (const id of ids) keys.push(...await redis.keys(`*${id}*`));
    if (keys.length) await redis.del(...keys);
    await redis.quit(); await prisma.$disconnect(); vi.unstubAllEnvs();
  });
  async function fixture(extra = {}) {
    const suffix = randomUUID();
    const user = await prisma.user.create({ data: { handle: `sec_${suffix}`, email: `${suffix}@example.test`, passwordHash, ...extra } }); ids.push(user.id); addressKeys.push(`account-mail:${digestToken(user.email.toLowerCase())}`);
    const session = await auth.issueSession(user.id, user.handle, user.email, user.role);
    const payload = tokens.verifyAccessToken(session.accessToken);
    const actor: RequestUser = { id: user.id, role: user.role, handle: user.handle, sid: payload.sid, authVersion: payload.ver };
    return { user, actor, session };
  }
  async function challenge(userId: string, purpose: string) {
    const row = await prisma.authChallenge.findUniqueOrThrow({ where: { userId_purpose: { userId, purpose } } });
    return { row, token: openSecret(row.tokenEncrypted!, `${purpose}:${userId}`) };
  }
  function check(session: { accessToken: string }, path = "/posts") {
    const guard = new AuthGuard({ getAllAndOverride: () => false } as never, tokens, redis);
    return guard.canActivate({ getHandler: () => ({}), getClass: () => ({}), switchToHttp: () => ({ getRequest: () => ({ path, cookies: { access_token: session.accessToken } }) }) } as never);
  }
  async function enroll() {
    const f = await fixture();
    const setup = await mfa.setup(f.actor, "correct-password");
    const enabled = await mfa.enable(f.actor, totpFor(setup.secret).generate());
    const p = tokens.verifyAccessToken(enabled.session.accessToken);
    return { ...f, setup, enabled, actor: { ...f.actor, sid: p.sid, authVersion: p.ver } };
  }

  it("returns the same response for known/unknown/Google accounts without inline mail", async () => {
    const known = await fixture(), google = await fixture({ passwordHash: null, googleId: randomUUID() });
    const unknown = `${randomUUID()}@example.test`; addressKeys.push(`account-mail:${digestToken(unknown)}`);
    const count = sent.length;
    expect(await service.requestReset(known.user.email)).toEqual(await service.requestReset(unknown));
    expect(await service.requestReset(google.user.email)).toEqual({ ok: true });
    expect(sent.length).toBe(count);
    expect(await prisma.authChallenge.count({ where: { userId: google.user.id } })).toBe(0);
    const { row, token } = await challenge(known.user.id, "PASSWORD_RESET");
    expect(row.tokenHash).toBe(digestToken(token)); expect(row.tokenEncrypted).not.toContain(token);
  });

  it("consumes a reset exactly once under concurrency and revokes old access and refresh", async () => {
    const f = await fixture(); await service.requestReset(f.user.email); const c = await challenge(f.user.id, "PASSWORD_RESET");
    const results = await Promise.allSettled([service.resetPassword(c.token, "new-password-one"), service.resetPassword(c.token, "new-password-two")]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    await expect(check(f.session)).rejects.toThrow();
    await expect(auth.refresh(f.session.refreshToken)).rejects.toThrow();
    await expect(auth.issueSession(f.user.id, f.user.handle, f.user.email, f.user.role, 0)).rejects.toThrow();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } });
    expect(user.authVersion).toBe(1); expect(user.emailVerifiedAt).not.toBeNull();
    expect(await prisma.securityEvent.count({ where: { userId: user.id, kind: "PASSWORD_RESET" } })).toBe(1);
  });

  it("rejects expired, replaced and wrong-purpose links", async () => {
    const f = await fixture(); await service.requestReset(f.user.email); const old = await challenge(f.user.id, "PASSWORD_RESET");
    await prisma.authChallenge.update({ where: { id: old.row.id }, data: { createdAt: new Date(Date.now() - 61_000) } });
    await service.requestReset(f.user.email); const newer = await challenge(f.user.id, "PASSWORD_RESET");
    await expect(service.resetPassword(old.token, "a-new-password")).rejects.toThrow();
    await expect(service.verifyEmail(newer.token)).rejects.toThrow();
    await prisma.authChallenge.update({ where: { id: newer.row.id }, data: { expiresAt: new Date(0) } });
    await expect(service.resetPassword(newer.token, "a-new-password")).rejects.toThrow();
  });

  it("confirms email once and does not consume another purpose's link", async () => {
    const f = await fixture(); await service.requestVerification(f.user.id); const c = await challenge(f.user.id, "VERIFY_EMAIL");
    await expect(service.resetPassword(c.token, "new-password")).rejects.toThrow();
    expect(await service.verifyEmail(c.token)).toEqual({ ok: true });
    await expect(service.verifyEmail(c.token)).rejects.toThrow();
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).emailVerifiedAt).not.toBeNull();
  });

  it("rejects links after the bound email or credentials change", async () => {
    const f = await fixture(); await service.requestVerification(f.user.id); const c = await challenge(f.user.id, "VERIFY_EMAIL");
    await prisma.user.update({ where: { id: f.user.id }, data: { email: `changed-${f.user.email}` } });
    await expect(service.verifyEmail(c.token)).rejects.toThrow();
  });

  it("delivers with idempotency, fragments, and erases the encrypted delivery copy", async () => {
    const f = await fixture(); await service.requestReset(f.user.email);
    await Promise.all([service.deliverPending(), service.deliverPending()]);
    const messages = sent.filter((m) => m.to === f.user.email);
    expect(messages).toHaveLength(1); expect(messages[0].html).toContain("/reset-password#token="); expect(messages[0].idempotencyKey).toMatch(/^auth-/);
    const row = await prisma.authChallenge.findUniqueOrThrow({ where: { userId_purpose: { userId: f.user.id, purpose: "PASSWORD_RESET" } } });
    expect(row.sentAt).not.toBeNull(); expect(row.tokenEncrypted).toBeNull();
  });

  it("persists mail failure for retry without changing the request response", async () => {
    const f = await fixture(); await service.requestReset(f.user.email);
    mail.send.mockRejectedValueOnce(new Error("provider unavailable")); await service.deliverPending();
    const row = await prisma.authChallenge.findUniqueOrThrow({ where: { userId_purpose: { userId: f.user.id, purpose: "PASSWORD_RESET" } } });
    expect(row.sentAt).toBeNull(); expect(row.deliveryAttempts).toBe(1); expect(row.tokenEncrypted).not.toBeNull();
  });

  it("requires fresh identity for MFA setup and binds pending setup to the session", async () => {
    const f = await fixture(); await expect(mfa.setup(f.actor, "wrong")).rejects.toThrow();
    const setup = await mfa.setup(f.actor, "correct-password");
    await expect(mfa.enable({ ...f.actor, sid: "another-session" }, totpFor(setup.secret).generate())).rejects.toThrow();
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).mfaEnabledAt).toBeNull();
  });

  it("blocks ordinary requests until MFA, including password login and refresh", async () => {
    const f = await enroll(); expect(await check(f.enabled.session)).toBe(true); await expect(check(f.session)).rejects.toThrow();
    const login = await auth.login({ handle: f.user.handle, password: "correct-password" });
    expect(login.user.mfaRequired).toBe(true); await expect(check(login)).rejects.toThrow("Two-factor authentication is required"); expect(await check(login, "/auth/me")).toBe(true);
    const refreshed = await auth.refresh(login.refreshToken); expect(refreshed.user.mfaRequired).toBe(true); await expect(check(refreshed)).rejects.toThrow();
  });

  it("consumes a recovery code atomically and carries verification through refresh", async () => {
    const f = await enroll(), login = await auth.login({ handle: f.user.handle, password: "correct-password" }), payload = tokens.verifyAccessToken(login.accessToken);
    const actor = { ...f.actor, sid: payload.sid, authVersion: payload.ver };
    const results = await Promise.allSettled([mfa.verify(actor, f.enabled.recoveryCodes[0]), mfa.verify(actor, f.enabled.recoveryCodes[0])]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await check(login)).toBe(true);
    const refresh = await auth.refresh(login.refreshToken); expect(refresh.user.mfaRequired).toBe(false); expect(await check(refresh)).toBe(true);
  });

  it("password recovery preserves MFA and old recovery codes cannot be replayed", async () => {
    const f = await enroll(); await mfa.verify(f.actor, f.enabled.recoveryCodes[0]);
    await service.requestReset(f.user.email); const c = await challenge(f.user.id, "PASSWORD_RESET"); await service.resetPassword(c.token, "reset-correct-password");
    const login = await auth.login({ handle: f.user.handle, password: "reset-correct-password" }); expect(login.user.mfaRequired).toBe(true);
    const p = tokens.verifyAccessToken(login.accessToken); const actor = { ...f.actor, sid: p.sid, authVersion: p.ver };
    await expect(mfa.verify(actor, f.enabled.recoveryCodes[0])).rejects.toThrow();
    await expect(check(f.enabled.session)).rejects.toThrow();
  });

  it("replacement codes revoke old codes and sessions, and disabling requires both factors", async () => {
    const f = await enroll();
    await expect(mfa.disable(f.actor, f.enabled.recoveryCodes[0], "wrong")).rejects.toThrow();
    const replacement = await mfa.regenerate(f.actor, f.enabled.recoveryCodes[0], "correct-password");
    const p = tokens.verifyAccessToken(replacement.session.accessToken), actor = { ...f.actor, sid: p.sid, authVersion: p.ver };
    await expect(mfa.verify(actor, f.enabled.recoveryCodes[1])).rejects.toThrow();
    await expect(check(f.enabled.session)).rejects.toThrow();
    const disabled = await mfa.disable(actor, replacement.recoveryCodes[0], "correct-password");
    expect(disabled.user.mfaRequired).toBe(false); expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).mfaEnabledAt).toBeNull();
  });

  it("requires administrator enrollment when enforcement is enabled", async () => {
    const f = await fixture({ role: "ADMIN" }); vi.stubEnv("ADMIN_MFA_REQUIRED", "true");
    try { await expect(check(f.session)).rejects.toThrow("Set up two-factor"); expect(await check(f.session, "/auth/mfa/setup")).toBe(true); }
    finally { vi.stubEnv("ADMIN_MFA_REQUIRED", "false"); }
  });
});
