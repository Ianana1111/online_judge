import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import regression from "../packages/db/audit/conformity-order-regression.json";

describe.skipIf(process.env.RUN_DB_TESTS !== "1")("Conformity production regression migration", () => {
  it("appends the distinguishing case once and preserves the existing corpus", async () => {
    const url = new URL(process.env.DATABASE_URL!);
    if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable local database required");
    const change = regression.cases[0];
    const problem = await prisma.problem.create({ data: { slug: change.slug, title: "Conformity migration fixture", statementMd: "Fixture", testCases: { create: { ord: 7, input: "1\n101 102 103 104 105\n0\n", output: "1\n" } } }, include: { testCases: true } });
    try {
      const sql = await readFile(new URL("../packages/db/prisma/migrations/20260914000000_conformity_order_regression/migration.sql", import.meta.url), "utf8");
      await prisma.$executeRawUnsafe(sql);
      await prisma.$executeRawUnsafe(sql);
      const cases = await prisma.testCase.findMany({ where: { problemId: problem.id }, orderBy: { ord: "asc" } });
      expect(cases).toHaveLength(2);
      expect(cases[0]).toEqual(problem.testCases[0]);
      expect(cases[1]).toMatchObject({ ord: 8, input: change.input, output: change.output });
    } finally {
      await prisma.problem.delete({ where: { id: problem.id } });
      await prisma.$disconnect();
    }
  });
});
