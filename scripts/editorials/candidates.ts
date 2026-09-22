import { createHash } from "node:crypto";
import type { Candidate } from "../../apps/judge/src/audit/battery-types";

export type LegacyRetirement = { index: number; sourceHash: string; reason: string; classification: "UNSUITABLE_MUTANT" };
export type CandidateReview = { index: number; sourceHash: string; expected: "AC" | "REJECT" | "OBSERVE"; reason: string };
const hash = (text: string) => createHash("sha256").update(text).digest("hex");

/** An observed portability risk is not a demonstrated wrong-output mutant. A
 * per-editorial review may explicitly retire that exact legacy candidate. Never
 * retire a reference or a known rejection, and retain the source-bound reason in
 * the execution artifact. Targeted editorial mutants remain mandatory. */
export function planLegacyCandidates(candidates: Candidate[], reviews: CandidateReview[], retirements: LegacyRetirement[] = []) {
  const seen = new Set<number>();
  for (const item of retirements) {
    if (seen.has(item.index) || !Number.isInteger(item.index) || item.index < 0 || item.classification !== "UNSUITABLE_MUTANT" || !/^[a-f0-9]{64}$/.test(item.sourceHash) || typeof item.reason !== "string" || item.reason.trim().length < 100)
      throw new Error("Invalid legacy retirement review");
    const candidate = candidates[item.index], review = reviews.find(r => r.index === item.index);
    if (!candidate || candidate.tag === "correct" || review?.expected !== "OBSERVE" || hash(candidate.sourceCode) !== item.sourceHash || hash(JSON.stringify(candidate.sourceCode)) !== review.sourceHash)
      throw new Error("Retirement must match an unresolved legacy mutant exactly");
    seen.add(item.index);
  }
  const active = candidates.flatMap((candidate, index) => {
    const review = reviews.find(r => r.index === index);
    if (review && review.sourceHash !== hash(JSON.stringify(candidate.sourceCode))) throw new Error("Legacy candidate changed since review");
    return seen.has(index) ? [] : [{ ...candidate, expectation: review?.expected ?? (candidate.tag === "correct" ? "AC" as const : "REJECT" as const) }];
  });
  return { active, retired: retirements };
}
