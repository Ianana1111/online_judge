import { expect, it } from "vitest";
import fc from "fast-check";
import { checkDoublets } from "../apps/judge/src/local/doubletsChecker";
import { checkProblemOutput } from "../apps/judge/src/local/checkers";
import { problemJudgeMode } from "../packages/shared/src/judge";
const input = "cat\ncot\ncog\ndog\ndot\nzzz\n\ncat dog\ncat cat\ncat zzz\n";
it("accepts both shortest paths and handles zero-step and unreachable queries", () => {
  expect(checkDoublets(input, "cat\ncot\ncog\ndog\n\ncat\n\nNo solution.\n")).toBe(true);
  expect(checkDoublets(input, "cat\ncot\ndot\ndog\n\ncat\n\nNo solution.\n")).toBe(true);
  expect(checkProblemOutput({ checkerType: "SPECIAL", uvaId: 10150, floatEps: null }, input, "not a canonical path", "cat\ncot\ndot\ndog\n\ncat\n\nNo solution.\n")).toBe(true);
});
it("rejects nonminimal paths, invented words, invalid edges, missing queries and false impossibility", () => {
  for (const first of ["cat\ndog", "cat\ncot\ncog\ndot\ndog", "cat\nbat\nbot\ndog", "No solution.", "dog\ncog\ncot\ncat"]) expect(checkDoublets(input, first + "\n\ncat\n\nNo solution.\n")).toBe(false);
  expect(checkDoublets(input, "cat\ncot\ncog\ndog")).toBe(false);
  expect(checkDoublets(input, "cat\ncot\ncog\ndog\ncat\nNo solution.\n")).toBe(false);
  expect(problemJudgeMode({ checkerType: "SPECIAL", uvaId: 99999, _count: { testCases: 1 } })).toBe("UNAVAILABLE");
});
it("agrees with an independent all-pairs graph BFS on generated dictionaries", () => {
  const vocabulary = [..."abc"].flatMap((a) => [..."abc"].flatMap((b) => [..."abc"].map((c) => a + b + c)));
  fc.assert(fc.property(fc.uniqueArray(fc.constantFrom(...vocabulary), { minLength: 1, maxLength: 27 }), (words) => {
    const start = words[0], end = words[words.length - 1], queue: string[][] = [[start]], seen = new Set([start]); let solution: string[] | undefined;
    for (let head = 0; head < queue.length; head++) {
      const chain = queue[head], last = chain[chain.length - 1]; if (last === end) { solution = chain; break; }
      for (const word of words) if (!seen.has(word) && [...last].filter((c, index) => c !== word[index]).length === 1) { seen.add(word); queue.push([...chain, word]); }
    }
    const data = words.join("\n") + `\n\n${start} ${end}\n`;
    expect(checkDoublets(data, solution ? solution.join("\n") : "No solution.")).toBe(true);
    if (solution && solution.length > 1) expect(checkDoublets(data, [solution[0], ...solution].join("\n"))).toBe(false);
  }), { numRuns: 100 });
});
