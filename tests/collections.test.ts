import { expect, it, vi, beforeEach } from "vitest";
import { collectionCategory, examEssentialsIds, TOPIC_COLLECTIONS } from "../apps/api/src/collections/catalog";
import { CollectionsService } from "../apps/api/src/collections/collections.service";
const db = vi.hoisted(() => ({ collection: { findMany: vi.fn() }, problem: { findMany: vi.fn() }, contest: { findMany: vi.fn() }, submission: { findMany: vi.fn() } }));
vi.mock("../packages/db/src/index.ts", () => ({ prisma: db }));
vi.mock("../apps/api/src/billing/pro-gate.util", () => ({ isRequesterPro: vi.fn(async () => false), examAppearancesFor: vi.fn() }));
const p = (id: string, tag = "math") => ({ id, slug: id, title: id, uvaId: 100, difficulty: 2, source: "UVA", tags: [{ tag: { slug: tag } }] });
const cp = (id: string, ord: number, visibility = true) => ({ problemId: id, ord, problem: { visibility } });
beforeEach(() => { db.collection.findMany.mockResolvedValue([]); db.problem.findMany.mockResolvedValue([p("one"), p("two", "array"), p("three")]); db.contest.findMany.mockResolvedValue([{ problems: [cp("one", 0), cp("two", 1)] }, { problems: [cp("one", 0), cp("three", 1)] }]); });
it("deduplicates first three original slots, retaining the true order before hiding private problems", () => {
  expect(examEssentialsIds([{ problems: [cp("fourth", 3), cp("hidden", 0, false), cp("second", 1), cp("third", 2)] }, { problems: [cp("second", 0)] }])).toEqual(["second", "third"]);
});
it("generates nonempty topic collections and a deduplicated exam collection with working detail routes", async () => {
  const service = new CollectionsService(), list = await service.list();
  expect(list.map((c) => c.slug)).toEqual(["cpe-before-exam", "algo-math", "algo-array"]);
  expect(list[0].problemCount).toBe(3);
  expect((await service.detail("algo-math", null)).problems.map((p) => p.id)).toEqual(["one", "three"]);
  expect((await service.detail("cpe-before-exam", null)).problems.every((p) => p.cpeAppearances === null)).toBe(true);
  await expect(service.detail("algo-nonexistent", null)).rejects.toThrow("Collection not found");
});
it("preserves curated membership and old routes while renaming section labels", async () => {
  db.collection.findMany.mockResolvedValue([{ id: "stored", slug: "algo-math", title: "Curated", description: "Reviewed", category: "演算法主題", problems: [{ problem: p("three") }] }]);
  const service = new CollectionsService(), list = await service.list();
  expect(list.filter((c) => c.slug === "algo-math")).toHaveLength(1);
  expect(list.find((c) => c.slug === "algo-math")).toMatchObject({ category: "主題專區", title: "Curated", problemCount: 1 });
  expect((await service.detail("algo-math", null)).problems.map((p) => p.id)).toEqual(["three"]);
  expect(collectionCategory("考試歷屆")).toBe("考試專區"); expect(TOPIC_COLLECTIONS).toHaveLength(12);
});
it("filters hidden problems and non-public/future exams in database queries", async () => {
  await new CollectionsService().list();
  expect(db.problem.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { visibility: true } }));
  expect(db.collection.findMany.mock.calls[0][0].include.problems.where).toEqual({ problem: { visibility: true } });
  expect(db.contest.findMany.mock.calls[0][0].where).toMatchObject({ kind: "CPE", isPublic: true, OR: [{ startAt: null }, { startAt: { lte: expect.any(Date) } }] });
});
