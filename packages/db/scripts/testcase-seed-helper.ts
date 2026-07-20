/** Shared by every seed-cpe49-*.ts / seed-pilot-testcases.ts script: writes a problem's TestCase
 * rows from its existing Sample row(s) plus one or more hand-authored boundary cases. */
import { prisma } from "@oj/db";

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

export async function seedFromSample(slug: string, boundaries: Boundary[], sampleLimit?: number): Promise<void> {
  const problem = await prisma.problem.findUniqueOrThrow({ where: { slug } });
  const allSamples = await prisma.sample.findMany({ where: { problemId: problem.id }, orderBy: { ord: "asc" } });
  // `sampleLimit ? ... : ...` would be wrong here: 0 is a legitimate, meaningful value (a problem
  // whose entire scraped Sample is untrustworthy and should be skipped, e.g. uva-11005) but is
  // falsy in JS, so that ternary would silently fall through to "use every sample" instead —
  // exactly the class of bug already hit once in judge.ts's exit-code parsing.
  const samples = sampleLimit === undefined ? allSamples : allSamples.slice(0, sampleLimit);

  const rows = [
    ...samples.map((s, i) => ({ problemId: problem.id, ord: i + 1, input: clean(s.input), output: clean(s.output) })),
    ...boundaries.map((b, i) => ({
      problemId: problem.id,
      ord: samples.length + i + 1,
      input: clean(b.input),
      // Boundary output may intentionally start with a blank line (e.g. "no characters in
      // common" producing an empty first line) — only trim trailing whitespace, never a leading
      // blank line, for hand-authored content. Same unconditional-trailing-newline fix as clean()
      // above: always end in exactly one "\n" unless the whole output is genuinely empty.
      output: (() => {
        const t = b.output.replace(/\r\n?/g, "\n").replace(/\s+$/, "");
        return t === "" ? "" : t + "\n";
      })(),
    })),
  ];
  // deleteMany + createMany must commit together: worker.ts routes a problem to the real UVa
  // relay the instant its TestCase count reads 0 (see worker.ts's `testCases.length > 0` check),
  // so a crash between two standalone calls would silently flip that problem back to the UVa path
  // until the next successful re-run, with no error surfaced anywhere. $transaction makes the
  // pair atomic: on any failure the deleteMany itself rolls back, so the DB always holds either
  // the full old row set or the full new one, never a gap.
  await prisma.$transaction([
    prisma.testCase.deleteMany({ where: { problemId: problem.id } }),
    prisma.testCase.createMany({ data: rows }),
  ]);
  console.log(`${slug}: seeded ${rows.length} test cases (${samples.length} from Sample + ${boundaries.length} boundary)`);
}
