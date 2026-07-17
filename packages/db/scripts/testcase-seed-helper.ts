/** Shared by every seed-cpe49-*.ts / seed-pilot-testcases.ts script: writes a problem's TestCase
 * rows from its existing Sample row(s) plus one or more hand-authored boundary cases. */
import { prisma } from "@oj/db";

export interface Boundary {
  input: string;
  output: string;
}

/** Scraped Sample rows carry two recurring artifacts this project has actually hit:
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
 */
function clean(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/^\s*\n/, "")
    .replace(/\s+$/, "\n");
}

export async function seedFromSample(slug: string, boundaries: Boundary[], sampleLimit?: number): Promise<void> {
  const problem = await prisma.problem.findUniqueOrThrow({ where: { slug } });
  const allSamples = await prisma.sample.findMany({ where: { problemId: problem.id }, orderBy: { ord: "asc" } });
  const samples = sampleLimit ? allSamples.slice(0, sampleLimit) : allSamples;

  await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
  const rows = [
    ...samples.map((s, i) => ({ problemId: problem.id, ord: i + 1, input: clean(s.input), output: clean(s.output) })),
    ...boundaries.map((b, i) => ({
      problemId: problem.id,
      ord: samples.length + i + 1,
      input: clean(b.input),
      // Boundary output may intentionally start with a blank line (e.g. "no characters in
      // common" producing an empty first line) — only trim trailing whitespace, never a leading
      // blank line, for hand-authored content.
      output: b.output.replace(/\r\n/g, "\n").replace(/\s+$/, "\n"),
    })),
  ];
  await prisma.testCase.createMany({ data: rows });
  console.log(`${slug}: seeded ${rows.length} test cases (${samples.length} from Sample + ${boundaries.length} boundary)`);
}
