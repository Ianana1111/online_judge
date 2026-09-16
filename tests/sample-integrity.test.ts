import { expect, it } from "vitest";
import { auditSamples } from "../apps/judge/src/audit/sample-integrity";
const base = { slug: "fixture", uvaId: 100, checkerType: "IGNORE_TRAILING_WS" as const, floatEps: null, samples: [{ ord: 1, input: "a \n", output: "1\n" }], testCases: [{ ord: 1, input: "a \n", output: "2\n" }] };
it("finds sample/test contradictions while preserving meaningful input whitespace", () => {
  expect(auditSamples([base])[0].issues).toEqual([{ kind: "sample-test-answer-conflict", sampleOrd: 1, testOrd: 1 }]);
  expect(auditSamples([{ ...base, testCases: [{ ...base.testCases[0], input: "a\n" }] }])[0].issues).toEqual([]);
});
it("flags missing, duplicate and oversized samples", () => {
  expect(auditSamples([{ ...base, samples: [] }])[0].issues).toContainEqual({ kind: "missing-sample" });
  expect(auditSamples([{ ...base, samples: [{ ...base.samples[0], input: "a".repeat(5000) }, base.samples[0]] }])[0].issues).toContainEqual({ kind: "duplicate-sample-ordinal" });
  expect(auditSamples([{ ...base, samples: [{ ...base.samples[0], input: "a".repeat(5000) }] }])[0].issues).toContainEqual({ kind: "large-sample-requires-server-reference", sampleOrd: 1 });
});
