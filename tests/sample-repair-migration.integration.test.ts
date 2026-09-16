import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
const review = JSON.parse(readFileSync(new URL("../packages/db/audit/sample-repairs-20260917.json", import.meta.url), "utf8"));
const originalSql = readFileSync(new URL("../packages/db/prisma/migrations/20260917010000_sample_run_consistency/migration.sql", import.meta.url), "utf8");
it("keeps migration content identical to the reviewed sample repairs", () => {
  expect(originalSql).toContain(JSON.stringify(review.problems));
  const lcs = review.problems.find((p: any) => p.uvaId === 10405);
  expect(lcs.sample.output).toBe("11\n4\n3\n26\n14\n"); expect(lcs.sample.input.length).toBeLessThan(4096);
  const pairs = lcs.cases[1].input.split("\n"); pairs.pop();
  const answers = lcs.cases[1].output.trim().split("\n").map(Number);
  for (let k = 0; k < pairs.length; k += 2) {
    const a = pairs[k], b = pairs[k + 1], table = new Uint16Array((a.length + 1) * (b.length + 1));
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) table[i * (b.length + 1) + j] = a[i - 1] === b[j - 1] ? table[(i - 1) * (b.length + 1) + j - 1] + 1 : Math.max(table[(i - 1) * (b.length + 1) + j], table[i * (b.length + 1) + j - 1]);
    expect(answers[k / 2]).toBe(table.at(-1));
  }
});
it.skipIf(process.env.RUN_DB_TESTS !== "1")("repairs only captured sample revisions, preserves hidden data and rolls back on conflicts", async () => {
  const url = new URL(process.env.DATABASE_URL ?? "invalid:"); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
  const ids: string[] = [], hash = (s: string) => createHash("md5").update(s).digest("hex"); let sql = originalSql;
  try {
    for (const item of review.problems) {
      const p = await prisma.problem.create({ data: { slug: item.slug, uvaId: item.uvaId, title: "Repair fixture", statementMd: "Fixture", testCases: { create: { ord: 7, input: "retain", output: "retain" } } } }); ids.push(p.id);
      for (const correction of item.corrections ?? []) {
        await prisma.testCase.create({ data: { problemId: p.id, ord: correction.ord, input: "captured case input", output: "captured case output" } });
        sql = sql.replaceAll(correction.inputMd5, hash("captured case input")).replaceAll(correction.outputMd5, hash("captured case output"));
      }
      for (const before of item.before) {
        await prisma.sample.create({ data: { problemId: p.id, ord: before.ord, input: "captured input", output: "captured output" } });
        sql = sql.replaceAll(before.inputMd5, hash("captured input")).replaceAll(before.outputMd5, hash("captured output"));
      }
    }
    const guarded = await prisma.sample.findFirstOrThrow({ where: { problemId: ids[2] } });
    await prisma.sample.update({ where: { id: guarded.id }, data: { output: "concurrent author edit" } });
    await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow("Sample content changed");
    expect(await prisma.sample.count({ where: { problemId: ids[1] } })).toBe(0);
    expect((await prisma.sample.findFirstOrThrow({ where: { problemId: ids[0] } })).output).toBe("captured output");
    await prisma.sample.update({ where: { id: guarded.id }, data: { output: "captured output" } });
    for (let i = 0; i < 2; i++) await prisma.$executeRawUnsafe(sql);
    for (const [i, item] of review.problems.entries()) {
      expect(await prisma.sample.findMany({ where: { problemId: ids[i] } })).toEqual([expect.objectContaining(item.sample)]);
      expect(await prisma.testCase.count({ where: { problemId: ids[i] } })).toBe(1 + item.cases.length + (item.corrections?.length ?? 0));
      for (const correction of item.corrections ?? []) expect(await prisma.testCase.findFirst({ where: { problemId: ids[i], ord: correction.ord } })).toMatchObject({ output: correction.output });
      expect(await prisma.testCase.findFirst({ where: { problemId: ids[i], ord: 7 } })).toMatchObject({ input: "retain", output: "retain" });
    }
  } finally { await prisma.problem.deleteMany({ where: { id: { in: ids } } }); }
});
