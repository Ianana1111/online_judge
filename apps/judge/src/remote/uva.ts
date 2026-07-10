import type { Problem } from "@oj/db";
import type { Verdict } from "@oj/shared";
import { fetchMyStatus, mapUvaVerdictText, submitSolution, uvaLogin, type UvaSession } from "./uvaClient.js";

export interface JudgeOutcome {
  status: Verdict;
  timeMs?: number;
  memoryKb?: number;
  score?: number;
  compileError?: string;
}

const LANGUAGE_HINTS: Record<string, string[]> = {
  cpp17: ["c++11", "c++17", "c++"],
  c11: ["c11", "c99", "ansi c"],
  python3: ["python 3", "python"],
  java17: ["java"],
};

const MIN_GAP_MS = 8_000; // be a good citizen towards a community-run site; also lowers ban risk
const POLL_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 5_000;

let cachedSession: UvaSession | null = null;
let lastSubmitAt = 0;

async function throttle(): Promise<void> {
  const wait = lastSubmitAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastSubmitAt = Date.now();
}

async function getSession(username: string, password: string): Promise<UvaSession> {
  if (!cachedSession) cachedSession = await uvaLogin(username, password);
  return cachedSession;
}

/**
 * Judges a submission against onlinejudge.org for problems we have no local test data for.
 * Best-effort: there is no submission API, so this drives the same web form a human uses (see
 * remote/uvaClient.ts) and reads the verdict back from uHunt's read-only stats API. Requires
 * UVA_BOT_USERNAME/UVA_BOT_PASSWORD to be configured — a dedicated bot account is strongly
 * recommended over a personal one (see remote/README.md).
 */
export async function judgeViaUva(problem: Problem, languageKey: string, sourceCode: string): Promise<JudgeOutcome> {
  const username = process.env.UVA_BOT_USERNAME;
  const password = process.env.UVA_BOT_PASSWORD;

  if (!username || !password || !problem.uvaId) {
    return {
      status: "SE",
      compileError:
        "Remote judging is not configured (missing UVA_BOT_USERNAME/UVA_BOT_PASSWORD, or this problem has no uvaId).",
    };
  }

  const hints = LANGUAGE_HINTS[languageKey];
  if (!hints) {
    return { status: "SE", compileError: `Language "${languageKey}" has no known UVa equivalent for remote judging.` };
  }

  try {
    await throttle();
    const session = await getSession(username, password);
    const { submittedAtUnix } = await submitSolution(session, problem.uvaId, hints, sourceCode);

    return await pollMyStatus(session, submittedAtUnix);
  } catch (err) {
    // Most failure modes here (bad session, markup drift, stale localId) look the same from the
    // caller's side — drop the cached session so the next attempt starts clean instead of
    // repeating whatever just broke.
    cachedSession = null;
    return { status: "SE", compileError: `Remote judge error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Polls onlinejudge.org's own "My Submissions" status page (Itemid=9) rather than uHunt's
 * subs-user-last mirror. The status table has no stable problem-number column we can match on
 * (its `problem=` link parameter is an internal localid, not the public UVa number, and is
 * sometimes blank for problems the site's own title lookup doesn't resolve) — but since this bot
 * account only ever has one submission in flight at a time (see `throttle()`), the row with the
 * *oldest* timestamp that's still >= our own submit time is unambiguously ours, even if a later
 * submission's row has since landed above it.
 */
async function pollMyStatus(session: UvaSession, submittedAfterUnix: number): Promise<JudgeOutcome> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  const afterMs = (submittedAfterUnix - 5) * 1000;
  while (Date.now() < deadline) {
    const rows = await fetchMyStatus(session);
    const candidates = rows.filter((r) => r.submittedAt.getTime() >= afterMs);
    const match = candidates[candidates.length - 1]; // rows are newest-first; oldest candidate = ours
    if (match) {
      const mapped = mapUvaVerdictText(match.verdictText);
      if (mapped) {
        return { status: mapped as Verdict, timeMs: Math.round(match.runtimeSec * 1000) };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return { status: "SE", compileError: "Timed out waiting for UVa's verdict." };
}
