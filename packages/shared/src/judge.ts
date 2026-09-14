/** Explicitly supported trusted checkers. Unknown SPECIAL problems must stay unavailable. */
type CheckerIdentity = { checkerType: string; uvaId?: number | null; slug?: string; floatEps?: number | null };

/** Shared by API admission and worker dispatch so a registered checker cannot be forgotten
 * by one side. Exact problem identities only; a similarly named problem is not registered. */
export function specialCheckerId(problem: CheckerIdentity): "doublets" | "gpe-csv" | "gpe-lmis" | "gpe-sudoku" | null {
  if (problem.checkerType !== "SPECIAL") return null;
  if (problem.uvaId === 10150) return "doublets";
  switch (problem.slug) {
    case "gpe-22261-sorting-the-alphanumeric-list-in-comma-separated-value-forma": return "gpe-csv";
    case "gpe-2008-28-longest-monotonically-increasing-subsequence": return "gpe-lmis";
    case "gpe-2015-03-sudoku-as-good-as-lee-hsien-loong": return "gpe-sudoku";
    default: return null;
  }
}

export function supportsLocalChecker(problem: CheckerIdentity): boolean {
  if (problem.checkerType === "SPECIAL") return specialCheckerId(problem) !== null;
  if (problem.checkerType === "FLOAT") return problem.floatEps == null || (Number.isFinite(problem.floatEps) && problem.floatEps >= 0);
  return problem.checkerType === "EXACT" || problem.checkerType === "IGNORE_TRAILING_WS";
}
export function problemJudgeMode(problem: CheckerIdentity & { uvaPid?: number | null; _count: { testCases: number } }): "LOCAL" | "REMOTE" | "UNAVAILABLE" {
  if (problem._count.testCases) return supportsLocalChecker(problem) ? "LOCAL" : "UNAVAILABLE";
  return problem.uvaId && problem.uvaPid ? "REMOTE" : "UNAVAILABLE";
}
