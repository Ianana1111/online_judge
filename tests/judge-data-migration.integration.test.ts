import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";

it.skipIf(process.env.RUN_DB_TESTS !== "1")("appends reviewed judge cases idempotently and preserves existing hidden data", async () => {
  const url = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
  const data = JSON.parse(await readFile(new URL("../packages/db/audit/launch-regressions.json", import.meta.url), "utf8"));
  const cases = data.cases as { slug: string; uvaId: number; input: string; output: string }[];
  const corrections = data.corrections as { slug: string; input: string; previousOutput: string; output: string }[];
  const ids: string[] = [];
  try {
    for (const c of cases) {
      const p = await prisma.problem.create({ data: { slug: c.slug, uvaId: c.uvaId, title: "Content migration fixture", statementMd: "Synthetic", testCases: { create: { ord: 7, input: "retained-input", output: "retained-output" } } } }); ids.push(p.id);
      const correction = corrections.find((entry) => entry.slug === c.slug);
      if (correction) await prisma.testCase.createMany({ data: [
        { problemId: p.id, ord: 1, input: correction.input, output: correction.previousOutput },
        { problemId: p.id, ord: 2, input: correction.input, output: "Custom answer must be preserved" },
        { problemId: p.id, ord: 3, input: "A different input", output: correction.previousOutput },
      ] });
    }
    const sql = (await Promise.all(["20260912040000_judge_regression_cases", "20260912050000_tourist_guide_answer"].map((name) => readFile(new URL(`../packages/db/prisma/migrations/${name}/migration.sql`, import.meta.url), "utf8")))).join("\n");
    // This particular reviewed migration contains only statements separated by semicolon/newline.
    const statements = sql.split(/;\s*(?:\n|$)/).filter((s) => s.trim());
    for (let attempt = 0; attempt < 2; attempt++) await prisma.$transaction(async (tx) => { for (const statement of statements) await tx.$executeRawUnsafe(statement); });
    for (const c of cases) {
      const p = await prisma.problem.findUniqueOrThrow({ where: { slug: c.slug }, include: { testCases: { orderBy: { ord: "asc" } } } });
      const correction = corrections.find((entry) => entry.slug === c.slug);
      expect(p.testCases).toHaveLength(correction ? 5 : 2);
      expect(p.testCases.find((tc) => tc.ord === 7)).toMatchObject({ input: "retained-input", output: "retained-output" });
      expect(p.testCases.find((tc) => tc.ord === 8)).toMatchObject({ input: c.input, output: c.output });
      if (correction) {
        expect(p.testCases.find((tc) => tc.ord === 1)?.output).toBe(correction.output);
        expect(p.testCases.find((tc) => tc.ord === 2)?.output).toBe("Custom answer must be preserved");
        expect(p.testCases.find((tc) => tc.ord === 3)?.output).toBe(correction.previousOutput);
      }
      if (c.uvaId === 10150) expect(p.checkerType).toBe("SPECIAL");
    }
  } finally { await prisma.problem.deleteMany({ where: { id: { in: ids } } }); await prisma.$disconnect(); }
});
