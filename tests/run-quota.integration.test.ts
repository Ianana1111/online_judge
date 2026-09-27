import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { afterAll, beforeAll, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { RunsService } from "../apps/api/src/runs/runs.service";
import { currentMonthKey } from "../apps/api/src/billing/billing.service";
import { TEST_RUN_QUEUE_NAME } from "../packages/shared/src/queue";
const requireApi = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { Redis } = requireApi("ioredis") as typeof import("../apps/api/node_modules/ioredis");
const { Queue } = requireApi("bullmq") as typeof import("../apps/api/node_modules/bullmq");
let redis: InstanceType<typeof Redis>, queue: InstanceType<typeof Queue>, service: RunsService;
const users: string[] = [], problems: string[] = [], runs: string[] = [];
beforeAll(async () => {
  if (process.env.RUN_DB_TESTS !== "1") return;
  const url = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Disposable database/Redis required");
  redis = new Redis(process.env.REDIS_URL); await redis.ping();
  queue = new Queue(TEST_RUN_QUEUE_NAME, { connection: { url: process.env.REDIS_URL, maxRetriesPerRequest: null } });
  service = new RunsService(queue, redis);
});
afterAll(async () => {
  if (!redis) return;
  for (const id of runs) { await (await queue.getJob(id))?.remove(); await redis.del(`testrun:${id}:owner`, `testrun:${id}:result`, `testrun:${id}:quota`); await redis.zrem("oj:run:results", id); await redis.zrem("oj:work:run", id); }
  for (const id of users) await redis.del(`run_cooldown:${id}`, `oj:work:user:${id}`, `run_quota:${id}:${currentMonthKey()}`);
  await prisma.user.deleteMany({ where: { id: { in: users } } }); await prisma.problem.deleteMany({ where: { id: { in: problems } } });
  await queue.close(); await redis.quit(); await prisma.$disconnect();
});
async function fixture() {
  const id = randomUUID();
  const user = await prisma.user.create({ data: { handle: `quota_${id}`, email: `${id}@example.test` } }); users.push(user.id);
  const problem = await prisma.problem.create({ data: { slug: `quota-${id}`, title: "quota fixture", statementMd: "Fixture", samples: { create: { ord: 1, input: "1", output: "1" } } } }); problems.push(problem.id);
  return { user, dto: { problemId: problem.id, languageKey: "cpp17" as const, sourceCode: "int main(){}", cases: [{ id: "s1", sampleOrd: 1 }] } };
}
it.skipIf(process.env.RUN_DB_TESTS !== "1")("enforces quota through the actual service and Pro entitlement, and refunds an enqueue failure", async () => {
  const { user, dto } = await fixture();
  for (let n = 0; n < 20; n++) {
    const { id } = await service.create(user.id, dto); runs.push(id);
    await expect(service.create(user.id, dto)).rejects.toMatchObject({ status: 429 });
    await service.applyResult({ runId: id, status: "COMPILE_ERROR" });
    await redis.del(`run_cooldown:${user.id}`); // Simulate elapsed time, only for this fixture.
  }
  await expect(service.create(user.id, dto)).rejects.toMatchObject({ status: 403 });
  expect(await service.usage(user.id)).toMatchObject({ used: 20, limit: 20, remaining: 0 });
  await prisma.user.update({ where: { id: user.id }, data: { plan: "PRO", planExpiresAt: new Date(Date.now() + 60000) } });
  const pro = await service.create(user.id, dto); runs.push(pro.id);
  await service.applyResult({ runId: pro.id, status: "ERROR" });
  expect(await service.usage(user.id)).toMatchObject({ used: 20, limit: null, remaining: null });
  const other = await fixture();
  const offline = new RunsService({ add: async () => { throw new Error("queue offline"); } } as never, redis);
  await expect(offline.create(other.user.id, other.dto)).rejects.toMatchObject({ status: 503 });
  expect(await service.usage(other.user.id)).toMatchObject({ used: 0, remaining: 20 });
});
