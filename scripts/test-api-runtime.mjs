import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const url = new URL(process.env.DATABASE_URL ?? "invalid:");
if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Only disposable local test services are allowed");
const requireApi = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = requireApi("@prisma/client");
const prisma = new PrismaClient({ errorFormat: "minimal" });
const child = spawn(process.execPath, ["dist/main.js"], {
  cwd: fileURLToPath(new URL("../apps/api/", import.meta.url)),
  env: { ...process.env, NODE_ENV: "test", API_HOST: "127.0.0.1", API_PORT: "55440", ECPAY_ENV: "sandbox", SENTRY_DSN: "", RESEND_API_KEY: "", WEB_ORIGIN: "http://127.0.0.1:55430" },
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
  const registered = await request("/auth/register", "POST", { handle: `runtime_${suffix}`, email: `${suffix}@example.test`, password: `Test_${randomUUID()}!` });
  assert.equal(registered.status, 201);
  const account = await registered.json(); userId = account.id;
  assert.ok(userId); assert.ok(cookies.get("access_token"));
  const me = await request("/auth/me"); assert.equal(me.status, 200); const current = await me.json(); assert.equal(current.id, userId);
  assert.equal((await request("/notifications/read", "POST", { ids: [] })).status, 403);
  assert.equal((await request("/notifications/read", "POST", { ids: [] }, current.csrfToken)).status, 400);
  const notifications = await request("/notifications"); assert.equal(notifications.status, 200); assert.equal((await notifications.json()).unreadCount, 0);
  const submission = await request("/posts", "POST", { title: "Runtime review fixture", bodyMd: "Only after approval", category: "QUESTION" }, current.csrfToken);
  assert.equal(submission.status, 201); const post = await submission.json();
  assert.equal((await request(`/posts/${post.id}`)).status, 404);
  assert.equal((await request("/moderation")).status, 403);
  assert.equal((await request("/billing/admin/refunds")).status, 403);
  assert.equal((await request(`/moderation/${post.revisionId}/review`, "POST", { decision: "APPROVED" }, current.csrfToken)).status, 403);
  assert.equal((await request(`/posts/${post.id}/mine`)).status, 200);
  await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  assert.equal((await request("/moderation")).status, 200);
  assert.equal((await request("/billing/admin/refunds")).status, 200);
  assert.equal((await request("/billing/admin/refunds?status=UNEXPECTED")).status, 400);
  assert.equal((await request("/billing/admin/refunds?cursor=broken")).status, 400);
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
  const oldAccess = cookies.get("access_token");
  assert.equal((await request("/auth/logout", "POST", {}, current.csrfToken)).status, 200);
  cookies.set("access_token", oldAccess);
  assert.equal((await request("/auth/me")).status, 401);
  console.log("Built API passed health, registration, session, CSRF, validation, notifications, moderated publication, administrator authorization and logout checks.");
} finally {
  if (child.exitCode === null) { const exited = once(child, "exit"); child.kill("SIGTERM"); await exited; }
  if (userId) await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
}
