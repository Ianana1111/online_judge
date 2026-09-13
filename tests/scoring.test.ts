import { describe, expect, it } from "vitest";
import { scoreAttempt } from "../packages/shared/src/scoring";
const start = new Date("2026-09-12T00:00:00Z");
const row = (verdict: string, seconds: number, problemId = "a") => ({ verdict, createdAt: new Date(+start + seconds * 1000), problemId });
describe("ICPC scoring", () => {
  it("counts only mistakes before first AC and floors elapsed minutes", () => {
    const score = scoreAttempt(start, 20, ["a"], [row("WA", 30), row("AC", 119), row("WA", 120), row("AC", 180)]);
    expect(score).toMatchObject({ solvedCount: 1, penalty: 21 });
  });
  it("does not penalize compilation or infrastructure failures", () => {
    expect(scoreAttempt(start, 20, ["a"], [row("CE", 1), row("SE", 2), row("AC", 60)]).penalty).toBe(1);
  });
  it("does not add penalties for unsolved or unrelated problems", () => {
    expect(scoreAttempt(start, 20, ["a"], [row("WA", 1), row("AC", 60, "b")])).toMatchObject({ solvedCount: 0, penalty: 0 });
  });
  it("is independent of database row order", () => {
    const rows = [row("WA", 1), row("TLE", 2), row("AC", 180)];
    expect(scoreAttempt(start, 20, ["a"], rows.reverse())).toMatchObject({ solvedCount: 1, penalty: 43 });
  });
  it("preserves historical score versions", () => {
    expect(scoreAttempt(start, 20, ["a"], [row("CE", 1), row("SE", 2), row("AC", 119)], "legacy-v1").penalty).toBe(42);
  });
});
