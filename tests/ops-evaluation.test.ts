import { describe, expect, it } from "vitest";
import { EVAL_FIXTURES, ruleEvaluation } from "../apps/ops-runner/src/evaluation-fixtures";
import { scoreEvaluation, validateEvaluationBatch } from "../apps/ops-runner/src/evaluation";
describe("operational evaluation corpus", () => {
  it("covers distinct labelled cases, including boundaries and adversarial input", () => {
    expect(EVAL_FIXTURES).toHaveLength(24); expect(new Set(EVAL_FIXTURES.map(f => f.id)).size).toBe(24);
    expect(new Set(EVAL_FIXTURES.map(f => f.category)).size).toBeGreaterThanOrEqual(6);
    for (const fixture of EVAL_FIXTURES) expect(scoreEvaluation(ruleEvaluation(fixture), fixture)).toMatchObject({ correct: true, citationValid: true, falsePositive: false, falseNegative: false });
  });
  it("records incorrect routing and fabricated citations instead of passing them", () => {
    expect(scoreEvaluation({ incident: true, owner: "SRE", evidenceIds: ["fake"], limitation: "fixture" }, EVAL_FIXTURES[0])).toMatchObject({ correct: false, citationValid: false, falsePositive: true });
    const incident = EVAL_FIXTURES.find(f => f.expected.incident)!;
    expect(scoreEvaluation({ incident: false, owner: "NONE", evidenceIds: ["http"], limitation: "fixture" }, incident).falseNegative).toBe(true);
  });
  it("rejects missing, duplicated or invented case identifiers", () => {
    const f = EVAL_FIXTURES.slice(0, 2), answers = f.map(v => ({ ...ruleEvaluation(v), fixtureId: v.id }));
    expect(validateEvaluationBatch({ answers }, f).answers).toHaveLength(2);
    expect(() => validateEvaluationBatch({ answers: [answers[0], answers[0]] }, f)).toThrow();
    expect(() => validateEvaluationBatch({ answers: answers.slice(1) }, f)).toThrow();
  });
});
