import type { CheckerType } from "@oj/db";

export type CompareOutcome = "AC" | "WA" | "PE";

function stripTrailing(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t\r]+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter((t) => t.length > 0);
}

function exactCompare(expected: string, actual: string): CompareOutcome {
  return expected === actual ? "AC" : "WA";
}

/** Default comparator: ignore trailing whitespace/blank lines; token-only match downgrades to PE. */
function ignoreTrailingWsCompare(expected: string, actual: string): CompareOutcome {
  if (stripTrailing(expected) === stripTrailing(actual)) return "AC";
  const expTokens = tokenize(expected);
  const actTokens = tokenize(actual);
  if (expTokens.length === actTokens.length && expTokens.every((t, i) => t === actTokens[i])) {
    return "PE";
  }
  return "WA";
}

function floatCompare(expected: string, actual: string, eps: number): CompareOutcome {
  const expTokens = tokenize(expected);
  const actTokens = tokenize(actual);
  if (expTokens.length !== actTokens.length) return "WA";
  for (let i = 0; i < expTokens.length; i++) {
    const e = expTokens[i];
    const a = actTokens[i];
    const ef = Number(e);
    const af = Number(a);
    if (Number.isFinite(ef) && Number.isFinite(af)) {
      const diff = Math.abs(ef - af);
      const tol = Math.max(eps, eps * Math.abs(ef));
      if (diff > tol) return "WA";
    } else if (e !== a) {
      return "WA";
    }
  }
  return "AC";
}

/**
 * SPECIAL checkers (custom per-problem checker binaries) are a future extension point — no
 * infrastructure exists yet in the schema/admin UI to author/store one, so for now SPECIAL is
 * aliased to IGNORE_TRAILING_WS. Revisit when problem authoring gains checker-binary uploads.
 */
export function compareOutput(
  checkerType: CheckerType,
  expected: string,
  actual: string,
  floatEps: number | null,
): CompareOutcome {
  switch (checkerType) {
    case "EXACT":
      return exactCompare(expected, actual);
    case "FLOAT":
      return floatCompare(expected, actual, floatEps ?? 1e-6);
    case "SPECIAL":
    case "IGNORE_TRAILING_WS":
    default:
      return ignoreTrailingWsCompare(expected, actual);
  }
}
