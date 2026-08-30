import type { Sandbox } from "@vercel/sandbox";
import { createJudgeSandbox } from "./sandboxRun.js";

/**
 * A small standby pool of pre-booted, NEVER-YET-USED sandboxes — the microVM boot (Sandbox.create)
 * is very likely the single largest chunk of per-submission latency, and it happens on the critical
 * path of every judge/run today even though nothing about a submission depends on which specific
 * sandbox it lands in. This lets that boot happen ahead of time, off the critical path, while a
 * submission is still being typed/queued.
 *
 * Security invariant this must never break: a pooled sandbox is claimed by AT MOST ONE caller, ever,
 * and that caller is the only code that ever runs anything in it — identical to a sandbox created
 * fresh via Sandbox.create() today. Nothing here reuses a sandbox across two different jobs/users;
 * pooling only changes *when* the boot happens, never *how many users* a given sandbox serves. A
 * pool member that's claimed is immediately removed from the pool (synchronous check-and-remove, no
 * `await` in between) so two racing claims can never receive the same instance.
 *
 * Cost/quota discipline: this does NOT keep sandboxes warm around the clock — replenishment only
 * runs for REPLENISH_QUIET_MS after the most recent real judge/run job, and a background sweep tears
 * the pool down once things go quiet. An always-on pool would bill idle Provisioned Memory 24/7 and
 * permanently eat into the (Hobby-plan) 10-concurrent-sandbox ceiling; this only costs anything
 * during an actual burst of activity.
 */

interface PoolMember {
  sandbox: Sandbox;
  createdAt: number;
}

const POOL_SIZE = Math.max(0, parseInt(process.env.JUDGE_POOL_SIZE ?? "1", 10));
// A pooled sandbox older than this is treated as stale and discarded rather than handed out, even
// though Vercel's own MEMBER_INITIAL_TIMEOUT_MS below hasn't expired it yet — a deliberately tighter
// self-imposed bound than the hard safety net, so we never try to trust a member that's been sitting
// around long enough to make "is it actually still healthy" a real question.
const MEMBER_MAX_AGE_MS = 8 * 60 * 1000;
// Vercel-side safety net, independent of our own bookkeeping: if this process crashes, restarts, or
// has a bug that stops it from ever claiming or explicitly stopping a pooled sandbox, Vercel itself
// tears it down this long after creation regardless. An idle pooled sandbox can never outlive this
// no matter what our own code does or fails to do.
const MEMBER_INITIAL_TIMEOUT_MS = 10 * 60 * 1000;
// How long after the *last* real judge/run job we keep topping the pool back up. Chosen to cover
// someone actively iterating on one submission (write, test, fix, resubmit) rather than to keep
// anything warm indefinitely — once nobody's actually used the judge for this long, standing up
// spares stops being worth what they cost to keep provisioned.
const REPLENISH_QUIET_MS = 5 * 60 * 1000;

let pool: PoolMember[] = [];
let lastActivityAt = 0;
let replenishing = false;

function isFresh(member: PoolMember): boolean {
  return Date.now() - member.createdAt < MEMBER_MAX_AGE_MS;
}

async function stopSafely(sandbox: Sandbox): Promise<void> {
  await sandbox.stop().catch(() => {});
}

/**
 * Pops a pre-booted, never-used sandbox off the pool if a fresh one is available, and extends its
 * timeout by `timeoutMs` so the caller gets at least as much time as a freshly-created sandbox
 * would have. Returns null when the pool is empty, its next member is stale, or the extend call
 * itself fails (e.g. it expired server-side in the instant between being popped and extended) — in
 * every one of those cases the caller MUST fall back to creating a sandbox the normal way. This is
 * purely a latency optimization, never a dependency: judging must work identically with the pool
 * permanently empty (JUDGE_POOL_SIZE=0), just slower.
 */
export async function tryClaimPooledSandbox(timeoutMs: number): Promise<Sandbox | null> {
  let member = pool.shift();
  while (member && !isFresh(member)) {
    void stopSafely(member.sandbox);
    member = pool.shift();
  }
  if (!member) return null;

  try {
    await member.sandbox.extendTimeout(timeoutMs);
  } catch (err) {
    console.error("[sandboxPool] claimed sandbox failed to extend (discarding, falling back):", err);
    void stopSafely(member.sandbox);
    return null;
  }
  return member.sandbox;
}

async function replenish(snapshotId: string): Promise<void> {
  if (replenishing) return; // one replenishment pass in flight at a time
  replenishing = true;
  try {
    // Drop anything that's aged out before deciding how many more to create.
    const fresh: PoolMember[] = [];
    for (const m of pool) {
      if (isFresh(m)) fresh.push(m);
      else void stopSafely(m.sandbox);
    }
    pool = fresh;

    while (pool.length < POOL_SIZE) {
      try {
        const sandbox = await createJudgeSandbox(snapshotId, MEMBER_INITIAL_TIMEOUT_MS);
        pool.push({ sandbox, createdAt: Date.now() });
      } catch (err) {
        // Don't spin on a persistent failure (e.g. a transient rate limit) — the next real job's
        // notePoolActivity call will trigger another attempt. Real judging never depends on this
        // succeeding (see tryClaimPooledSandbox's own contract).
        console.error("[sandboxPool] failed to prewarm a spare sandbox:", err);
        break;
      }
    }
  } finally {
    replenishing = false;
  }
}

/**
 * Called by every real judge/run job — whether or not it ended up claiming a pooled sandbox — to
 * mark the site as actively in use and kick off background replenishment for whichever job comes
 * next. Deliberately fire-and-forget: this must never add latency to the job that triggered it.
 */
export function notePoolActivity(snapshotId: string): void {
  lastActivityAt = Date.now();
  void replenish(snapshotId);
}

// Background sweep: once nobody's actually judging/running anything for REPLENISH_QUIET_MS, stop
// paying for idle sandboxes immediately rather than waiting out their own MEMBER_INITIAL_TIMEOUT_MS
// — cost only ever accrues during a real burst of activity, never around the clock.
setInterval(() => {
  if (pool.length === 0 || Date.now() - lastActivityAt < REPLENISH_QUIET_MS) return;
  const stale = pool;
  pool = [];
  console.log(`[sandboxPool] quiet for ${REPLENISH_QUIET_MS}ms — tearing down ${stale.length} idle spare(s)`);
  for (const m of stale) void stopSafely(m.sandbox);
}, 60_000).unref();

/** Read-only snapshot for the health endpoint (health.ts) — lets a human see whether the pool is
 * actually doing anything (size, how recently it was used) without needing to grep worker logs. */
export function getPoolStatus(): { size: number; maxSize: number; secondsSinceLastActivity: number | null } {
  return {
    size: pool.length,
    maxSize: POOL_SIZE,
    secondsSinceLastActivity: lastActivityAt ? Math.round((Date.now() - lastActivityAt) / 1000) : null,
  };
}

/** Graceful-shutdown hook (see worker.ts) — stops whatever's left in the pool immediately rather
 * than leaving it to Vercel's own timeout, so a deliberate restart/deploy doesn't leave sandboxes
 * running any longer than necessary. */
export async function drainSandboxPool(): Promise<void> {
  const members = pool;
  pool = [];
  await Promise.all(members.map((m) => stopSafely(m.sandbox)));
}
