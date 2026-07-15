import type { CheckerType } from "@oj/db";

/** Trims trailing whitespace per line and collapses leading/trailing blank lines — the de facto
 * standard "don't fail on whitespace" comparison most judges use by default (matches this
 * project's own Problem.checkerType default). Leading-blank-line stripping matters in practice:
 * several scraped Sample rows have a stray leading "\r\n" artifact before the real content (seen
 * on uva-10035), which a trailing-only trim would leave as a spurious blank first line and fail
 * every comparison against that sample. */
function normalizeIgnoreTrailingWs(s: string): string {
  return s
    .split("\n")
    .map((line) => line.replace(/[ \t\r]+$/, ""))
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "\n");
}

function tokenize(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

/** Compares token-by-token so numeric tokens are allowed floatEps slack while any non-numeric
 * token (labels, words) still needs to match exactly — a pure numeric-only compare would silently
 * accept a token-count mismatch or wrong non-numeric output as long as the numbers happened to
 * parse from leftover text. */
function compareFloat(expected: string, actual: string, floatEps: number): boolean {
  const e = tokenize(expected);
  const a = tokenize(actual);
  if (e.length !== a.length) return false;
  for (let i = 0; i < e.length; i++) {
    const en = Number(e[i]);
    const an = Number(a[i]);
    if (Number.isFinite(en) && Number.isFinite(an)) {
      if (Math.abs(en - an) > floatEps) return false;
    } else if (e[i] !== a[i]) {
      return false;
    }
  }
  return true;
}

export function checkOutput(checkerType: CheckerType, expected: string, actual: string, floatEps: number | null): boolean {
  switch (checkerType) {
    case "EXACT":
      return expected === actual;
    case "IGNORE_TRAILING_WS":
      return normalizeIgnoreTrailingWs(expected) === normalizeIgnoreTrailingWs(actual);
    case "FLOAT":
      return compareFloat(expected, actual, floatEps ?? 1e-6);
    case "SPECIAL":
      // Not supported yet — a special checker is itself untrusted code that would need its own
      // sandboxed run. No pilot problem needs one; surfaced as a hard error rather than silently
      // falling back to exact-match, which could accept wrong output on a genuinely special-judge
      // problem (multiple valid answers).
      throw new Error("SPECIAL checkerType has no local judge implementation yet");
  }
}
