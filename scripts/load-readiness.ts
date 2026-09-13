/** Isolated real HTTP + Redis queue + Linux judge load drill. Never points at production. */
import assert from "node:assert/strict";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { prisma } from "../packages/db/src/index";
import { evaluateInSandbox } from "../apps/judge/src/local/evaluate";
import { createDockerSandbox } from "../tests/support/docker-sandbox";
import { JUDGE_LOCAL_QUEUE_NAME } from "../packages/shared/src/queue";

async function main() {
  const db = new URL(process.env.DATABASE_URL ?? "invalid:");
  assert.equal(db.hostname, "127.0.0.1"); assert.equal(db.port, "55432"); assert.equal(db.pathname, "/oj_test"); assert.equal(process.env.REDIS_URL, "redis://127.0.0.1:56379");
  const durationSeconds = Number(process.env.LOAD_DURATION_SECONDS ?? 180); assert.ok(Number.isInteger(durationSeconds) && durationSeconds >= 15 && durationSeconds <= 300);
  const requireApi = createRequire(new URL("../apps/api/package.json", import.meta.url));
  const { Worker, Queue } = requireApi("bullmq"), Redis = requireApi("ioredis"), jwt = requireApi("jsonwebtoken");
  const redis = new Redis(process.env.REDIS_URL), connection = { host: "127.0.0.1", port: 56379 }, queue = new Queue(JUDGE_LOCAL_QUEUE_NAME, { connection });
  const secret = randomBytes(32).toString("hex"), internal = randomBytes(32).toString("hex"), csrfSecret = randomBytes(32).toString("hex"), suffix = randomUUID().replaceAll("-", "").slice(0,12);
  const base = "http://127.0.0.1:55441", users: { id: string; cookie: string; csrf: string; sid: string; attempt?: { id: string; contestId: string } }[] = [], contests: string[] = [], submitted: string[] = [];
  const latencies: number[] = [], judgeLatencies: number[] = [], errors: { path: string; status: number }[] = [];
  let child: ReturnType<typeof spawn> | undefined, worker: any, problemId: string | undefined, maxQueue = 0, logs = "", finished = 0;
  async function request(user: typeof users[number], path: string, method = "GET", body?: unknown, record = false) {
    const before = performance.now();
    try {
      const response = await fetch(base + path, { method, headers: { Cookie: user.cookie, "x-csrf-token": user.csrf, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(10000) });
      const data = await response.json(); if (record) { latencies.push(performance.now() - before); if (!response.ok) errors.push({ path, status: response.status }); }
      return { response, data };
    } catch { if (record) errors.push({ path, status: 0 }); throw new Error(`Local load request failed: ${path}`); }
  }
  try {
    const existing = await queue.getJobCounts("wait", "active", "delayed"); assert.equal(existing.wait + existing.active + existing.delayed, 0, "Use an idle disposable queue");
    const p = await prisma.problem.create({ data: { slug: `load-${suffix}`, title: "Local load fixture", statementMd: "Add two signed integers.", timeLimitMs: 2000, memoryLimitKb: 262144, testCases: { create: [{ ord: 1, input: "1 2\n", output: "3\n" }, { ord: 2, input: "-2147483648 2147483647\n", output: "-1\n" }] } }, include: { testCases: true } }); problemId = p.id;
    for (let i = 0; i < 2; i++) contests.push((await prisma.contest.create({ data: { slug: `load-${suffix}-${i}`, title: "Local CPE load drill", kind: "CPE", durationMin: 15, freezeMin: 0, problems: { create: { problemId: p.id, label: "A", ord: 0 } } } })).id);
    for (let i = 0; i < 100; i++) {
      const id = `c${randomBytes(12).toString("hex")}`, handle = `load_${suffix}_${i}`, sid = randomUUID(), raw = randomBytes(24).toString("hex"), csrf = `${raw}.${createHmac("sha256", csrfSecret).update(raw).digest("hex")}`;
      const token = jwt.sign({ sub: id, handle, sid, role: "USER", purpose: "access", ver: 0 }, secret, { algorithm: "HS256", issuer: "judge.tw", audience: "judge.tw:access", expiresIn: "15m" });
      await prisma.user.create({ data: { id, handle, email: `${handle}@example.test`, isStudent: true } });
      await redis.set(`refresh:${id}:${sid}`, "load-fixture", "EX", 900); users.push({ id, csrf, sid, cookie: `access_token=${token}; csrf_token=${csrf}` });
    }
    child = spawn(process.execPath, ["dist/main.js"], { cwd: fileURLToPath(new URL("../apps/api/", import.meta.url)), env: { ...process.env, NODE_ENV: "test", API_HOST: "127.0.0.1", API_PORT: "55441", ECPAY_ENV: "sandbox", WEB_ORIGIN: "http://127.0.0.1:55430", SENTRY_DSN: "", RESEND_API_KEY: "", JWT_ACCESS_SECRET: secret, CSRF_SECRET: csrfSecret, INTERNAL_SERVICE_TOKEN: internal, ACCOUNT_SECURITY_KEY: randomBytes(32).toString("hex"), ADMIN_MFA_REQUIRED: "false" }, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout?.on("data", (data) => { logs = (logs + data).slice(-4000); }); child.stderr?.on("data", (data) => { logs = (logs + data).slice(-4000); });
    let healthy = false;
    for (let i = 0; i < 100; i++) { try { healthy = (await fetch(base + "/health")).ok; } catch {} if (healthy) break; if (child.exitCode !== null) throw new Error("Isolated API failed to start"); await delay(200); }
    assert.ok(healthy);
    const admission = await Promise.all(contests.map((id) => request(users[0], `/contests/${id}/register`, "POST", {})));
    assert.equal(admission.filter((r) => r.response.ok).length, 1, "One active exam per user even for concurrent admission");
    const selected = admission.find((r) => r.response.ok)!.data; users[0].attempt = { id: selected.id, contestId: selected.contestId };
    for (let i = 1; i < users.length; i++) { const result = await request(users[i], `/contests/${contests[0]}/register`, "POST", {}); assert.ok(result.response.ok); users[i].attempt = { id: result.data.id, contestId: contests[0] }; }
    const detail = (await request(users[0], `/contests/${users[0].attempt.contestId}`)).data; assert.ok(Math.abs(Date.parse(detail.serverNow) - Date.now()) < 5000);
    worker = new Worker(JUDGE_LOCAL_QUEUE_NAME, async (job: { data: { submissionId: string; evaluationVersion: number } }) => {
      const row = await prisma.submission.findUniqueOrThrow({ where: { id: job.data.submissionId } });
      assert.equal(row.problemId, p.id, "Refuse unrelated jobs in the fixture worker");
      async function callback(body: Record<string, unknown>) { const response = await fetch(`${base}/internal/submissions/${row.id}/result`, { method: "POST", headers: { "Content-Type": "application/json", "x-internal-token": internal }, body: JSON.stringify({ submissionId: row.id, evaluationVersion: job.data.evaluationVersion, judgedOn: "SELF", ...body }), signal: AbortSignal.timeout(10000) }); assert.ok(response.ok, `Judge callback returned ${response.status}`); }
      await callback({ status: "JUDGING" }); const fixture = await createDockerSandbox();
      try { const result = await evaluateInSandbox(fixture.sandbox, p, p.testCases, row.languageKey, row.sourceCode); await callback(result); assert.equal(result.status, "AC"); judgeLatencies.push(Date.now() - +row.createdAt); finished++; }
      finally { await fixture.stop(); }
    }, { connection, concurrency: 2 });
    worker.on("failed", () => errors.push({ path: "judge-worker", status: 0 })); worker.on("error", () => errors.push({ path: "judge-connection", status: 0 }));
    const sources = [
      ["cpp17", "#include <iostream>\nint main(){long long a,b;std::cin>>a>>b;std::cout<<a+b<<'\\n';}"],
      ["c11", "#include <stdio.h>\nint main(){long long a,b;scanf(\"%lld%lld\",&a,&b);printf(\"%lld\\n\",a+b);}"],
      ["python3", "import sys\nprint(sum(map(int,sys.stdin.read().split())))\n"],
      ["java17", "import java.util.*; public class Main { public static void main(String[] args) {Scanner s=new Scanner(System.in); long a=s.nextLong(),b=s.nextLong();System.out.println(a+b);}}"],
    ];
    const paths = ["/problems", "/notifications", "/contests/me", "/submissions", "/users/me/daily"], started = performance.now(), until = started + durationSeconds * 1000;
    console.log(JSON.stringify({ event: "load_started", users: 100, seconds: durationSeconds, requestsPerUserPerMinute: 12, submissionsPerMinute: 20 }));
    const progress = setInterval(() => console.log(JSON.stringify({ elapsedSeconds: Math.floor((performance.now() - started) / 1000), requests: latencies.length, submitted: submitted.length, judged: finished, errors: errors.length })), 30000);
    try {
      await Promise.all([
        ...users.map(async (user, index) => { let round = 0; await delay(index * 10); while (performance.now() < until) { await request(user, paths[round++ % paths.length], "GET", undefined, true); await delay(Math.min(5000, Math.max(0, until - performance.now()))); } }),
        (async () => {
          for (let n = 0; performance.now() < until; n++) {
            const user = users[n % users.length], [languageKey, sourceCode] = sources[n % sources.length];
            const result = await request(user, "/submissions", "POST", { problemId: p.id, languageKey, sourceCode, contestId: user.attempt!.contestId, contestParticipantId: user.attempt!.id, clientRequestId: randomUUID() }, true);
            assert.ok(result.response.ok, "Submission must be accepted"); submitted.push(result.data.id);
            // A valid pre-deadline submission still receives its actual judge result after ending.
            if (n === 0) assert.ok((await request(user, `/contests/${user.attempt!.contestId}/end`, "POST", {})).response.ok);
            const counts = await queue.getJobCounts("wait", "active"); maxQueue = Math.max(maxQueue, counts.wait + counts.active);
            await delay(Math.max(0, Math.min(until, started + (n + 1) * 3000) - performance.now()));
          }
        })(),
      ]);
    } finally { clearInterval(progress); }
    for (let i = 0; i < 120 && finished < submitted.length && !errors.length; i++) await delay(500);
    const rows = await prisma.submission.findMany({ where: { id: { in: submitted } }, select: { verdict: true } }); assert.ok(rows.every((r) => r.verdict === "AC")); assert.equal(finished, submitted.length);
    const board = (await request(users[0], `/contests/${users[0].attempt!.contestId}/scoreboard`)).data;
    assert.equal(board.standings.find((row: { userId: string }) => row.userId === users[0].id).solvedCount, 1, "Late callback must still count toward the completed exam");
    const percentile = (values: number[], p: number) => Math.round([...values].sort((a,b) => a-b)[Math.min(values.length-1,Math.ceil(values.length*p)-1)] ?? 0);
    const report = { testedAt: new Date().toISOString(), environment: "Local macOS API with isolated PostgreSQL 16 / Redis 7; real HTTP and BullMQ; production evaluator in disposable Linux Docker, no network/host mounts. Not Railway/Vercel production capacity.", users: 100, durationSeconds, targetSubmissionsPerMinute: 20, requests: latencies.length, submissions: submitted.length, verdicts: { AC: finished }, errors, apiMs: { p50: percentile(latencies,.5), p95: percentile(latencies,.95), p99: percentile(latencies,.99) }, judgeEndToEndMs: { p50: percentile(judgeLatencies,.5), p95: percentile(judgeLatencies,.95), p99: percentile(judgeLatencies,.99) }, maxObservedQueue: maxQueue, concurrentAdmission: "one accepted", lateJudgeScore: "counted", scope: "Reading/authenticated study, four-language compilation and judging, exam ownership and late score callback; excludes password hashing load, remote UVa relay, network failures and production infrastructure." };
    await writeFile(new URL("../docs/launch-readiness/load-drill.json", import.meta.url), JSON.stringify(report,null,2)+"\n"); console.log(JSON.stringify(report));
    assert.equal(errors.length,0); assert.ok(report.apiMs.p95 < 500 && report.apiMs.p99 < 1000, "Local API latency threshold exceeded");
  } finally {
    await worker?.close(); if (child && child.exitCode === null) { const exit = once(child,"exit"); child.kill("SIGTERM"); await exit; }
    for (const id of submitted) { const job = await queue.getJob(`${id}-1`); if (job) await job.remove(); }
    for (const user of users) { await redis.del(`refresh:${user.id}:${user.sid}`,`submit_cooldown:${user.id}`); }
    await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } }); await prisma.contest.deleteMany({ where: { id: { in: contests } } }); if (problemId) await prisma.problem.delete({ where: { id: problemId } });
    await queue.close(); await redis.quit(); await prisma.$disconnect();
    // Deliberately do not emit server logs: request bodies and credentials are not load evidence.
    void logs;
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Local load drill failed"); process.exitCode=1; });
