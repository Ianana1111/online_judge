/** Explicitly supported trusted checkers. Unknown SPECIAL problems must stay unavailable. */
export function supportsLocalChecker(problem: { checkerType: string; uvaId?: number | null; floatEps?: number | null }): boolean {
  if (problem.checkerType === "SPECIAL") return problem.uvaId === 10150;
  if (problem.checkerType === "FLOAT") return problem.floatEps == null || (Number.isFinite(problem.floatEps) && problem.floatEps >= 0);
  return problem.checkerType === "EXACT" || problem.checkerType === "IGNORE_TRAILING_WS";
}
export function problemJudgeMode(problem: { checkerType: string; uvaId?: number | null; uvaPid?: number | null; floatEps?: number | null; _count: { testCases: number } }): "LOCAL" | "REMOTE" | "UNAVAILABLE" {
  if (problem._count.testCases) return supportsLocalChecker(problem) ? "LOCAL" : "UNAVAILABLE";
  return problem.uvaId && problem.uvaPid ? "REMOTE" : "UNAVAILABLE";
}
