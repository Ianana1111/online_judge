import { checkFormattingText } from "./formattingTextChecker.js";
import { checkSnowClearing, checkSuperman, checkCircleBox } from "./geometricWitnessCheckers.js";
import { checkFixedDecimalOutput } from "./fixedDecimalOutput.js";
import { checkKnowledgeGame, checkOreon } from "./setTreeCheckers.js";
import { checkExcuses, checkAnagrams, checkAustralianVoting, checkEquationSteps } from "./textWitnessCheckers.js";
import type { CheckerType } from "@oj/db";
import { specialCheckerId } from "@oj/shared";
import { checkMinimalCoverage, checkElephantChain, checkGrandDinner, checkMatrixDecompression } from "./constructionCheckers.js";
import { checkDoublets } from "./doubletsChecker.js";
import { checkCsvSort, checkLmis, checkSudoku } from "./gpeCheckers.js";
import { checkPrimeTime, checkRockPaperScissors, checkTightWords, checkIntersectingLines, checkFlooded, checkCenterOfMass, checkHayPoints, checkHuffman } from "./rationalCheckers.js";
import { checkHardwood, checkWinningProbability } from "./percentageChecker.js";

export function checkProblemOutput(problem: { checkerType: CheckerType; uvaId?: number | null; slug?: string; floatEps: number | null }, input: string, expected: string, actual: string): boolean {
  switch (specialCheckerId(problem)) {
    case "uva-709": return checkFormattingText(input, expected, actual);
    case "gpe-snow": return checkSnowClearing(input, expected, actual);
    case "gpe-box": return checkCircleBox(input, actual);
    case "uva-superman": return checkSuperman(input, expected, actual);
    case "geometry-fixed": return checkFixedDecimalOutput(expected, actual);
    case "uva-1657": return checkKnowledgeGame(input, expected, actual);
    case "uva-1208": return checkOreon(input, actual);
    case "uva-409": return checkExcuses(input, actual);
    case "uva-630": return checkAnagrams(input, actual);
    case "uva-397": return checkEquationSteps(expected, actual);
    case "uva-10142": return checkAustralianVoting(input, actual);
    case "gpe-cover": return checkMinimalCoverage(input, actual);
    case "gpe-elephant": return checkElephantChain(input, actual);
    case "gpe-dinner": return checkGrandDinner(input, actual);
    case "gpe-matrix": return checkMatrixDecompression(input, actual);
    case "uva-10200": return checkPrimeTime(input, actual);
    case "uva-10903": return checkRockPaperScissors(input, actual);
    case "gpe-tight": return checkTightWords(input, actual);
    case "uva-378": return checkIntersectingLines(input, actual);
    case "uva-815": return checkFlooded(input, actual);
    case "gpe-center": return checkCenterOfMass(input, actual);
    case "gpe-hay": return checkHayPoints(expected, actual);
    case "uva-240": return checkHuffman(input, expected, actual);
    case "doublets": return checkDoublets(input, actual);
    case "uva-100": return checkIntegerTriples(expected, actual);
    case "uva-10226": return checkHardwood(input, actual);
    case "uva-10056": return checkWinningProbability(input, actual);
    case "gpe-csv": return checkCsvSort(input, actual);
    case "gpe-lmis": return checkLmis(expected, actual);
    case "gpe-sudoku": return checkSudoku(input, expected, actual);
  }
  return checkOutput(problem.checkerType, expected, actual, problem.floatEps);
}

/** UVa 100 explicitly allows more than one separating space. Preserve one triple per
 * line and exact integer values; do not relax fixed-layout problems or blank separators.
 * String canonicalization avoids parsing attacker-sized output tokens as BigInts. */
function checkIntegerTriples(expected: string, actual: string): boolean {
  const lines=(text:string)=>text.replace(/\r\n/g,"\n").replace(/^\n+|\n+$/g,"").split("\n");
  const left=lines(expected),right=lines(actual);
  if(left.length!==right.length)return false;
  const integer=(token:string)=>/^\+?\d+$/.test(token)?token.replace(/^\+?0*/,"")||"0":null;
  return left.every((line,index)=>{
    const a=line.trim().split(/[ \t]+/),b=right[index].trim().split(/[ \t]+/);
    return a.length===3&&b.length===3&&a.every((value,i)=>integer(value)!==null&&integer(value)===integer(b[i]));
  });
}

/** Trims trailing whitespace per line and collapses leading/trailing blank lines — the de facto
 * standard "don't fail on whitespace" comparison most judges use by default (matches this
 * project's own Problem.checkerType default). Leading-blank-line stripping matters in practice:
 * several scraped Sample rows have a stray leading "\r\n" artifact before the real content (seen
 * on uva-10035), which a trailing-only trim would leave as a spurious blank first line and fail
 * every comparison against that sample. */
function normalizeIgnoreTrailingWs(s: string): string {
  const trimmed = s
    .split("\n")
    .map((line) => line.replace(/[ \t\r]+$/, ""))
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
  // A trailing-newline *replace* only fires when there's at least one "\n" to match — output that
  // ends in a non-whitespace character (no trailing newline at all) would otherwise stay without
  // one here, while a real submission's stdout almost always has one (println), causing a false
  // mismatch. Trim unconditionally, then add exactly one "\n" back unless the whole thing is empty.
  return trimmed === "" ? "" : trimmed + "\n";
}

function tokenize(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

/** Compares token-by-token so numeric tokens are allowed floatEps slack while any non-numeric
 * token (labels, words) still needs to match exactly — a pure numeric-only compare would silently
 * accept a token-count mismatch or wrong non-numeric output as long as the numbers happened to
 * parse from leftover text. */
function compareFloat(expected: string, actual: string, floatEps: number): boolean {
  if (!Number.isFinite(floatEps) || floatEps < 0) throw new Error("Invalid FLOAT checker tolerance");
  const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
  const e = tokenize(expected);
  const a = tokenize(actual);
  if (e.length !== a.length) return false;
  for (let i = 0; i < e.length; i++) {
    const en = Number(e[i]);
    const an = Number(a[i]);
    if (decimal.test(e[i]) && Number.isFinite(en)) {
      if (!decimal.test(a[i]) || !Number.isFinite(an)) return false;
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
      throw new Error("SPECIAL checker requires an explicitly registered problem checker");
  }
}
