/**
 * Derives a 1-4 star difficulty rating from uHunt's real, community-wide accept-rate data for a
 * UVa problem (https://uhunt.onlinejudge.org/api/p — documented field order below) rather than
 * guessing. There's no official CPE difficulty scale published anywhere (the exam listing pages
 * only show problem order P1..P7, no star rating), so this is the most objective signal available.
 *
 * Thresholds are the 25th/50th/75th percentile accept rates across this project's own 335 CPE
 * problems (computed once, hardcoded here rather than recomputed live) - deliberately calibrated
 * to this problem set rather than the full ~5000-problem UVa archive, so the four buckets actually
 * come out balanced for what students here will see (roughly 84/84/84/83 problems per bucket).
 */

const UHUNT_PROBLEM_LIST_URL = "https://uhunt.onlinejudge.org/api/p";

// [pid, num, title, dacu, bestRuntime, bestMemory, noVerdict, SE, cantBeJudged, inQueue, CE,
//  restrictedFn, RE, OLE, TLE, MLE, WA, PE, AC, runtimeLimit, status]
type UhuntProblemRow = [
  number, number, string, number, number, number, number, number, number, number, number,
  number, number, number, number, number, number, number, number, number, number,
];

const JUDGED_VERDICT_INDICES = [7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18]; // SE..AC, excludes noVerdict/inQueue
const AC_INDEX = 18;

const DIFFICULTY_THRESHOLDS = { thirdQuartile: 0.53, median: 0.431, firstQuartile: 0.332 };

export function acRateToDifficulty(acRate: number): number {
  if (acRate >= DIFFICULTY_THRESHOLDS.thirdQuartile) return 1;
  if (acRate >= DIFFICULTY_THRESHOLDS.median) return 2;
  if (acRate >= DIFFICULTY_THRESHOLDS.firstQuartile) return 3;
  return 4;
}

/** Fetches uHunt's full problem list once and returns a uvaId -> accept-rate map. */
export async function fetchUhuntAcRates(): Promise<Map<number, number>> {
  const res = await fetch(UHUNT_PROBLEM_LIST_URL);
  if (!res.ok) throw new Error(`uHunt problem list fetch failed: HTTP ${res.status}`);
  const rows = (await res.json()) as UhuntProblemRow[];

  const rates = new Map<number, number>();
  for (const row of rows) {
    const uvaId = row[1];
    const total = JUDGED_VERDICT_INDICES.reduce((sum, i) => sum + row[i], 0);
    if (total > 0) rates.set(uvaId, row[AC_INDEX] / total);
  }
  return rates;
}
