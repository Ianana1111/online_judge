import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const url = new URL(process.env.DATABASE_URL ?? "invalid:");
if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Only disposable local test services are allowed");
const requireApi = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = requireApi("@prisma/client");
const OTPAuth = requireApi("otpauth");
const prisma = new PrismaClient({ errorFormat: "minimal" });
const child = spawn(process.execPath, ["dist/main.js"], {
  cwd: fileURLToPath(new URL("../apps/api/", import.meta.url)),
  env: { ...process.env, NODE_ENV: "test", API_HOST: "127.0.0.1", API_PORT: "55440", ECPAY_ENV: "sandbox", SENTRY_DSN: "", RESEND_API_KEY: "", WEB_ORIGIN: "http://127.0.0.1:55430", ACCOUNT_SECURITY_KEY: randomBytes(32).toString("hex"), ADMIN_MFA_REQUIRED: "false" },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "", userId;
child.stdout.on("data", (data) => { logs = (logs + data).slice(-12000); });
child.stderr.on("data", (data) => { logs = (logs + data).slice(-12000); });
const base = "http://127.0.0.1:55440", cookies = new Map();
async function request(path, method = "GET", body, csrf) {
  const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json", Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "), ...(csrf ? { "x-csrf-token": csrf } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(5000) });
  for (const cookie of response.headers.getSetCookie()) { const [name, ...value] = cookie.split(";", 1)[0].split("="); cookies.set(name, value.join("=")); }
  return response;
}
try {
  const deadline = Date.now() + 20_000;
  let healthy = false;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`API exited during startup: ${logs}`);
    try { healthy = (await request("/health")).ok; } catch {}
    if (healthy) break; await delay(200);
  }
  assert.ok(healthy, `API did not become healthy: ${logs}`);
  assert.equal((await request("/notifications")).status, 401);
  const suffix = randomUUID().replaceAll("-", "").slice(0, 14);
  const password = `Test_${randomUUID()}!`, handle = `runtime_${suffix}`, email = `${suffix}@example.test`;
  const registered = await request("/auth/register", "POST", { handle, email, password });
  assert.equal(registered.status, 201);
  const account = await registered.json(); userId = account.id;
  assert.ok(userId); assert.ok(cookies.get("access_token"));
  const me = await request("/auth/me"); assert.equal(me.status, 200); const current = await me.json(); assert.equal(current.id, userId);
  const day = new Date().toISOString().slice(0, 10);
  await prisma.user.update({ where: { id: userId }, data: { streakFreezeCount: 2, streakFreezeGrantMonth: "2000-01" } });
  await prisma.streakFreezeDay.create({ data: { userId, date: day } });
  const dailyResponse = await request("/users/me/daily"); assert.equal(dailyResponse.status, 200);
  const daily = await dailyResponse.json();
  assert.equal(daily.currentStreak, 0); assert.equal(daily.solvedToday, 0); assert.equal(daily.loginStreak, 1);
  for (const retired of ["streakFreezeCount", "frozenToday", "loginMilestoneHit"]) assert.equal(retired in daily, false);
  assert.equal((await request("/users/me/streak-freeze", "POST", {}, current.csrfToken)).status, 404);
  const inventory = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  assert.equal(inventory.streakFreezeCount, 2); assert.equal(inventory.streakFreezeGrantMonth, "2000-01");
  assert.equal(await prisma.streakFreezeDay.count({ where: { userId } }), 1);
  assert.equal((await request("/notifications/read", "POST", { ids: [] })).status, 403);
  assert.equal((await request("/notifications/read", "POST", { ids: [] }, current.csrfToken)).status, 400);
  const notifications = await request("/notifications"); assert.equal(notifications.status, 200); assert.equal((await notifications.json()).unreadCount, 0);
  const submission = await request("/posts", "POST", { title: "Runtime review fixture", bodyMd: "Only after approval", category: "QUESTION" }, current.csrfToken);
  assert.equal(submission.status, 201); const post = await submission.json();
  assert.equal((await request(`/posts/${post.id}`)).status, 404);
  assert.equal((await request("/moderation")).status, 403);
  assert.equal((await request("/billing/admin/refunds")).status, 403);
  assert.equal((await request("/operations")).status, 403);
  assert.equal((await request("/internal/operations")).status, 401);
  assert.equal((await request(`/moderation/${post.revisionId}/review`, "POST", { decision: "APPROVED" }, current.csrfToken)).status, 403);
  assert.equal((await request(`/posts/${post.id}/mine`)).status, 200);
  await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  assert.equal((await request("/moderation")).status, 200);
  assert.equal((await request("/billing/admin/refunds")).status, 200);
  const operations = await request("/operations"); assert.equal(operations.status, 200); assert.ok(Array.isArray((await operations.json()).queues));
  assert.equal((await request("/billing/admin/refunds?status=UNEXPECTED")).status, 400);
  assert.equal((await request("/billing/admin/refunds?cursor=broken")).status, 400);
  assert.equal((await request("/users/school-domain-requests?status=PENDING")).status, 200);
  assert.equal((await request("/users/school-domain-requests?status=WRONG")).status, 400);
  assert.equal((await request(`/moderation/${post.revisionId}/review`, "POST", { decision: "APPROVED" }, current.csrfToken)).status, 201);
  assert.equal((await (await request(`/posts/${post.id}`)).json()).bodyMd, "Only after approval");
  const sitemap = await (await request("/posts/sitemap")).json();
  assert.ok(sitemap.items.some((entry) => entry.id === post.id));
  assert.ok(sitemap.items.every((entry) => Object.keys(entry).every((key) => ["id", "createdAt", "updatedAt"].includes(key))));
  const comment = await request(`/discussions/post/${post.id}`, "POST", { body: "Pending comment" }, current.csrfToken);
  assert.equal(comment.status, 201); const commentData = await comment.json();
  assert.equal((await (await request(`/discussions/post/${post.id}`)).json()).items.length, 0);
  assert.equal((await (await request(`/discussions/post/${post.id}/mine`)).json()).items.length, 1);
  assert.equal((await request(`/moderation/${commentData.revisionId}/review`, "POST", { decision: "APPROVED" }, current.csrfToken)).status, 201);
  assert.equal((await (await request(`/discussions/post/${post.id}`)).json()).items.length, 1);
  await prisma.user.update({ where: { id: userId }, data: { role: "USER" } });
  assert.equal((await request("/billing/admin/refunds")).status, 403);
  assert.equal((await request("/users/school-domain-requests")).status, 403);
  assert.equal((await request("/users/me/school/domains?school=" + encodeURIComponent("國立臺灣大學"))).status, 200);
  const legacy = await fetch(base + "/users/school/verify/confirm?token=fixture", { redirect: "manual" });
  assert.equal(legacy.headers.get("location"), "http://127.0.0.1:55430/verify-school#token=fixture");
  assert.deepEqual(await (await request("/users/school/verify/confirm", "POST", { token: "fixture" })).json(), { ok: false });
  const setup = await request("/auth/mfa/setup", "POST", { password }, current.csrfToken); assert.equal(setup.status, 200); assert.equal(setup.headers.get("cache-control"), "no-store");
  const enrollment = await setup.json(), beforeEnrollment = cookies.get("access_token");
  const code = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(enrollment.secret), algorithm: "SHA1", digits: 6, period: 30 }).generate();
  const enabled = await request("/auth/mfa/enable", "POST", { code }, current.csrfToken); assert.equal(enabled.status, 200);
  const recovery = await enabled.json(); assert.equal(recovery.recoveryCodes.length, 10);
  assert.equal((await fetch(base + "/auth/me", { headers: { Cookie: `access_token=${beforeEnrollment}` } })).status, 401);
  assert.equal((await request("/notifications")).status, 200);
  await request("/auth/logout", "POST", {}, recovery.csrfToken);
  const login = await request("/auth/login", "POST", { handle, password }); assert.equal(login.status, 200);
  let session = await (await request("/auth/me")).json(); assert.equal(session.mfaRequired, true);
  assert.equal((await request("/notifications")).status, 403);
  assert.equal((await request("/auth/mfa/verify", "POST", { code: recovery.recoveryCodes[0] }, session.csrfToken)).status, 200);
  assert.equal((await request("/notifications")).status, 200);
  const resetToken = randomBytes(32).toString("base64url"), nextPassword = `New_${randomUUID()}!`, version = (await prisma.user.findUniqueOrThrow({ where: { id: userId } })).authVersion;
  await prisma.authChallenge.create({ data: { userId, purpose: "PASSWORD_RESET", targetEmail: email, tokenHash: createHash("sha256").update(resetToken).digest("hex"), authVersion: version, expiresAt: new Date(Date.now() + 60000) } });
  const forgedReset = await fetch(base + "/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.example.test" }, body: JSON.stringify({ token: resetToken, password: nextPassword }) }); assert.equal(forgedReset.status, 403);
  assert.equal((await request("/auth/reset-password", "POST", { token: resetToken, password: nextPassword })).status, 200);
  assert.equal((await request("/auth/me")).status, 401);
  assert.equal((await request("/auth/reset-password", "POST", { token: resetToken, password: nextPassword })).status, 400);
  assert.equal((await request("/auth/login", "POST", { handle, password })).status, 401);
  assert.equal((await request("/auth/login", "POST", { handle, password: nextPassword })).status, 200);
  session = await (await request("/auth/me")).json(); assert.equal(session.mfaRequired, true);
  assert.equal((await request("/auth/mfa/verify", "POST", { code: recovery.recoveryCodes[1] }, session.csrfToken)).status, 200);
  const oldAccess = cookies.get("access_token");
  assert.equal((await request("/auth/logout", "POST", {}, session.csrfToken)).status, 200);
  cookies.set("access_token", oldAccess);
  assert.equal((await request("/auth/me")).status, 401);
  console.log("Built API passed health, registration, CSRF, moderation, school routes, MFA enrollment/login/recovery, password reset/session revocation and logout checks.");
} finally {
  if (child.exitCode === null) { const exited = once(child, "exit"); child.kill("SIGTERM"); await exited; }
  if (userId) await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
}
