import type { EvalRedis } from "@oj/shared";
export async function recordExecution(redis: EvalRedis, kind: "submit" | "run", queuedAt: number, startedAt: number, failed: boolean) {
  await redis.eval(`redis.call('LPUSH', KEYS[1], ARGV[1]); redis.call('LTRIM', KEYS[1], 0, 999); redis.call('EXPIRE', KEYS[1], 3600); return 1`,
    1, `oj:metrics:${kind}`, JSON.stringify({ at: Date.now(), waitMs: Math.max(0, startedAt - queuedAt), durationMs: Date.now() - startedAt, failed })).catch(() => {});
}
