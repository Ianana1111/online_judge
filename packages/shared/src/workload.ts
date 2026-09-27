import { JUDGE_LOCAL_QUEUE_NAME, JUDGE_REMOTE_QUEUE_NAME, TEST_RUN_QUEUE_NAME, testRunResultChannel } from "./queue.js";
import type { TestRunResultDto } from "./schemas.js";

export const CODE_COOLDOWN_MS = 10_000;
export const MAX_QUEUE_WAIT_MS = 10 * 60_000;
export const WORK_LEASE_MS = 20 * 60_000;
export const RUN_RESULT_TTL_SEC = 3600;
export const WORK_LIMITS = { submit: 300, remote: 20, run: 200 } as const;
export type WorkKind = keyof typeof WORK_LIMITS;
export const WORK_QUEUES = { submit: JUDGE_LOCAL_QUEUE_NAME, remote: JUDGE_REMOTE_QUEUE_NAME, run: TEST_RUN_QUEUE_NAME };
export interface EvalRedis { eval(script: string, numberOfKeys: number, ...args: (string | number)[]): Promise<unknown> }
export const workKey = (kind: WorkKind) => `oj:work:${kind}`;
export const userWorkKey = (userId: string) => `oj:work:user:${userId}`;
export const runKey = (id: string, field: string) => `testrun:${id}:${field}`;

export class WorkloadRejected extends Error {
  constructor(public readonly reason: "COOLDOWN" | "USER_LIMIT" | "BUSY" | "QUOTA" | "UNAVAILABLE", public readonly retryAfterSeconds = 10) { super(reason); }
}

// Admission, account fairness, cooldown and Run quota are a single Redis transaction. Counting
// BullMQ's existing jobs also bounds admission after a Redis lease expires or an older rollout.
const RESERVE = `
local time = redis.call('TIME')
local now = time[1] * 1000 + math.floor(time[2] / 1000)
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now)
redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', now)
local ttl = redis.call('PTTL', KEYS[3])
if ttl > 0 then return {1, math.ceil(ttl / 1000)} end
if redis.call('EXISTS', KEYS[12]) == 1 then return {5, 15} end
local memory = redis.call('GET', 'oj:redis:memory')
if not memory then
  memory = string.match(redis.call('INFO', 'memory'), 'used_memory:(%d+)') or '0'
  redis.call('SET', 'oj:redis:memory', memory, 'EX', 1)
end
if tonumber(memory) >= 268435456 then return {5, 15} end
if redis.call('ZCARD', KEYS[2]) >= 3 then return {2, 10} end
local queued = redis.call('LLEN', KEYS[4]) + redis.call('LLEN', KEYS[5]) + redis.call('LLEN', KEYS[6]) + redis.call('ZCARD', KEYS[7])
local admitted = redis.call('ZCARD', KEYS[1])
if math.max(queued, admitted) >= tonumber(ARGV[3]) then return {3, 15} end
-- Include old jobs without reservations after a rollout/outage, without double counting jobs
-- that have both a reservation and a BullMQ entry. At this point the scan is capacity-bounded.
for k = 4, 7 do
  local jobs
  if k == 7 then jobs = redis.call('ZRANGE', KEYS[k], 0, -1) else jobs = redis.call('LRANGE', KEYS[k], 0, -1) end
  for _, job in ipairs(jobs) do
    local id = job
    if ARGV[7] == '' then id = string.match(job, '^(.-)%-%d+$') or job end
    if not redis.call('ZSCORE', KEYS[1], id) then admitted = admitted + 1 end
  end
end
if admitted >= tonumber(ARGV[3]) then return {3, 15} end
if ARGV[5] ~= '' and tonumber(redis.call('GET', KEYS[8]) or '0') >= tonumber(ARGV[6]) then return {4, 0} end
redis.call('SET', KEYS[3], ARGV[1], 'PX', ARGV[4])
redis.call('ZADD', KEYS[1], now + tonumber(ARGV[2]), ARGV[1])
redis.call('ZADD', KEYS[2], now + tonumber(ARGV[2]), ARGV[1])
redis.call('PEXPIRE', KEYS[1], ARGV[2])
redis.call('PEXPIRE', KEYS[2], ARGV[2])
if ARGV[7] ~= '' then
  redis.call('SET', KEYS[9], ARGV[7], 'EX', ARGV[9])
  redis.call('SET', KEYS[10], ARGV[8], 'EX', 3456000)
  if ARGV[5] ~= '' then
    redis.call('INCR', KEYS[8])
    redis.call('EXPIRE', KEYS[8], 3456000)
    redis.call('SET', KEYS[11], ARGV[5], 'EX', 3456000)
  end
end
return {0, 0}`;

export async function reserveWork(redis: EvalRedis, kind: WorkKind, userId: string, id: string, quota?: { key: string; limit: number }) {
  const prefix = `bull:${WORK_QUEUES[kind]}:`;
  let result: number[];
  try {
    result = await redis.eval(RESERVE, 12, workKey(kind), userWorkKey(userId), `${kind === "run" ? "run" : "submit"}_cooldown:${userId}`,
      `${prefix}wait`, `${prefix}active`, `${prefix}paused`, `${prefix}delayed`, quota?.key ?? "oj:unused",
      runKey(id, "result"), runKey(id, "owner"), runKey(id, "quota"), "oj:judge:backoff",
      id, WORK_LEASE_MS, WORK_LIMITS[kind], CODE_COOLDOWN_MS, quota?.key ?? "", quota?.limit ?? 0,
      kind === "run" ? JSON.stringify({ runId: id, status: "RUNNING" }) : "", userId, RUN_RESULT_TTL_SEC) as number[];
  } catch { throw new WorkloadRejected("UNAVAILABLE", 15); }
  const reasons = ["COOLDOWN", "USER_LIMIT", "BUSY", "QUOTA", "UNAVAILABLE"] as const;
  if (result[0]) throw new WorkloadRejected(reasons[result[0] - 1], result[1]);
}

export async function releaseWork(redis: EvalRedis, kind: WorkKind, userId: string, id: string, clearCooldown = false) {
  await redis.eval(`redis.call('ZREM', KEYS[1], ARGV[1]); redis.call('ZREM', KEYS[2], ARGV[1]);
    if ARGV[2] == '1' and redis.call('GET', KEYS[3]) == ARGV[1] then redis.call('DEL', KEYS[3]) end; return 1`,
  3, workKey(kind), userWorkKey(userId), `${kind === "run" ? "run" : "submit"}_cooldown:${userId}`, id, clearCooldown ? "1" : "0");
}

/** First terminal result wins. A service error refunds exactly once, in the original month.
 * Workers write here directly, so an API callback outage cannot lose a completed Run. */
export async function finishRun(redis: EvalRedis, result: TestRunResultDto) {
  if (result.status === "RUNNING") return;
  // Bound retained output across all cases, including UTF-8. The comparison already used full
  // output in the sandbox evaluator; only the user's display payload is truncated here.
  let remaining = 48 * 1024;
  const bounded = { ...result, compileError: result.compileError?.slice(0, 8000), cases: result.cases?.map((item) => {
    const excerpt = (text: string) => { const bytes = Buffer.from(text); const kept = bytes.subarray(0, Math.min(remaining, bytes.length)); remaining -= kept.length; return kept.toString(); };
    const stdout = excerpt(item.stdout), stderr = excerpt(item.stderr);
    return { ...item, stdout, stderr, outputTruncated: item.outputTruncated || stdout.length < item.stdout.length || stderr.length < item.stderr.length };
  }) };
  let serialized = JSON.stringify(bounded);
  while (Buffer.byteLength(serialized) > 64 * 1024 && bounded.cases?.some((c) => c.stdout || c.stderr)) {
    bounded.cases = bounded.cases.map((c) => ({ ...c, stdout: c.stdout.slice(0, Math.floor(c.stdout.length / 2)), stderr: c.stderr.slice(0, Math.floor(c.stderr.length / 2)), outputTruncated: true }));
    serialized = JSON.stringify(bounded);
  }
  await redis.eval(`
    local owner = redis.call('GET', KEYS[2])
    if not owner then return 0 end
    local previous = redis.call('GET', KEYS[1])
    if previous and cjson.decode(previous).status ~= 'RUNNING' then return 0 end
    local quota = redis.call('GET', KEYS[3])
    if ARGV[3] == 'ERROR' and quota and tonumber(redis.call('GET', quota) or '0') > 0 then redis.call('DECR', quota) end
    redis.call('DEL', KEYS[3])
    redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
    redis.call('EXPIRE', KEYS[2], ARGV[2])
    redis.call('ZREM', KEYS[4], ARGV[4])
    redis.call('ZREM', 'oj:work:user:' .. owner, ARGV[4])
    local t = redis.call('TIME'); local now = tonumber(t[1])
    redis.call('ZREMRANGEBYSCORE', KEYS[6], '-inf', now - tonumber(ARGV[2]))
    redis.call('ZADD', KEYS[6], now, ARGV[4])
    local excess = redis.call('ZCARD', KEYS[6]) - 1000
    if excess > 0 then
      for _, old in ipairs(redis.call('ZRANGE', KEYS[6], 0, excess - 1)) do
        redis.call('DEL', 'testrun:' .. old .. ':result', 'testrun:' .. old .. ':owner', 'testrun:' .. old .. ':quota')
        redis.call('ZREM', KEYS[6], old)
      end
    end
    redis.call('EXPIRE', KEYS[6], ARGV[2])
    redis.call('PUBLISH', KEYS[5], ARGV[1])
    return 1`, 6, runKey(result.runId, "result"), runKey(result.runId, "owner"), runKey(result.runId, "quota"),
  workKey("run"), testRunResultChannel(result.runId), "oj:run:results", serialized, RUN_RESULT_TTL_SEC, result.status, result.runId);
}
