import { randomUUID } from "node:crypto";
import type { Sandbox } from "@vercel/sandbox";
import type { EvalRedis } from "@oj/shared";

let redis: EvalRedis | undefined;
const leases = new WeakMap<Sandbox, string>();
export function configureSandboxCapacity(client: EvalRedis) { redis = client; }
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Include sandboxes still stopping in the global 100-slot budget. The lease outlives the VM's
 * hard deadline even if the worker crashes or the stop response is lost. */
export async function reserveSandbox(timeoutMs: number) {
  if (!redis) return undefined; // Offline validation supplies its own sandbox lifecycle.
  const id = randomUUID();
  const deadline = Date.now() + 30_000;
  do {
    const acquired = await redis.eval(`
      local t = redis.call('TIME'); local now = t[1] * 1000 + math.floor(t[2] / 1000)
      redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now)
      if redis.call('EXISTS', KEYS[2]) == 1 then return -1 end
      if redis.call('ZCARD', KEYS[1]) >= 100 then return 0 end
      redis.call('ZADD', KEYS[1], now + tonumber(ARGV[2]), ARGV[1]); redis.call('PEXPIRE', KEYS[1], ARGV[2]); return 1`,
    2, "oj:sandboxes", "oj:judge:backoff", id, timeoutMs + 60_000);
    if (acquired === 1) return id;
    if (acquired === -1) throw new Error("Sandbox service is cooling down");
    await wait(250 + Math.random() * 250);
  } while (Date.now() < deadline);
  throw new Error("Sandbox capacity temporarily full");
}
export function attachSandboxLease(sandbox: Sandbox, lease?: string) { if (lease) leases.set(sandbox, lease); }
export async function stopJudgeSandbox(sandbox: Sandbox) {
  await sandbox.stop({ signal: AbortSignal.timeout(15_000) });
  const lease = leases.get(sandbox);
  if (lease && redis) await redis.eval("return redis.call('ZREM', KEYS[1], ARGV[1])", 1, "oj:sandboxes", lease);
}
export async function noteSandboxFailure(error: unknown) {
  if (!redis) return;
  const e = error as { response?: { status?: number }; status?: number };
  const status = e?.response?.status ?? e?.status;
  if (status && status !== 429 && status < 500) return;
  await redis.eval(`local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 30) end;
    if n >= 3 then redis.call('SET', KEYS[2], '1', 'EX', 15) end; return n`,
  2, "oj:sandbox:create-errors", "oj:judge:backoff").catch(() => {});
}
