import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { reserveWork, releaseWork, finishRun, runKey, workKey, userWorkKey, WORK_LIMITS, FREE_RUN_QUOTA, WorkloadRejected } from "../packages/shared/src/index";
import { configureLocalQueue } from "../apps/judge/src/queue-policy";

const requireApi = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { Redis } = requireApi("ioredis") as typeof import("../apps/api/node_modules/ioredis");
const { Queue, Worker } = requireApi("bullmq") as typeof import("../apps/api/node_modules/bullmq");

describe.skipIf(process.env.RUN_DB_TESTS !== "1")("judge admission under pressure (isolated Redis)", () => {
  let redis: InstanceType<typeof Redis>;
  const users = new Set<string>(), ids = new Set<string>(), quotas = new Set<string>();
  const user = () => { const id = `capacity-${randomUUID()}`; users.add(id); return id; };
  const runId = () => { const id = randomUUID(); ids.add(id); return id; };
  beforeAll(async () => {
    if (process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable Redis required");
    redis = new Redis(process.env.REDIS_URL);
    await redis.ping();
  });
  afterAll(async () => {
    for (const id of ids) {
      await redis.zrem(workKey("submit"), id); await redis.zrem(workKey("run"), id);
      await redis.del(...["owner", "result", "quota"].map((field) => runKey(id, field)));
    }
    for (const id of users) await redis.del(userWorkKey(id), `run_cooldown:${id}`, `submit_cooldown:${id}`);
    for (const key of quotas) await redis.del(key);
    await redis.quit();
  });

  it("atomically bounds a 1,000-request burst to the admission capacity", async () => {
    const existing = await redis.zcount(workKey("submit"), Date.now(), "+inf");
    const entries = Array.from({ length: 1000 }, () => ({ user: user(), id: runId() }));
    const outcomes = await Promise.allSettled(entries.map((e) => reserveWork(redis, "submit", e.user, e.id)));
    expect(outcomes.filter((r) => r.status === "fulfilled")).toHaveLength(WORK_LIMITS.submit - existing);
    expect(outcomes.filter((r) => r.status === "rejected").every((r) => r.status === "rejected" && r.reason instanceof WorkloadRejected && r.reason.reason === "BUSY")).toBe(true);
    await Promise.all(entries.map((e) => releaseWork(redis, "submit", e.user, e.id, true)));
  });

  it("enforces 10 seconds across tabs and three unfinished jobs across Run and Submit", async () => {
    const owner = user(), first = runId();
    const results = await Promise.allSettled(Array.from({ length: 30 }, () => reserveWork(redis, "run", owner, runId())));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await redis.pttl(`run_cooldown:${owner}`)).toBeGreaterThan(9000);
    await reserveWork(redis, "submit", owner, first);
    await redis.del(`run_cooldown:${owner}`);
    await reserveWork(redis, "run", owner, runId());
    await redis.del(`run_cooldown:${owner}`);
    await expect(reserveWork(redis, "run", owner, runId())).rejects.toMatchObject({ reason: "USER_LIMIT" });
    await releaseWork(redis, "submit", owner, first);
  });

  it("allows exactly 20 free runs, never increments on rejection, and protects the final slot from races", async () => {
    expect(FREE_RUN_QUOTA).toBe(20);
    const owner = user(), key = `run_quota:${owner}:2026-09`; quotas.add(key);
    for (let n = 0; n < 19; n++) {
      const id = runId();
      await reserveWork(redis, "run", owner, id, { key, limit: FREE_RUN_QUOTA });
      await finishRun(redis, { runId: id, status: "DONE", cases: [] });
      await redis.del(`run_cooldown:${owner}`);
    }
    const outcomes = await Promise.allSettled(Array.from({ length: 40 }, () => reserveWork(redis, "run", owner, runId(), { key, limit: FREE_RUN_QUOTA })));
    expect(outcomes.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    await redis.del(`run_cooldown:${owner}`);
    await expect(reserveWork(redis, "run", owner, runId(), { key, limit: FREE_RUN_QUOTA })).rejects.toMatchObject({ reason: "QUOTA" });
    expect(await redis.get(key)).toBe("20");
  });

  it("refunds a system failure exactly once in its original month and never overwrites a result", async () => {
    const owner = user(), id = runId(), key = `run_quota:${owner}:2026-08`; quotas.add(key);
    await reserveWork(redis, "run", owner, id, { key, limit: 20 });
    await Promise.all(Array.from({ length: 30 }, () => finishRun(redis, { runId: id, status: "ERROR" })));
    expect(await redis.get(key)).toBe("0");
    expect(await redis.zscore(userWorkKey(owner), id)).toBeNull();
    expect(await redis.ttl(runKey(id, "owner"))).toBeGreaterThan(3500);
    await finishRun(redis, { runId: id, status: "DONE" });
    expect(JSON.parse((await redis.get(runKey(id, "result")))!).status).toBe("ERROR");
  });

  it("does not refund compiler/user errors and does not charge Pro runs", async () => {
    const owner = user(), id = runId(), key = `run_quota:${owner}:2026-09`; quotas.add(key);
    await reserveWork(redis, "run", owner, id, { key, limit: 20 });
    await finishRun(redis, { runId: id, status: "COMPILE_ERROR" });
    expect(await redis.get(key)).toBe("1");
    await redis.del(`run_cooldown:${owner}`);
    const pro = runId(); await reserveWork(redis, "run", owner, pro);
    await finishRun(redis, { runId: pro, status: "DONE" });
    expect(await redis.get(key)).toBe("1");
  });

  it("bounds serialized outputs even when a program prints escaping characters", async () => {
    const owner = user(), id = runId();
    await reserveWork(redis, "run", owner, id);
    await finishRun(redis, { runId: id, status: "DONE", cases: Array.from({ length: 8 }, (_, n) => ({ id: String(n), stdout: "\u0000".repeat(100000), stderr: "中".repeat(8000), timeMs: 1, exitCode: 0, timedOut: false, verdict: "AC" })) });
    const saved = (await redis.get(runKey(id, "result")))!;
    expect(Buffer.byteLength(saved)).toBeLessThanOrEqual(64 * 1024);
    expect(JSON.parse(saved).cases[0]).toMatchObject({ verdict: "AC", outputTruncated: true });
  });

  it("leaves quota untouched while the Sandbox circuit is open", async () => {
    const owner = user(), key = `run_quota:${owner}:2026-09`; quotas.add(key);
    await redis.set("oj:judge:backoff", "1", "EX", 1);
    try {
      await expect(reserveWork(redis, "run", owner, runId(), { key, limit: 20 })).rejects.toMatchObject({ reason: "UNAVAILABLE" });
      expect(await redis.get(key)).toBeNull();
    } finally { await redis.del("oj:judge:backoff"); }
  });

  it("fails closed when Redis cannot validate admission", async () => {
    await expect(reserveWork({ eval: async () => { throw new Error("offline"); } }, "run", user(), runId())).rejects.toMatchObject({ reason: "UNAVAILABLE" });
  });

  it("holds both queues to 50 each even with two worker replicas (100 active total)", async () => {
    const connection = { url: process.env.REDIS_URL, maxRetriesPerRequest: null };
    const queues = [new Queue(`capacity-submit-${randomUUID()}`, { connection }), new Queue(`capacity-run-${randomUUID()}`, { connection })];
    const workers: InstanceType<typeof Worker>[] = [];
    const active = [0, 0], peak = [0, 0]; let completed = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    try {
      for (let q = 0; q < 2; q++) {
        await configureLocalQueue(queues[q], 50);
        for (let replica = 0; replica < 2; replica++) {
          const worker = new Worker(queues[q].name, async () => { active[q]++; peak[q] = Math.max(peak[q], active[q]); await gate; active[q]--; }, { connection, concurrency: 50 });
          worker.on("completed", () => completed++); workers.push(worker);
        }
        await queues[q].addBulk(Array.from({ length: 100 }, (_, n) => ({ name: `job-${n}`, data: {} })));
      }
      const deadline = Date.now() + 10_000;
      while (active[0] + active[1] < 100 && Date.now() < deadline) await new Promise((r) => setTimeout(r, 20));
      expect(active).toEqual([50, 50]);
      release();
      while (completed < 200 && Date.now() < deadline) await new Promise((r) => setTimeout(r, 20));
      expect(completed).toBe(200); expect(peak).toEqual([50, 50]);
    } finally {
      release(); await Promise.all(workers.map((w) => w.close()));
      for (const q of queues) { await q.obliterate({ force: true }); await q.close(); }
    }
  }, 15000);
});
