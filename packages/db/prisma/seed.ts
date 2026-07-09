import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import { LANGUAGES, TestDataStore } from "@oj/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TESTDATA_ROOT = join(__dirname, "..", "testdata");

const prisma = new PrismaClient();
const store = new TestDataStore();

interface SeedProblem {
  slug: string;
  uvaId?: number;
  title: string;
  statementMd: string;
  inputSpecMd: string;
  outputSpecMd: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  difficulty: number;
  source: "UVA" | "CPE" | "CUSTOM";
  tags: string[];
  testCaseCount: number; // number of NN.in/NN.out pairs in testdata/<slug>/
}

const PROBLEMS: SeedProblem[] = [
  {
    slug: "a-plus-b",
    title: "A + B Problem",
    statementMd:
      "Read pairs of integers `a` and `b`, one pair per line, until end of input. " +
      "For each pair, print `a + b` on its own line.",
    inputSpecMd: "Each line contains two integers `a b` with `-10^9 <= a, b <= 10^9`.",
    outputSpecMd: "One line per input pair: the sum `a + b`.",
    timeLimitMs: 1000,
    memoryLimitKb: 65536,
    difficulty: 1,
    source: "CUSTOM",
    tags: ["math", "warmup"],
    testCaseCount: 2,
  },
  {
    slug: "uva-10055-hashmat",
    uvaId: 10055,
    title: "10055 - Hashmat the Brave Warrior",
    statementMd:
      "Hashmat fights monsters with `a` and `b` hit points. Given `a` and `b`, print how many more " +
      "hits the stronger side needs, i.e. `|a - b|`. Read pairs until end of input.",
    inputSpecMd: "Each line has two integers `a b`, `0 <= a, b < 2^31`.",
    outputSpecMd: "One line per test case: `|a - b|`.",
    timeLimitMs: 2000,
    memoryLimitKb: 65536,
    difficulty: 1,
    source: "UVA",
    tags: ["math", "warmup"],
    testCaseCount: 2,
  },
  {
    slug: "uva-10071-physics",
    title: "10071-style - Back to High School Physics (simplified)",
    statementMd:
      "A particle moves at constant velocity `v` for time `t`. Given `v` and `t` on one line, print the " +
      "total distance travelled `2 * v * t` (as in the classic UVA 10071, simplified to integer I/O for " +
      "this deployment). Read pairs until end of input.",
    inputSpecMd: "Each line has two integers `v t`, `0 <= v, t <= 10000`.",
    outputSpecMd: "One line per test case: the integer `2 * v * t`.",
    timeLimitMs: 1000,
    memoryLimitKb: 65536,
    difficulty: 1,
    source: "CUSTOM",
    tags: ["math", "warmup"],
    testCaseCount: 2,
  },
  {
    slug: "sum-to-n",
    title: "Sum to N (tight time limit)",
    statementMd:
      "Given `n`, print `1 + 2 + ... + n`. **Time limit is intentionally tight (500ms)** — an O(n) " +
      "loop will exceed it for large `n`; you need the closed-form `n(n+1)/2`. Useful for exercising " +
      "TLE detection in the judge.",
    inputSpecMd: "A single integer `1 <= n <= 5 * 10^8`.",
    outputSpecMd: "The sum `1 + 2 + ... + n` (fits in a 64-bit integer).",
    timeLimitMs: 500,
    memoryLimitKb: 65536,
    difficulty: 2,
    source: "CUSTOM",
    tags: ["math"],
    testCaseCount: 2,
  },
];

async function main() {
  await store.ensureBucket();

  // Languages
  for (const lang of Object.values(LANGUAGES)) {
    await prisma.language.upsert({
      where: { key: lang.key },
      update: {
        name: lang.name,
        compileCmd: lang.compileCmd ? JSON.stringify(lang.compileCmd) : null,
        runCmd: JSON.stringify(lang.runCmd),
        srcName: lang.srcName,
        timeFactor: lang.timeFactor,
        memOverheadKb: lang.memOverheadKb,
        enabled: true,
      },
      create: {
        key: lang.key,
        name: lang.name,
        compileCmd: lang.compileCmd ? JSON.stringify(lang.compileCmd) : null,
        runCmd: JSON.stringify(lang.runCmd),
        srcName: lang.srcName,
        timeFactor: lang.timeFactor,
        memOverheadKb: lang.memOverheadKb,
        enabled: true,
      },
    });
  }
  console.log(`Seeded ${Object.keys(LANGUAGES).length} languages`);

  // Admin user
  const adminPasswordHash = await argon2.hash("Admin123!");
  const admin = await prisma.user.upsert({
    where: { handle: "admin" },
    update: {},
    create: {
      handle: "admin",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`Seeded admin user (handle=admin, password=Admin123!)`);

  // Demo regular user
  const demoPasswordHash = await argon2.hash("Demo1234!");
  await prisma.user.upsert({
    where: { handle: "demo" },
    update: {},
    create: {
      handle: "demo",
      email: "demo@example.com",
      passwordHash: demoPasswordHash,
      role: "USER",
    },
  });
  console.log(`Seeded demo user (handle=demo, password=Demo1234!)`);

  // Tags
  const tagSlugs = Array.from(new Set(PROBLEMS.flatMap((p) => p.tags)));
  const tagBySlug = new Map<string, string>();
  for (const slug of tagSlugs) {
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { slug, name: slug[0].toUpperCase() + slug.slice(1) },
    });
    tagBySlug.set(slug, tag.id);
  }

  // Problems + test data
  const problemIds: Record<string, string> = {};
  for (const p of PROBLEMS) {
    const problem = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        statementMd: p.statementMd,
        inputSpecMd: p.inputSpecMd,
        outputSpecMd: p.outputSpecMd,
        timeLimitMs: p.timeLimitMs,
        memoryLimitKb: p.memoryLimitKb,
        difficulty: p.difficulty,
        source: p.source,
        uvaId: p.uvaId,
      },
      create: {
        slug: p.slug,
        title: p.title,
        statementMd: p.statementMd,
        inputSpecMd: p.inputSpecMd,
        outputSpecMd: p.outputSpecMd,
        timeLimitMs: p.timeLimitMs,
        memoryLimitKb: p.memoryLimitKb,
        difficulty: p.difficulty,
        source: p.source,
        uvaId: p.uvaId,
        checkerType: "IGNORE_TRAILING_WS",
      },
    });
    problemIds[p.slug] = problem.id;

    for (const tagSlug of p.tags) {
      await prisma.problemTag.upsert({
        where: { problemId_tagId: { problemId: problem.id, tagId: tagBySlug.get(tagSlug)! } },
        update: {},
        create: { problemId: problem.id, tagId: tagBySlug.get(tagSlug)! },
      });
    }

    // Clear existing samples/testcases for idempotent re-seed
    await prisma.sample.deleteMany({ where: { problemId: problem.id } });
    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });

    for (let i = 1; i <= p.testCaseCount; i++) {
      const ord = String(i).padStart(2, "0");
      const inputPath = join(TESTDATA_ROOT, p.slug, `${ord}.in`);
      const outputPath = join(TESTDATA_ROOT, p.slug, `${ord}.out`);
      const input = readFileSync(inputPath, "utf-8");
      const output = readFileSync(outputPath, "utf-8");

      const inputKey = `${p.slug}/${ord}.in`;
      const answerKey = `${p.slug}/${ord}.out`;
      await store.putText(inputKey, input);
      await store.putText(answerKey, output);

      await prisma.testCase.create({
        data: {
          problemId: problem.id,
          ord: i,
          inputKey,
          answerKey,
          isSample: i === 1,
        },
      });

      if (i === 1) {
        await prisma.sample.create({
          data: { problemId: problem.id, ord: i, input, output },
        });
      }
    }

    console.log(`Seeded problem ${p.slug} with ${p.testCaseCount} test cases`);
  }

  // Demo CPE virtual contest bundling all seeded problems
  const cpeContest = await prisma.contest.upsert({
    where: { slug: "cpe-demo-2026-01" },
    update: {},
    create: {
      title: "CPE 模擬考 Demo (2026-01)",
      slug: "cpe-demo-2026-01",
      kind: "CPE",
      durationMin: 180,
      freezeMin: 60,
      penaltyMin: 20,
      scoring: "ICPC",
      isPublic: true,
    },
  });

  const labels = ["A", "B", "C", "D"];
  let ord = 0;
  for (const slug of Object.keys(problemIds)) {
    await prisma.contestProblem.upsert({
      where: { contestId_problemId: { contestId: cpeContest.id, problemId: problemIds[slug] } },
      update: { label: labels[ord], ord },
      create: { contestId: cpeContest.id, problemId: problemIds[slug], label: labels[ord], ord },
    });
    ord++;
  }
  console.log(`Seeded demo CPE contest '${cpeContest.slug}' with ${ord} problems`);

  console.log(`\nDone. Admin user id=${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
