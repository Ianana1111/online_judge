import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { CheckerType } from "@oj/db";
import { checkProblemOutput } from "../local/checkers.js";

type ProblemData = { slug: string; uvaId: number | null; checkerType: CheckerType; floatEps: number | null;
  samples: { ord: number; input: string; output: string }[]; testCases: { ord: number; input: string; output: string }[] };
/** Structural consistency only. Matching expected answers against themselves is not an oracle
 * for algorithm correctness; source fidelity and independent reference execution are separate. */
export function auditSamples(problems: ProblemData[]) {
  return problems.map((p) => {
    const issues: { kind: string; sampleOrd?: number; testOrd?: number }[] = [];
    if (!p.samples.length) issues.push({ kind: "missing-sample" });
    if (new Set(p.samples.map((s) => s.ord)).size !== p.samples.length) issues.push({ kind: "duplicate-sample-ordinal" });
    if (p.samples.length > 8) issues.push({ kind: "sample-count-exceeds-run-limit" });
    for (const s of p.samples) {
      if (s.input.length > 4096) issues.push({ kind: "large-sample-requires-server-reference", sampleOrd: s.ord });
      try {
        if (!checkProblemOutput(p, s.input, s.output, s.output)) issues.push({ kind: "invalid-special-sample-answer", sampleOrd: s.ord });
        for (const tc of p.testCases) if (tc.input === s.input && !checkProblemOutput(p, s.input, tc.output, s.output)) issues.push({ kind: "sample-test-answer-conflict", sampleOrd: s.ord, testOrd: tc.ord });
      } catch { issues.push({ kind: "invalid-checker-configuration", sampleOrd: s.ord }); }
    }
    return { slug: p.slug, sampleCount: p.samples.length, testCaseCount: p.testCases.length, issues };
  });
}

// Usage: node --import tsx src/audit/sample-integrity.ts content-snapshot.json report.json
// Reads an explicit, previously exported snapshot; never connects to or mutates production.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error("Usage: sample-integrity.ts snapshot.json report.json");
  const snapshot = JSON.parse(readFileSync(input, "utf8"));
  const rows = auditSamples(snapshot.problems);
  writeFileSync(output, JSON.stringify({ contentHash: snapshot.contentHash, rows }, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({ problems: rows.length, flagged: rows.filter((r) => r.issues.length).length }));
}
