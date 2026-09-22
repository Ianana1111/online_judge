import { expect, it } from "vitest";
import { checkProblemOutput } from "../apps/judge/src/local/checkers";
import { supportsLocalChecker } from "../packages/shared/src/judge";

const problem = { uvaId: 10226, checkerType: "SPECIAL" as const, floatEps: null };
it("accepts both nearest roundings of an exact halfway percentage", () => {
  const input = "1\n\nAsh\n" + "Oak\n".repeat(399999);
  expect(supportsLocalChecker(problem)).toBe(true);
  for (const ash of ["0.0002", "0.0003"]) for (const oak of ["99.9997", "99.9998"])
    expect(checkProblemOutput(problem, input, "irrelevant pre-rounded output", `Ash ${ash}\nOak ${oak}\n`)).toBe(true);
  for (const ash of ["0.0001", "0.0004", "0.0000", "NaN", "Infinity", "0.00025", "-0.0002", "0".repeat(10000) + ".0002"])
    expect(checkProblemOutput(problem, input, "", `Ash ${ash}\nOak 99.9998\n`)).toBe(false);
});
it("validates names, order, counts, precision and the blank line between cases", () => {
  const input = "2\r\n\r\nRed Oak\r\nAsh\r\nRed Oak\r\n\r\nZebra Wood\r\n";
  const good = "Ash 33.3333\nRed Oak 66.6667\n\nZebra Wood 100.0000\n";
  expect(checkProblemOutput(problem, input, "", good)).toBe(true);
  expect(checkProblemOutput(problem, input, "", good.replace(/\n/g, "\r\n"))).toBe(true);
  for (const bad of [good.replace("Ash", "ash"), good.replace("33.3333", "33.3334"), good.replace("66.6667", "66.6666"), good.replace("100.0000", "100.0001"), good.replace("\n\n", "\n"), good + "Extra 0.0000\n", good.replace("Ash 33.3333\n", ""), good.replace("Ash 33.3333\nRed Oak 66.6667", "Red Oak 66.6667\nAsh 33.3333"), good.replace("33.3333", "33.33330")])
    expect(checkProblemOutput(problem, input, "", bad)).toBe(false);
});
it("does not relax unrelated fixed-format problems", () => {
  expect(checkProblemOutput({ ...problem, uvaId: 10221, checkerType: "IGNORE_TRAILING_WS" }, "", "0.0002\n", "0.0003\n")).toBe(false);
});
