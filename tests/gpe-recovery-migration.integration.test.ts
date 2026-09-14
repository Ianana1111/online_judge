import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";

type ReviewedProblem = {
  slug: string; title: string; originalStatement: string; replacementStatement: string | null; checkerType: string;
  timeLimitMs: number; memoryLimitKb: number;
  sample: { input: string; output: string }; cases: { label: string; input: string; output: string }[];
};

it.skipIf(process.env.RUN_DB_TESTS !== "1")("recovers all 16 GPE corpora atomically, rejects metadata/answer drift and preserves existing data on reapplication", async () => {
  const url = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
  const { problems } = JSON.parse(await readFile(new URL("../packages/db/audit/gpe-recovery-cases.json", import.meta.url), "utf8")) as { problems: ReviewedProblem[] };
  const sql = await readFile(new URL("../packages/db/prisma/migrations/20260915000000_restore_gpe_judge_cases/migration.sql", import.meta.url), "utf8");
  const ids: string[] = [];
  try {
    expect(problems).toHaveLength(16);
    for (const p of problems) {
      const created = await prisma.problem.create({ data: {
        slug: p.slug, title: p.title, source: "GPE", statementMd: p.originalStatement,
        timeLimitMs: p.timeLimitMs, memoryLimitKb: p.memoryLimitKb,
        testCases: { create: { ord: 7, input: "retained private input", output: "retained private output" } },
        samples: { create: { ord: 1, ...p.sample } },
      } }); ids.push(created.id);
    }
    const count = () => prisma.testCase.count({ where: { problemId: { in: ids } } });
    // A late mismatch must roll back additions made for every earlier problem.
    await prisma.problem.update({ where: { id: ids.at(-1)! }, data: { statementMd: "Edited after review" } });
    await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow(/metadata changed/);
    expect(await count()).toBe(16);
    await prisma.problem.update({ where: { id: ids.at(-1)! }, data: { statementMd: problems.at(-1)!.originalStatement } });
    await prisma.problem.update({ where: { id: ids[0] }, data: { uvaPid: 123 } });
    await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow(/metadata changed/);
    await prisma.problem.update({ where: { id: ids[0] }, data: { uvaPid: null, checkerType: "EXACT" } });
    await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow(/metadata changed/);
    await prisma.problem.update({ where: { id: ids[0] }, data: { checkerType: "IGNORE_TRAILING_WS" } });
    await prisma.problem.update({ where: { id: ids[0] }, data: { timeLimitMs: problems[0].timeLimitMs + 1 } });
    await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow(/metadata changed/);
    expect(await count()).toBe(16);
    await prisma.problem.update({ where: { id: ids[0] }, data: { timeLimitMs: problems[0].timeLimitMs, memoryLimitKb: problems[0].memoryLimitKb + 1 } });
    await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow(/metadata changed/);
    await prisma.problem.update({ where: { id: ids[0] }, data: { memoryLimitKb: problems[0].memoryLimitKb } });
    const conflict = await prisma.testCase.create({ data: { problemId: ids.at(-1)!, ord: 2, input: problems.at(-1)!.cases[0].input, output: "unreviewed answer" } });
    await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow(/answer conflicts/);
    expect(await count()).toBe(17);
    expect((await prisma.testCase.findUniqueOrThrow({ where: { id: conflict.id } })).output).toBe("unreviewed answer");
    await prisma.testCase.delete({ where: { id: conflict.id } });
    await prisma.$executeRawUnsafe(sql);
    const first = await prisma.problem.findMany({ where: { id: { in: ids } }, orderBy: { slug: "asc" }, include: { testCases: { orderBy: { ord: "asc" } }, samples: true } });
    expect(await count()).toBe(16 + problems.reduce((n, p) => n + p.cases.length, 0));
    for (const [index, p] of first.entries()) {
      const reviewed = problems[index];
      expect(p.checkerType).toBe(reviewed.checkerType);
      expect(p.statementMd).toBe(reviewed.replacementStatement ?? reviewed.originalStatement);
      expect(p.samples).toHaveLength(1);
      expect(p.samples[0]).toMatchObject(reviewed.sample);
      expect(p.testCases[0]).toMatchObject({ ord: 7, input: "retained private input", output: "retained private output" });
      expect(p.testCases.slice(1).map(({ ord, input, output }) => ({ ord, input, output }))).toEqual(reviewed.cases.map((c, i) => ({ ord: i + 8, input: c.input, output: c.output })));
    }
    await prisma.$executeRawUnsafe(sql);
    expect(await prisma.problem.findMany({ where: { id: { in: ids } }, orderBy: { slug: "asc" }, include: { testCases: { orderBy: { ord: "asc" } }, samples: true } })).toEqual(first);
  } finally {
    await prisma.problem.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
}, 60_000);
