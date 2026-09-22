/** Explicitly supported trusted checkers. Unknown SPECIAL problems must stay unavailable. */
type CheckerIdentity = { checkerType: string; uvaId?: number | null; slug?: string; floatEps?: number | null };

/** Shared by API admission and worker dispatch so a registered checker cannot be forgotten
 * by one side. Exact problem identities only; a similarly named problem is not registered. */
export function specialCheckerId(problem: CheckerIdentity): "uva-709" | "gpe-snow" | "gpe-box" | "uva-superman" | "geometry-fixed" | "uva-1657" | "uva-1208" | "uva-409" | "uva-630" | "uva-397" | "uva-10142" | "gpe-cover" | "gpe-elephant" | "gpe-dinner" | "gpe-matrix" | "uva-10200" | "uva-10903" | "uva-378" | "uva-815" | "uva-240" | "gpe-tight" | "gpe-center" | "gpe-hay" | "doublets" | "uva-100" | "uva-10056" | "uva-10226" | "gpe-csv" | "gpe-lmis" | "gpe-sudoku" | null {
  if (problem.checkerType !== "SPECIAL") return null;
  if (problem.uvaId === 709) return "uva-709";
  if (problem.uvaId === 10355) return "uva-superman";
  if ([10369, 10397, 534, 10221].includes(problem.uvaId ?? -1)) return "geometry-fixed";
  if (problem.uvaId === 1657) return "uva-1657";
  if (problem.uvaId === 1208) return "uva-1208";
  if (problem.uvaId === 409) return "uva-409";
  if (problem.uvaId === 630) return "uva-630";
  if (problem.uvaId === 397) return "uva-397";
  if (problem.uvaId === 10142) return "uva-10142";
  if (problem.uvaId === 10200) return "uva-10200";
  if (problem.uvaId === 10903) return "uva-10903";
  if (problem.uvaId === 378) return "uva-378";
  if (problem.uvaId === 815) return "uva-815";
  if (problem.uvaId === 240) return "uva-240";
  if (problem.uvaId === 10150) return "doublets";
  if (problem.uvaId === 100) return "uva-100";
  if (problem.uvaId === 10226) return "uva-10226";
  if (problem.uvaId === 10056) return "uva-10056";
  switch (problem.slug) {
    case "gpe-10732-snow-clearing": return "gpe-snow";
    case "gpe-10606-how-big-is-it": return "gpe-box";
    case "gpe-10422-is-this-integration": return "geometry-fixed";
    case "gpe-10675-urn-ball-probabilities": return "geometry-fixed";
    case "gpe-10608-minimal-coverage": return "gpe-cover";
    case "gpe-10658-is-bigger-smarter": return "gpe-elephant";
    case "gpe-10741-the-grand-dinner": return "gpe-dinner";
    case "gpe-10906-matrix-decompressing": return "gpe-matrix";
    case "gpe-10637-tight-words": return "gpe-tight";
    case "gpe-10505-center-of-masses": return "gpe-center";
    case "gpe-10579-hay-points": return "gpe-hay";
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
