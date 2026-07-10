/**
 * Derives a 1-4 star difficulty rating from uHunt's data for a UVa problem
 * (https://uhunt.onlinejudge.org/api/p — documented field order below) rather than guessing.
 * There's no official CPE difficulty scale published anywhere (the exam listing pages only show
 * problem order P1..P7, no star rating), so this is the most objective signal available.
 *
 * Ranked by DACU (distinct accepted users) — NOT accept rate. First attempt used accept rate and
 * it was badly miscalibrated: famous, genuinely-easy "first problem ever" classics like Hashmat
 * the Brave Warrior and The 3n+1 Problem have LOW accept rates precisely because they attract a
 * huge volume of complete first-time judge users who fumble the *judge* (int overflow, EOF
 * handling, output formatting) rather than the problem itself - accept rate conflates "trips up
 * judge newcomers" with "conceptually hard." DACU sidesteps that: it just counts how many people
 * worldwide have ever actually solved it, which tracks how introductory/canonical a problem is
 * far better for a curated "must-know basics" set like this project's CPE collection.
 *
 * Thresholds are the 25th/50th/75th percentile DACU across this project's own ~344 problems
 * (CPE-scraped + the hand-picked "CPE 必考 49 題" collection), computed once and hardcoded here.
 */

const UHUNT_PROBLEM_LIST_URL = "https://uhunt.onlinejudge.org/api/p";

// [pid, num, title, dacu, bestRuntime, bestMemory, noVerdict, SE, cantBeJudged, inQueue, CE,
//  restrictedFn, RE, OLE, TLE, MLE, WA, PE, AC, runtimeLimit, status]
type UhuntProblemRow = [
  number, number, string, number, number, number, number, number, number, number, number,
  number, number, number, number, number, number, number, number, number, number,
];

const DACU_INDEX = 3;

const DIFFICULTY_THRESHOLDS = { thirdQuartile: 8328, median: 3614, firstQuartile: 1345 };

export function dacuToDifficulty(dacu: number): number {
  if (dacu >= DIFFICULTY_THRESHOLDS.thirdQuartile) return 1;
  if (dacu >= DIFFICULTY_THRESHOLDS.median) return 2;
  if (dacu >= DIFFICULTY_THRESHOLDS.firstQuartile) return 3;
  return 4;
}

/** Fetches uHunt's full problem list once and returns a uvaId -> DACU map. */
export async function fetchUhuntDacu(): Promise<Map<number, number>> {
  const res = await fetch(UHUNT_PROBLEM_LIST_URL);
  if (!res.ok) throw new Error(`uHunt problem list fetch failed: HTTP ${res.status}`);
  const rows = (await res.json()) as UhuntProblemRow[];

  const dacuByUvaId = new Map<number, number>();
  for (const row of rows) {
    dacuByUvaId.set(row[1], row[DACU_INDEX]);
  }
  return dacuByUvaId;
}
