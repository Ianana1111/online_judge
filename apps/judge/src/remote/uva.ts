import type { Problem } from "@oj/db";
import type { Verdict } from "@oj/shared";
import type { JudgeOutcome } from "../runners.js";
import {
  findUhuntUid,
  submitSolution,
  uhuntRecentSubmissions,
  uvaLogin,
  UHUNT_VERDICT,
  type UvaSession,
} from "./uvaClient.js";

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
let cachedUid: number | null = null;
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

    if (!cachedUid) cachedUid = await findUhuntUid(session);
    return await pollUhunt(cachedUid, problem.uvaId, submittedAtUnix);
  } catch (err) {
    // Most failure modes here (bad session, markup drift, stale localId) look the same from the
    // caller's side — drop the cached session so the next attempt starts clean instead of
    // repeating whatever just broke.
    cachedSession = null;
    return { status: "SE", compileError: `Remote judge error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function pollUhunt(uid: number, uvaProblemNumber: number, submittedAfterUnix: number): Promise<JudgeOutcome> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const subs = await uhuntRecentSubmissions(uid, 20);
    const match = subs.find(
      (s) => s.problemId === uvaProblemNumber && s.submittedAtUnix >= submittedAfterUnix - 5,
    );
    if (match) {
      const mapped = UHUNT_VERDICT[match.verdictCode];
      if (mapped && mapped !== "PENDING") {
        return { status: mapped as Verdict, timeMs: match.runtimeCs * 10 };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return { status: "SE", compileError: "Timed out waiting for UVa's verdict (uHunt never reported one)." };
}
