/**
 * One-off, manually-vetted fix for two GPE problems that scrape-gpe.ts's exact-normalized-title
 * matcher missed against uHunt, even though a real UVa equivalent exists:
 *
 *   - gpe-10679-irreducible-basic-fractions -> UVa 10179. Missed because UVa's own catalog title
 *     has a typo ("Irreducable Basic Fractions"). Confirmed beyond doubt: the GPE-stored statement
 *     text already ends with "Source: http://uva.onlinejudge.org/external/101/10179.html".
 *   - gpe-24931-extend-to-palindromes -> UVa 11475. Missed because uHunt's cached title is
 *     singular ("Extend to Palindrome") while both UVa's real PDF and the GPE statement say
 *     "Palindromes". Confirmed by fetching UVa 11475's PDF and diffing it word-for-word against
 *     the stored statement — identical, including the shared "palidrome" typo.
 *
 * Deliberately NOT a general re-run of the fuzzy matcher against the other 16 uvaId=null
 * problems — those were individually checked and either explicitly cite LeetCode/a non-UVa source
 * in their own statement text, or have no confident match. Guessing there would risk recreating
 * the exact "submitted against the wrong problem" bug class this project already got bitten by
 * once (see uvaPid). Only touches rows explicitly listed here, and only sets uvaId/uvaPid — never
 * touches statementMd, so the already-correct (word-for-word verified) statement is untouched.
 */
import { prisma } from "@oj/db";
import { fetchUhuntPidMap } from "./uhuntDifficulty.js";

const FIXES: { slug: string; uvaId: number }[] = [
  { slug: "gpe-10679-irreducible-basic-fractions", uvaId: 10179 },
  { slug: "gpe-24931-extend-to-palindromes", uvaId: 11475 },
];

async function main() {
  const pidByNum = await fetchUhuntPidMap();

  for (const fix of FIXES) {
    const problem = await prisma.problem.findUnique({ where: { slug: fix.slug } });
    if (!problem) {
      console.error(`  ! ${fix.slug}: not found, skipping`);
      continue;
    }
    if (problem.uvaId !== null) {
      console.log(`  - ${fix.slug}: already has uvaId=${problem.uvaId}, skipping`);
      continue;
    }
    const uvaPid = pidByNum.get(fix.uvaId);
    if (uvaPid === undefined) {
      console.error(`  ! ${fix.slug}: no uHunt pid found for uva${fix.uvaId}, skipping`);
      continue;
    }
    const conflict = await prisma.problem.findUnique({ where: { uvaId: fix.uvaId } });
    if (conflict) {
      console.error(`  ! ${fix.slug}: uva${fix.uvaId} already used by ${conflict.slug}, skipping`);
      continue;
    }
    await prisma.problem.update({ where: { id: problem.id }, data: { uvaId: fix.uvaId, uvaPid } });
    console.log(`  + ${fix.slug}: set uvaId=${fix.uvaId}, uvaPid=${uvaPid}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
