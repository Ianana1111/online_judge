import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { streamTestCases } from "../apps/judge/src/local/testData";

it.skipIf(process.env.RUN_DB_TESTS !== "1")("streams actual database test cases in order and releases buffers on early exit", async () => {
  const url = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
  const p = await prisma.problem.create({ data: { slug: `stream-${randomUUID()}`, title: "Stream fixture", statementMd: "Fixture", testCases: { create: [{ ord: 2, input: "last", output: "2" }, { ord: 0, input: "first", output: "0" }] } } });
  try {
    const cases = [];
    for await (const row of await streamTestCases(p.id)) cases.push(row);
    expect(cases).toEqual([{ ord: 0, input: "first", output: "0" }, { ord: 2, input: "last", output: "2" }]);
    await Promise.all(Array.from({ length: 50 }, async () => { for await (const row of await streamTestCases(p.id)) { expect(row.ord).toBe(0); break; } }));
    await expect(streamTestCases("missing")).rejects.toThrow("Missing test data");
  } finally { await prisma.problem.delete({ where: { id: p.id } }); await prisma.$disconnect(); }
});
