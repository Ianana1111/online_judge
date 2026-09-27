import { prisma } from "@oj/db";

// Hidden inputs are loaded one at a time. Reserve a conservative buffer budget before fetching
// their contents; 50 large submissions must not load 50 complete test suites into the worker.
const BUDGET = 192 * 1024 * 1024;
let used = 0;
const waiting: { bytes: number; resolve: (release: () => void) => void }[] = [];
function drain() {
  while (waiting.length && used + waiting[0].bytes <= BUDGET) {
    const item = waiting.shift()!;
    used += item.bytes;
    item.resolve(() => { used -= item.bytes; drain(); });
  }
}
function reserve(bytes: number) {
  if (bytes > BUDGET) throw new Error("Test case exceeds the worker buffer budget");
  return new Promise<() => void>((resolve) => { waiting.push({ bytes, resolve }); drain(); });
}
export async function streamTestCases(problemId: string) {
  const cases = await prisma.$queryRaw<{ id: string; bytes: number }[]>`
    SELECT id, octet_length(input) + octet_length(output) AS bytes FROM test_cases WHERE "problemId" = ${problemId} ORDER BY ord`;
  if (!cases.length) throw new Error("Missing test data");
  return (async function* () {
    for (const item of cases) {
      const release = await reserve(item.bytes * 4 + 8 * 1024 * 1024);
      try {
        yield await prisma.testCase.findUniqueOrThrow({ where: { id: item.id }, select: { ord: true, input: true, output: true } });
      } finally { release(); }
    }
  })();
}
