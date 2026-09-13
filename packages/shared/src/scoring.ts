const PENALIZED = new Set(["WA", "TLE", "MLE", "RE", "RF", "PE", "OLE"]);
export const SCORING_VERSION = "icpc-v2";
export interface ScoreSubmission { id?: string; problemId: string; verdict: string; createdAt: Date }

/** Stable ICPC score used by history, results and scoreboard. Legacy attempts retain old math. */
export function scoreAttempt(startedAt: Date, penaltyMin: number, problemIds: string[], submissions: ScoreSubmission[], version = SCORING_VERSION) {
  const legacy = version === "legacy-v1";
  const sorted = [...submissions].filter((s) => s.createdAt >= startedAt)
    .sort((a, b) => +a.createdAt - +b.createdAt || (a.id ?? "").localeCompare(b.id ?? ""));
  const cells: Record<string, { solved: boolean; attempts: number; solveMin: number | null }> = {};
  let solvedCount = 0; let penalty = 0;
  for (const id of problemIds) {
    const rows = sorted.filter((s) => s.problemId === id && !["PENDING", "JUDGING"].includes(s.verdict));
    const ac = rows.findIndex((s) => s.verdict === "AC");
    const wrong = (ac >= 0 ? rows.slice(0, ac) : rows).filter((s) => legacy ? s.verdict !== "AC" && (ac < 0 || s.createdAt < rows[ac].createdAt) : PENALIZED.has(s.verdict)).length;
    const solveMin = ac < 0 ? null : Math.max(0, (legacy ? Math.round : Math.floor)((+rows[ac].createdAt - +startedAt) / 60_000));
    cells[id] = { solved: ac >= 0, attempts: wrong + (ac >= 0 ? 1 : 0), solveMin };
    if (solveMin !== null) { solvedCount++; penalty += solveMin + wrong * penaltyMin; }
  }
  return { solvedCount, penalty, cells };
}
