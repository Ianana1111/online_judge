import { expect, it } from "vitest";
import { checkProblemOutput } from "../apps/judge/src/local/checkers";
import { supportsLocalChecker } from "../packages/shared/src/judge";
const problem = { uvaId: 10056, checkerType: "SPECIAL" as const, floatEps: null };
it("handles zero, certainty, tiny positive probabilities and a single player", () => {
  expect(supportsLocalChecker(problem)).toBe(true);
  const input = "6\n2 0 1\n2 1 1\n2 1 2\n2 1e-10000 1\n1 0.0000000000000001 1\n1000 1e-20 1000\n";
  expect(checkProblemOutput(problem, input, "", "0.0000\n1.0000\n0.0000\n0.5000\n1.0000\n0.0010\n")).toBe(true);
});
it("accepts either rounding at a midpoint but rejects a whole-place error", () => {
  const input = "1\n2 0.4 2\n"; // 0.4*0.6/(1-0.6²) = 0.375 exactly
  expect(checkProblemOutput(problem, input, "", "0.3750\n")).toBe(true);
  for (const output of ["0.3749", "0.3751", "0.375", "NaN", "0.3750\n0.3750", "1.3750"])
    expect(checkProblemOutput(problem, input, "", output)).toBe(false);
  // For N=1/p>0 the probability is one, regardless of cancellation in p/(1-q).
  expect(checkProblemOutput(problem, "1\n1 1e-100 1\n", "", "0.9999")).toBe(false);
  // In the positive-p -> 0 limit N=32 gives 0.03125, exactly half a last place.
  for (const output of ["0.0312", "0.0313"])
    expect(checkProblemOutput(problem, "1\n32 1e-100 1\n", "", output)).toBe(true);
});
it("rejects malformed input without an unbounded loop", () => {
  for (const input of ["1\n1000000000 .5 1", "1\n2 NaN 1", "1\n2 .5 3", "1\n2 .5 1\nextra"])
    expect(checkProblemOutput(problem, input, "", "0.6667")).toBe(false);
});
it("agrees with exact rational geometric sums across player counts and probabilities", () => {
  for (let n = 1; n <= 60; n += 3) for (let a = 1; a < 20; a++) for (const i of new Set([1, Math.ceil(n / 2), n])) {
    const b = 20n, q = b - BigInt(a);
    const numerator = BigInt(a) * q ** BigInt(i - 1) * b ** BigInt(n - i);
    const denominator = b ** BigInt(n) - q ** BigInt(n);
    const scaled = (numerator * 20000n + denominator) / (2n * denominator);
    const format = (value: bigint) => `${value / 10000n}.${String(value % 10000n).padStart(4, "0")}`;
    const input = `1\n${n} ${a / 20} ${i}\n`;
    expect(checkProblemOutput(problem, input, "", format(scaled))).toBe(true);
    if (scaled + 2n <= 10000n) expect(checkProblemOutput(problem, input, "", format(scaled + 2n))).toBe(false);
    if (scaled >= 2n) expect(checkProblemOutput(problem, input, "", format(scaled - 2n))).toBe(false);
  }
});
