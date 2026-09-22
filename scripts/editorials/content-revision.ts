import { officialEditorialSchema, type OfficialEditorial } from "../../packages/shared/src/editorial";
import { contentRevisionSchema } from "../../packages/shared/src/editorialEvidence";
import { editorialHash, sha256, type AuditProblem, type loadVerification } from "./evidence";
import { validatePublication, type PublicationFiles } from "./publication";

/** A prose revision can reuse execution results only after validating the exact old
 * content those results certified. Historical reports are never relabelled or rewritten. */
export function validateContentRevision(problem: AuditProblem, content: OfficialEditorial,
  verification: Awaited<ReturnType<typeof loadVerification>>, files: PublicationFiles,
  toolchain: string, input: unknown) {
  const revision = contentRevisionSchema.parse(input);
  const before = revision.previousContent, review = revision.review;
  const after = officialEditorialSchema.parse(content);
  if (!after.translations?.en) throw new Error(`${problem.slug}: Both teaching languages are required`);
  if (review.slug !== problem.slug || before.slug !== problem.slug ||
    review.previousContentHash !== editorialHash(before) || review.revisedContentHash !== editorialHash(after)) {
    throw new Error(`${problem.slug}: Content review is stale`);
  }
  const sources = (value: OfficialEditorial) => value.solutions.map(s => ({languageKey:s.languageKey,sourceHash:sha256(s.sourceCode)})).sort((a,b)=>a.languageKey.localeCompare(b.languageKey));
  if (JSON.stringify(sources(before)) !== JSON.stringify(sources(after))) {
    throw new Error(`${problem.slug}: A changed reference requires new execution evidence`);
  }
  // Rechecks every sample, hidden case, mutant, oracle, toolchain and Run result.
  const originalProof = validatePublication(problem, before, verification, files, toolchain);
  return { ...originalProof, contentHash: editorialHash(after),
    contentRevision: { previousContentHash:review.previousContentHash, reviewedAt:review.reviewedAt,
      reviewHash:sha256(JSON.stringify(review)), scope:"Teaching and translation only; exact previously judged source retained" },
  };
}
