import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Queue, Worker } from "../apps/judge/node_modules/bullmq";
import { configureRemoteQueue } from "../apps/judge/src/remote/queue-policy";
import { judgeRuntimeConfig } from "../apps/judge/src/runtime-config";
import { fetchWithJar, mapUvaVerdictText } from "../apps/judge/src/remote/uvaClient";
afterEach(() => vi.unstubAllGlobals());
it("does not turn an in-progress compilation into a compilation error", () => {
  expect(mapUvaVerdictText("Compiling")).toBeNull(); expect(mapUvaVerdictText("In judge queue")).toBeNull();
  expect(mapUvaVerdictText("Compilation error")).toBe("CE"); expect(mapUvaVerdictText("Accepted")).toBe("AC");
});
it("never forwards UVa session cookies to a redirect on another origin", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { Location: "https://example.test/collect" } }));
  vi.stubGlobal("fetch", fetcher);
  await expect(fetchWithJar("https://onlinejudge.org/index.php", { session: "synthetic" })).rejects.toThrow("unexpected origin");
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it("rejects unsafe production credentials and remote/local concurrency settings", () => {
  expect(() => judgeRuntimeConfig({ NODE_ENV: "production", INTERNAL_SERVICE_TOKEN: "dev_internal_token" })).toThrow();
  for (const v of ["0", "-1", "6junk", "100", "NaN"]) expect(() => judgeRuntimeConfig({ JUDGE_LOCAL_CONCURRENCY: v })).toThrow();
  expect(() => judgeRuntimeConfig({ JUDGE_CONCURRENCY: "2" })).toThrow();
});
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("remote queue across worker replicas", () => {
  it("allows one active processor across two independent workers", async () => {
    if (process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable Redis required");
    const connection = { url: process.env.REDIS_URL, maxRetriesPerRequest: null };
    const name = `readiness-remote-${randomUUID()}`, queue = new Queue(name, { connection });
    const workers: Worker[] = []; let active = 0, peak = 0, completed = 0;
    try {
      await configureRemoteQueue(queue);
      expect((await queue.getMeta()).max).toBe(1);
      // Keep the production concurrency policy but shorten only the test's 8-second delay.
      await queue.setGlobalRateLimit(1, 50);
      const done = new Promise<void>((resolve, reject) => {
        for (let i = 0; i < 2; i++) {
          const worker = new Worker(name, async () => { active++; peak = Math.max(peak, active); await new Promise((r) => setTimeout(r, 80)); active--; }, { connection, concurrency: 3 });
          workers.push(worker); worker.on("completed", () => { if (++completed === 6) resolve(); }); worker.on("error", reject);
        }
      });
      await queue.addBulk(Array.from({ length: 6 }, (_, i) => ({ name: `fixture-${i}`, data: {} })));
      await done; expect(peak).toBe(1); expect(completed).toBe(6);
    } finally { await Promise.all(workers.map((w) => w.close())); await queue.obliterate({ force: true }); await queue.close(); }
  }, 15_000);
});
