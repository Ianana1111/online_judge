import { expect, it } from "vitest";
import { checkProblemOutput } from "../apps/judge/src/local/checkers";
import { checkCsvSort, checkLmis, checkSudoku } from "../apps/judge/src/local/gpeCheckers";
import { problemJudgeMode } from "../packages/shared/src/judge";

it("accepts either CSV tie ordering and preserves every original row and its spaces", () => {
  const input = "1\nz,1\n  a , 1  \na,1\na,1,tail\n";
  expect(checkCsvSort(input, "  a , 1  \na,1\na,1,tail\nz,1\n")).toBe(true);
  expect(checkCsvSort(input, "a,1\n  a , 1  \na,1,tail\nz,1\n")).toBe(true);
  expect(checkCsvSort(input, "a,1\na,1\na,1,tail\nz,1\n")).toBe(false);
  expect(checkCsvSort(input, "a , 1\na,1\na,1,tail\nz,1\n")).toBe(false);
  expect(checkCsvSort(input, "  a , 1  \na,1,tail\na,1\nz,1\n")).toBe(false);
});

it("checks CSV multiplicity, internal spaces, lexical numbers and dataset boundaries", () => {
  const input = "2\nx,2\nx,10\nx,10\n\nA B,1\nA  B,1\n";
  const answer = "x,10\nx,10\nx,2\n\nA  B,1\nA B,1\n";
  expect(checkCsvSort(input, answer.replaceAll("\n", "\r\n"))).toBe(true);
  expect(checkCsvSort(input, answer.replace("x,10\n", ""))).toBe(false);
  expect(checkCsvSort(input, answer.replace("x,10\nx,10\nx,2", "x,2\nx,10\nx,10"))).toBe(false);
  expect(checkCsvSort(input, answer.replace("A  B,1\nA B,1", "A B,1\nA  B,1"))).toBe(false);
  expect(checkCsvSort(input, answer.replace("\n\n", "\n"))).toBe(false);
  expect(checkCsvSort(input, answer + "forged\n")).toBe(false);
});

it("accepts complete LMIS listings in either order without accepting omissions or duplicates", () => {
  const reference = "3\n2 5 6\n2 3 6\n2 3 4\n1\n9\n";
  expect(checkLmis(reference, "3\n2 3 4\n2 5 6\n2 3 6\n1\n9\n")).toBe(true);
  expect(checkLmis(reference, "3\n2 3 4\n2 5 6\n2 5 6\n1\n9\n")).toBe(false);
  expect(checkLmis(reference, "2\n2 5 6\n2 3 6\n1\n9\n")).toBe(false);
  expect(checkLmis(reference, "3\n2 5 6\n2 3 6\n2 4 3\n1\n9\n")).toBe(false);
  expect(checkLmis(reference, reference + "extra\n")).toBe(false);
  expect(checkLmis(reference, "999999999999999999999999999\n")).toBe(false);
  expect(() => checkLmis("900\n1\n", "900\n1\n")).toThrow("Invalid LMIS judge answer");
  expect(() => checkLmis("1\n1 2 3 4 5 6 7 8 9 10\n", "")).toThrow("Invalid LMIS judge answer");
  expect(() => checkLmis("", "")).toThrow("Invalid LMIS judge answer");
});

it("dispatches only explicitly registered special GPE checkers", () => {
  const common = { checkerType: "SPECIAL" as const, uvaId: null, floatEps: null };
  expect(checkProblemOutput({ ...common, slug: "gpe-22261-sorting-the-alphanumeric-list-in-comma-separated-value-forma" }, "1\na\n", "", "a\n")).toBe(true);
  expect(checkProblemOutput({ ...common, slug: "gpe-2008-28-longest-monotonically-increasing-subsequence" }, "", "1\n42\n", "1\n42\n")).toBe(true);
  expect(() => checkProblemOutput({ ...common, slug: "unregistered" }, "", "", "")).toThrow();
  for (const slug of ["gpe-22261-sorting-the-alphanumeric-list-in-comma-separated-value-forma", "gpe-2008-28-longest-monotonically-increasing-subsequence", "gpe-2015-03-sudoku-as-good-as-lee-hsien-loong"]) {
    expect(problemJudgeMode({ ...common, slug, _count: { testCases: 1 } })).toBe("LOCAL");
    expect(problemJudgeMode({ ...common, slug, _count: { testCases: 0 } })).toBe("UNAVAILABLE");
    expect(problemJudgeMode({ ...common, slug: "copy-" + slug, _count: { testCases: 1 } })).toBe("UNAVAILABLE");
  }
});

it("validates alternative Sudoku completions, clues, boxes and justified NO answers", () => {
  const board = Array.from({ length: 81 }, (_, i) => (Math.floor(i / 9) * 3 + Math.floor(i / 27) + i % 9) % 9 + 1);
  const alternate = board.map((v) => v === 1 ? 2 : v === 2 ? 1 : v);
  const text = (values: number[]) => Array.from({ length: 9 }, (_, row) => values.slice(row * 9, row * 9 + 9).join(" ")).join("\n") + "\n";
  const clues = board.map((v) => v === 9 ? 9 : 0);
  const input = "1\n" + text(clues);
  expect(checkSudoku(input, text(board), text(alternate))).toBe(true);
  expect(checkSudoku(input, text(board), "NO\n")).toBe(false);
  expect(checkSudoku(input, text(board), text(board.map((v) => v === 9 ? 8 : v === 8 ? 9 : v)))).toBe(false);
  const latinWithoutBoxes = Array.from({ length: 81 }, (_, i) => (Math.floor(i / 9) + i % 9) % 9 + 1);
  expect(checkSudoku("1\n" + text(Array(81).fill(0)), text(board), text(latinWithoutBoxes))).toBe(false);
  expect(checkSudoku(input, text(board), text(board) + "1\n")).toBe(false);
  const invalid = board.slice(); invalid[0] = invalid[1];
  expect(checkSudoku("2\n" + text(clues) + text(invalid), text(board) + "NO\n", text(alternate) + "NO\n")).toBe(true);
  expect(checkSudoku("1\n" + text(invalid), "NO\n", text(invalid))).toBe(false);
});
