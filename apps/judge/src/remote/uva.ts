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
// UVa's judge is community-run and can be genuinely slow/backlogged — a verdict sometimes takes a
// couple of minutes to appear even when everything is working. Give it a generous window before
// giving up so we don't spuriously report SE on a submission UVa is simply still judging.
const POLL_TIMEOUT_MS = 240_000;
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

  // UVa's submission form needs its own internal problem id ("pid"), which is unrelated to the
  // public problem number everyone knows (uvaId) except by coincidence — submitting with uvaId
  // silently judges against whatever unrelated problem happens to share that internal id. Refuse
  // rather than risk a wrong-problem verdict; see the uvaPid field comment in schema.prisma.
  if (!problem.uvaPid) {
    return {
      status: "SE",
      compileError: `Problem ${problem.uvaId} is missing its UVa internal submission id (uvaPid) — cannot judge safely.`,
    };
  }

  const hints = LANGUAGE_HINTS[languageKey];
  if (!hints) {
    return { status: "SE", compileError: `Language "${languageKey}" has no known UVa equivalent for remote judging.` };
  }

  try {
    await throttle();
    const session = await getSession(username, password);

    // Record the newest existing submission id BEFORE submitting. UVa submission ids are
    // monotonic and the bot account submits strictly serially (throttle + concurrency=1), so the
    // row that appears with the smallest id greater than this is unambiguously ours — a far more
    // robust match than comparing wall-clock timestamps, which broke whenever the judge
    // container's clock drifted a few seconds from UVa's and excluded the real row.
    const before = await fetchMyStatus(session);
    const maxExistingId = before.reduce((max, r) => Math.max(max, r.submissionId), 0);

    await submitSolution(session, problem.uvaPid, hints, sourceCode);

    return await pollForVerdict(session, maxExistingId);
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
 * subs-user-last mirror (which was observed sitting stale for minutes-to-days behind a
 * freshly-judged submission). We identify our row by submission id: the smallest id strictly
 * greater than `afterId` (the newest id that already existed before we submitted) is the one this
 * call created. Its verdict text maps to null while the submission is still queued/compiling/
 * running, so we keep polling until it resolves to a terminal verdict.
 */
async function pollForVerdict(session: UvaSession, afterId: number): Promise<JudgeOutcome> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const rows = await fetchMyStatus(session);
    const newer = rows.filter((r) => r.submissionId > afterId);
    const mine = newer.length ? newer.reduce((a, b) => (a.submissionId < b.submissionId ? a : b)) : undefined;
    if (mine) {
      const mapped = mapUvaVerdictText(mine.verdictText);
      if (mapped) {
        return { status: mapped as Verdict, timeMs: Math.round(mine.runtimeSec * 1000) };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return { status: "SE", compileError: "Timed out waiting for UVa's verdict." };
}
