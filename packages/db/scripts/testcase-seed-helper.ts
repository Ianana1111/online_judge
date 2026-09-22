/** Shared by every seed-cpe49-*.ts / seed-pilot-testcases.ts script: writes a problem's TestCase
 * rows from its existing Sample row(s) plus one or more hand-authored boundary cases. */
import { prisma, type Prisma } from "@oj/db";

export interface Boundary {
  input: string;
  output: string;
}

/** Scraped Sample rows carry recurring artifacts this project has actually hit:
 *  - a stray leading blank line before the real content (uva-10035)
 *  - CRLF line endings (uva-10035, uva-10420, ...) — harmless for pure `cin >>` parsing, but a
 *    silent trap for the extremely common `cin >> n; cin.ignore(); getline(...)` idiom: ignore()
 *    only skips one character, so it eats the '\r' and leaves the '\n' behind, which the next
 *    getline() then reads as a spurious empty line, off-by-one-shifting every line after it. A
 *    technically-correct student solution using that idiom would get a false WA against CRLF test
 *    data for no algorithmic reason — so this gets normalized out of the data entirely rather than
 *    just tolerated by the checker's whitespace normalization (which only fixes *output*
 *    comparison, not *input* parsing). Applied to hand-authored boundary text too — harmless no-op
 *    there since that text is already LF-only, but keeps every TestCase row uniform.
 *  - a bare '\r' with no following '\n' (uva-10382): a dropped-newline scraping artifact that
 *    silently glues two real lines into one, shifting every token after it. `\r\n?` (not `\r\n`)
 *    catches this too, since the `\n?` matches even when there's nothing there to match.
 */
function clean(s: string): string {
  // A trailing-whitespace *replace* only fires when there's some trailing whitespace to match —
  // scraped Sample.output occasionally has none at all (e.g. uva-10369's last line has no newline
  // after it), which used to leave the stored expected output missing its final "\n" entirely. A
  // real correct submission's stdout almost always ends with one (println), so that mismatch would
  // fail every correct submission against that test case. Trim unconditionally, then add exactly
  // one "\n" back — except when the result is empty, since a genuinely empty expected output (e.g.
  // uva-10035's "0 0" terminator with no data) must stay empty, not become a spurious blank line.
  const trimmed = s.replace(/\r\n?/g, "\n").replace(/^\s*\n/, "").replace(/\s+$/, "");
  return trimmed === "" ? "" : trimmed + "\n";
}

/** Lock the same parent row as editorial publication, before reading samples/cases.
 * Even a superseded or unpublished verified snapshot protects its corpus: old seed
 * scripts must never undo a reviewed release. Changes then require new proof and
 * the guarded editorial publication flow, not a bypass flag on a legacy seed. */
async function lockSeedableProblem(tx: Prisma.TransactionClient, slug: string) {
  await tx.$queryRaw`SELECT id FROM problems WHERE slug = ${slug} FOR UPDATE`;
  const problem = await tx.problem.findUniqueOrThrow({ where: { slug } });
  const verified = await tx.problemEditorial.findFirst({ where: { problemId: problem.id }, select: { id: true } });
  if (verified) throw new Error(`${slug}: verified editorial corpus is protected; use the reviewed editorial publication flow`);
  return problem;
}

export async function seedFromSample(slug: string, boundaries: Boundary[], sampleLimit?: number): Promise<void> {
  if (sampleLimit !== undefined && (!Number.isSafeInteger(sampleLimit) || sampleLimit < 0)) throw new Error("Invalid sample limit");
  const result = await prisma.$transaction(async tx => {
    const problem = await lockSeedableProblem(tx, slug);
    const allSamples = await tx.sample.findMany({ where: { problemId: problem.id }, orderBy: { ord: "asc" } });
    // Zero deliberately excludes an untrustworthy scraped sample.
    const samples = sampleLimit === undefined ? allSamples : allSamples.slice(0, sampleLimit);
    const rows = [
      ...samples.map((sample, i) => ({ problemId: problem.id, ord: i + 1, input: clean(sample.input), output: clean(sample.output) })),
      ...boundaries.map((boundary, i) => ({
        problemId: problem.id, ord: samples.length + i + 1, input: clean(boundary.input), output: cleanBoundaryOutput(boundary.output),
      })),
    ];
    // Atomic replacement prevents transient fallback to the remote UVa judge.
    await tx.testCase.deleteMany({ where: { problemId: problem.id } });
    await tx.testCase.createMany({ data: rows });
    return { count: rows.length, samples: samples.length };
  });
  console.log(`${slug}: seeded ${result.count} test cases (${result.samples} from Sample + ${boundaries.length} boundary)`);
}

function cleanBoundaryOutput(value: string): string {
  // A leading blank line can itself be the first answer; never remove it.
  const trimmed = value.replace(/\r\n?/g, "\n").replace(/\s+$/, "");
  return trimmed === "" ? "" : trimmed + "\n";
}

/** Add a counterexample to an unverified legacy corpus without losing concurrent
 * additions. Reviewed editorial corpora go through proof-bound publication. */
export async function appendTestCase(slug: string, boundary: Boundary): Promise<void> {
  const count = await prisma.$transaction(async tx => {
    const problem = await lockSeedableProblem(tx, slug);
    const last = await tx.testCase.findFirst({ where: { problemId: problem.id }, orderBy: { ord: "desc" }, select: { ord: true } });
    await tx.testCase.create({ data: {
      problemId: problem.id, ord: (last?.ord ?? 0) + 1, input: clean(boundary.input), output: cleanBoundaryOutput(boundary.output),
    } });
    return tx.testCase.count({ where: { problemId: problem.id } });
  });
  console.log(`${slug}: appended 1 test case (now ${count} total)`);
}
