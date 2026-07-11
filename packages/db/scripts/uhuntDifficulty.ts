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

/**
 * DACU alone tracks "how many people worldwide have solved this" — it's a good signal for how
 * introductory/canonical a problem is, but it doesn't know anything about the *technique* the
 * problem requires. A DP or graph problem can be old/famous enough to have a huge DACU (so it'd
 * score ★ on DACU alone) while still genuinely requiring an algorithm a beginner has no chance of
 * discovering unaided. So a topic tag (see apps/web/app/admin/analytics/page.tsx's TOPIC_ORDER,
 * the same easiest -> hardest taxonomy used for the analytics stacked bars) sets a *floor* — DACU
 * can still push a problem's difficulty above the floor, just never below it.
 */
const TOPIC_FLOOR: Record<string, number> = {
  adhoc: 1,
  array: 1,
  math: 1,
  string: 1,
  simulation: 2,
  geometry: 2,
  "sorting-searching": 2,
  greedy: 3,
  "recursion-backtracking": 3,
  datastructure: 3,
  graph: 4,
  dp: 4,
};

export function combinedDifficulty(dacu: number, topicSlugs: string[]): number {
  const floor = Math.max(1, ...topicSlugs.map((slug) => TOPIC_FLOOR[slug] ?? 1));
  return Math.max(dacuToDifficulty(dacu), floor);
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

/** Normalizes a problem title for fuzzy cross-catalog matching: lowercase, strip everything but
 * letters/digits/spaces, collapse whitespace. Used to match a problem referenced by some other
 * catalog's own numbering (e.g. GPE's now-defunct DOMjudge instance) back to its real UVa id when
 * the two happen to share the same title but not the same number. */
export function normalizeTitleForMatch(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fetches uHunt's full problem list and returns a normalized-title -> uvaId index, for matching
 * problems from other catalogs by title (see normalizeTitleForMatch). Titles aren't guaranteed
 * unique across UVa's whole catalog; last-write-wins on collision, which is an acceptable amount
 * of imprecision for a best-effort match onto a since-defunct source. */
export async function fetchUhuntTitleIndex(): Promise<Map<string, number>> {
  const res = await fetch(UHUNT_PROBLEM_LIST_URL);
  if (!res.ok) throw new Error(`uHunt problem list fetch failed: HTTP ${res.status}`);
  const rows = (await res.json()) as UhuntProblemRow[];

  const index = new Map<string, number>();
  for (const row of rows) {
    const normalized = normalizeTitleForMatch(row[2]);
    if (normalized) index.set(normalized, row[1]);
  }
  return index;
}
