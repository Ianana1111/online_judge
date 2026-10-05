/** Dedicated disposable integration acceptance. Optional live Codex consumes ChatGPT quota. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { resolve } from "node:path";
import { prisma } from "../../packages/db/src/index";
import { createTransport, processTask } from "../../apps/ops-runner/src/runner";
import { checkCodexAuth, executeCodexStage } from "../../apps/ops-runner/src/codex";
import type { OpsClaim, OpsDashboard } from "../../packages/shared/src/agentOps";

async function main() {
  const database = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (database.hostname !== "127.0.0.1" || database.port !== "56432" || database.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:57379") throw new Error("Only dedicated local JudgeOps test services are allowed");
  if (await prisma.agentOpsRun.count() || await prisma.agentOpsCredential.count()) throw new Error("JudgeOps fixtures must start empty");
  const live = process.env.JUDGEOPS_LIVE_CODEX === "1";
  if (live) await checkCodexAuth();
  const requireApi = createRequire(resolve("apps/api/package.json"));
  const argon2 = requireApi("argon2");
  const suffix = randomUUID().replaceAll("-", ""), password = `Test_${suffix}!`;
  const user = await prisma.user.create({ data: { handle: `ops_${suffix}`, email: `ops_${suffix}@example.test`, role: "ADMIN", passwordHash: await argon2.hash(password) } });
  const web = createServer((_req, res) => { res.writeHead(200); res.end("Synthetic fixture"); });
  await new Promise<void>(resolve => web.listen(0, "127.0.0.1", resolve));
  const address = web.address(); if (!address || typeof address === "string") throw new Error("No web fixture port");
  const child = spawn(process.execPath, ["dist/main.js"], { cwd: resolve("apps/api"), stdio: ["ignore", "ignore", "pipe"], env: {
    PATH: process.env.PATH, HOME: process.env.HOME, NODE_ENV: "test", DATABASE_URL: process.env.DATABASE_URL, REDIS_URL: process.env.REDIS_URL,
    API_HOST: "127.0.0.1", API_PORT: "56440", WEB_ORIGIN: `http://127.0.0.1:${address.port}`, API_ORIGIN: "http://127.0.0.1:56440", ECPAY_ENV: "sandbox", BILLING_PROVIDER: "ecpay", STRIPE_ENABLED: "false", AGENT_OPS_MONITOR_ENABLED: "false",
    JWT_ACCESS_SECRET: randomBytes(32).toString("hex"), JWT_REFRESH_SECRET: randomBytes(32).toString("hex"), CSRF_SECRET: randomBytes(32).toString("hex"), INTERNAL_SERVICE_TOKEN: randomBytes(32).toString("hex"), SCHOOL_VERIFY_SECRET: randomBytes(32).toString("hex"), ACCOUNT_SECURITY_KEY: randomBytes(32).toString("hex"),
  } });
  child.stderr.on("data", () => {});
  const base = "http://127.0.0.1:56440";
  const cookies = new Map<string, string>();
  let csrf = "";
  const request = async (path: string, method = "GET", data?: unknown, withCsrf = true) => {
    const response = await fetch(base + path, { method, headers: { cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join("; "), "content-type": "application/json", ...(withCsrf ? { "x-csrf-token": csrf } : {}) }, body: data === undefined ? undefined : JSON.stringify(data) });
    for (const header of response.headers.getSetCookie()) {
      const pair = header.split(";", 1)[0], separator = pair.indexOf("=");
      cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    return response;
  };
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) { try { if ((await fetch(`${base}/health`)).ok) { ready = true; break; } } catch {} await delay(300); }
    assert.ok(ready, "Built API starts");
    assert.equal((await request("/agent-ops")).status, 401);
    assert.equal((await request("/internal/agent-ops/claim", "POST", {})).status, 401);
    const login = await request("/auth/login", "POST", { handle: user.handle, password }); assert.ok(login.ok);
    csrf = (await (await request("/auth/me")).json()).csrfToken;
    assert.equal((await request("/agent-ops/settings", "PATCH", { dispatchEnabled: true, dailyRunLimit: 1 }, false)).status, 403);
    assert.equal((await request("/agent-ops/settings", "PATCH", { dispatchEnabled: true, dailyRunLimit: 1000 })).status, 400);
    await prisma.user.update({ where: { id: user.id }, data: { role: "USER" } });
    assert.equal((await request("/agent-ops")).status, 403);
    assert.equal((await request("/agent-ops/credentials", "POST", { name: "unauthorized" })).status, 403);
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    assert.ok((await request("/agent-ops/collect", "POST", {})).ok);
    const created = await request("/agent-ops/credentials", "POST", { name: "HTTP acceptance" }); assert.ok(created.ok);
    assert.equal(created.headers.get("cache-control"), "private, no-store");
    const { id: credentialId, token } = await created.json();
    const transport = createTransport(base, token);
    assert.equal((await transport<{ reason: string }>("/claim")).reason, "DISABLED");
    const requestId = randomUUID();
    const first = await (await request("/agent-ops/runs", "POST", { requestId })).json();
    const same = await (await request("/agent-ops/runs", "POST", { requestId })).json(); assert.equal(first.id, same.id);
    assert.ok((await request("/agent-ops/settings", "PATCH", { dispatchEnabled: true, dailyRunLimit: 2 })).ok);
    const { task } = await transport<{ task: OpsClaim }>("/claim"); assert.ok(task);
    const signal = new AbortController().signal;
    const status = await processTask(task, transport, signal, live ? (t, s) => executeCodexStage(t, s, { model: process.env.JUDGEOPS_CODEX_MODEL, diagnostic: message => console.error(message) }) : async t => ({ lease: t.lease, step: t.step, model: "synthetic-http-test", inputTokens: 100, outputTokens: 50, output: { summary: "隔離環境探測已取得指標，未執行任何修復。", specialist: "SRE", findings: [{ text: "已取得 HTTP 探測資料", evidenceIds: [t.run.evidence[0].id] }], hypotheses: [], actions: [], limitations: ["合成驗收資料，不代表正式環境健康"], review: t.role === "REVIEW" ? "SUPPORTED" : "NOT_REVIEWED" } }));
    assert.equal(status, "COMPLETED", `Pipeline status: ${status}`);
    const response = await request("/agent-ops"); assert.equal(response.headers.get("cache-control"), "private, no-store");
    const dashboard = await response.json() as OpsDashboard;
    const report = dashboard.runs.find(r => r.id === first.id); assert.equal(report?.status, "COMPLETED"); assert.equal(report.steps.length, 3);
    assert.ok(!JSON.stringify(dashboard).includes(token)); assert.ok(!JSON.stringify(dashboard).includes(task.lease));
    assert.equal((await request("/internal/operations", "GET")).status, 401);
    const elevated = await fetch(`${base}/internal/operations`, { headers: { "x-internal-token": token } }); assert.equal(elevated.status, 401);
    assert.ok((await request(`/agent-ops/credentials/${credentialId}/revoke`, "POST", {})).ok);
    await assert.rejects(() => transport("/claim"));
    console.log(JSON.stringify({ mode: live ? "live-codex" : "synthetic", stages: report.steps.map(s => s.role), inputs: report.steps.reduce((n, s) => n + s.inputTokens, 0), outputs: report.steps.reduce((n, s) => n + s.outputTokens, 0), auth: "passed", csrf: "passed", revocation: "passed", reportStored: true }));
  } finally {
    child.kill("SIGTERM"); web.close();
    await prisma.agentOpsRun.deleteMany(); await prisma.agentOpsIncident.deleteMany(); await prisma.agentOpsCredential.deleteMany(); await prisma.agentOpsState.deleteMany();
    await prisma.user.delete({ where: { id: user.id } }); await prisma.$disconnect();
  }
}
main().catch(error => { console.error("JudgeOps acceptance failed:", error.name, String(error.stack).split("\n").slice(0, 5).join("\n")); process.exitCode = 1; });
