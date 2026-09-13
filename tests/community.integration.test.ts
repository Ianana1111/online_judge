import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { CommunityService } from "../apps/api/src/community/community.service";
import { createPostSchema, createDiscussionSchema, reviewContentSchema } from "../packages/shared/src/schemas";

it("rejects blank content, unexpected publication flags, and rejection without feedback", () => {
  expect(createPostSchema.safeParse({ title: " ", bodyMd: "hello" }).success).toBe(false);
  expect(createPostSchema.safeParse({ title: "Title", bodyMd: "hello", publishedAt: new Date().toISOString() }).success).toBe(false);
  expect(createDiscussionSchema.safeParse({ body: " \n " }).success).toBe(false);
  expect(reviewContentSchema.safeParse({ decision: "REJECTED", reason: " " }).success).toBe(false);
});
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("community publication and review transactions", () => {
  const service = new CommunityService(), users: string[] = [], problems: string[] = [];
  beforeAll(() => { const url = new URL(process.env.DATABASE_URL ?? "invalid:"); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable test database required"); });
  afterAll(async () => { await prisma.user.deleteMany({ where: { id: { in: users } } }); await prisma.problem.deleteMany({ where: { id: { in: problems } } }); await prisma.$disconnect(); });
  async function user(role: "ADMIN" | "USER" = "USER") { const s = randomUUID(); const u = await prisma.user.create({ data: { handle: `community_${s}`, email: `${s}@example.test`, role } }); users.push(u.id); return u; }
  const draft = (bodyMd = "Private draft") => ({ title: randomUUID(), bodyMd, category: "GENERAL" as const, isOfficial: false });
  it("keeps pending and rejected posts private, then publishes exactly the approved snapshot", async () => {
    const [a, admin] = await Promise.all([user(), user("ADMIN")]); const dto = draft(); const p = await service.submitPost(a, dto);
    await expect(service.postDetail(p.id)).rejects.toThrow("Post not found");
    expect((await service.listPosts({ q: dto.title })).items).toHaveLength(0);
    await service.review(p.revisionId, admin, { decision: "REJECTED", reason: "Please add a reproducible example" });
    expect((await service.ownPost(p.id, a)).reason).toBe("Please add a reproducible example");
    await expect(service.postDetail(p.id)).rejects.toThrow();
    const revision = await service.submitPost(a, { ...dto, bodyMd: "Approved example" }, p.id);
    await service.review(revision.revisionId, admin, { decision: "APPROVED" });
    expect((await service.postDetail(p.id)).bodyMd).toBe("Approved example");
    expect(await prisma.notification.count({ where: { userId: a.id, type: "CONTENT_REVIEW" } })).toBe(2);
  });
  it("retains approved text while editing and prevents approval of superseded snapshots", async () => {
    const [a, admin] = await Promise.all([user(), user("ADMIN")]); const p = await service.submitPost(a, draft("Original"));
    await service.review(p.revisionId, admin, { decision: "APPROVED" });
    const first = await service.submitPost(a, draft("First edit"), p.id), second = await service.submitPost(a, draft("Second edit"), p.id);
    expect((await service.postDetail(p.id)).bodyMd).toBe("Original");
    await expect(service.review(first.revisionId, admin, { decision: "APPROVED" })).rejects.toThrow("already been reviewed or replaced");
    expect((await prisma.contentRevision.findUniqueOrThrow({ where: { id: first.revisionId } })).body).toBe("First edit");
    await service.review(second.revisionId, admin, { decision: "APPROVED" });
    expect((await service.postDetail(p.id)).bodyMd).toBe("Second edit");
  });
  it("serializes duplicate reviews into one decision and one notification", async () => {
    const [a, admin] = await Promise.all([user(), user("ADMIN")]); const p = await service.submitPost(a, draft());
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => service.review(p.revisionId, admin, { decision: "APPROVED" })));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await prisma.notification.count({ where: { userId: a.id, type: "CONTENT_REVIEW" } })).toBe(1);
  });
  it("prevents author spoofing, official badge spoofing, foreign edits and foreign draft reads", async () => {
    const [a, b] = await Promise.all([user(), user()]); const p = await service.submitPost(a, draft());
    await expect(service.submitPost(b, { ...draft(), isOfficial: true })).rejects.toThrow();
    await expect(service.submitPost(b, { ...draft(), category: "ANNOUNCEMENT" })).rejects.toThrow();
    await expect(service.submitPost(b, draft(), p.id)).rejects.toThrow();
    await expect(service.ownPost(p.id, b)).rejects.toThrow();
    await expect(service.review(p.revisionId, a, { decision: "APPROVED" })).rejects.toThrow();
    await expect(service.remove("post", p.id, b)).rejects.toThrow();
    expect((await service.ownPosts(b.id)).items).toHaveLength(0);
  });
  it("moderates article comments and edits without leaking either pending version", async () => {
    const [a, b, admin] = await Promise.all([user(), user(), user("ADMIN")]); const p = await service.submitPost(a, draft());
    await expect(service.submitComment({ postId: p.id }, b, { body: "Private parent" })).rejects.toThrow();
    await service.review(p.revisionId, admin, { decision: "APPROVED" });
    const d = await service.submitComment({ postId: p.id }, b, { body: "First comment" });
    expect((await service.listComments({ postId: p.id })).items).toHaveLength(0);
    expect((await service.listComments({ postId: p.id }, undefined, b.id)).items[0].body).toBe("First comment");
    await service.review(d.revisionId, admin, { decision: "APPROVED" });
    const edit = await service.editComment(d.id, b, { body: "Unreviewed edit" });
    expect((await service.listComments({ postId: p.id })).items[0].body).toBe("First comment");
    await expect(service.editComment(d.id, a, { body: "Stolen" })).rejects.toThrow();
    await service.review(edit.revisionId, admin, { decision: "REJECTED", reason: "Please stay on topic" });
    expect((await service.listComments({ postId: p.id })).items[0].body).toBe("First comment");
  });
  it("never resurrects deleted content and hides comments whose parent is removed", async () => {
    const [a, admin] = await Promise.all([user(), user("ADMIN")]); const p = await service.submitPost(a, draft());
    await service.review(p.revisionId, admin, { decision: "APPROVED" });
    const d = await service.submitComment({ postId: p.id }, a, { body: "Pending" });
    await service.remove("post", p.id, a);
    await expect(service.review(d.revisionId, admin, { decision: "APPROVED" })).rejects.toThrow();
    await expect(service.listComments({ postId: p.id })).rejects.toThrow();
    expect((await service.reviewQueue()).items.some((r) => r.id === d.revisionId)).toBe(false);
    const p2 = await service.submitPost(a, draft()); await service.remove("post", p2.id, a);
    await expect(service.review(p2.revisionId, admin, { decision: "APPROVED" })).rejects.toThrow();
  });
  it("requires review on problem comments and respects hidden problem visibility", async () => {
    const [a, admin] = await Promise.all([user(), user("ADMIN")]);
    const p = await prisma.problem.create({ data: { title: "Discussion fixture", slug: randomUUID(), statementMd: "Test" } }); problems.push(p.id);
    const d = await service.submitComment({ problemId: p.id }, a, { body: "Hint" });
    expect((await service.listComments({ problemId: p.id })).items).toHaveLength(0);
    await service.review(d.revisionId, admin, { decision: "APPROVED" });
    expect((await service.listComments({ problemId: p.id })).items[0].body).toBe("Hint");
    await prisma.problem.update({ where: { id: p.id }, data: { visibility: false } });
    await expect(service.listComments({ problemId: p.id })).rejects.toThrow();
    await expect(service.submitComment({ problemId: p.id }, a, { body: "Hidden" })).rejects.toThrow();
  });
  it("paginates approved posts with equal timestamps and omits pending search matches", async () => {
    const a = await user(), token = randomUUID(), when = new Date("2026-01-01");
    await prisma.post.createMany({ data: Array.from({ length: 25 }, (_, i) => ({ authorId: a.id, title: `${token} ${i}`, bodyMd: "Published", createdAt: when, publishedAt: when })) });
    await service.submitPost(a, { ...draft(), title: token });
    const first = await service.listPosts({ q: token }), second = await service.listPosts({ q: token, cursor: first.nextCursor! });
    expect(first.items).toHaveLength(20); expect(second.items).toHaveLength(5);
    expect(new Set([...first.items, ...second.items].map((p) => p.id)).size).toBe(25);
  });
  it("exports every public sitemap entry across page boundaries without private content", async () => {
    const a = await user(), when = new Date("2026-02-01");
    const ids = Array.from({ length: 1005 }, () => randomUUID());
    await prisma.post.createMany({ data: ids.map((id) => ({ id, authorId: a.id, title: "Sitemap fixture", bodyMd: "Never included in sitemap metadata", createdAt: when, publishedAt: when })) });
    const pending = await service.submitPost(a, draft());
    const removed = await prisma.post.create({ data: { authorId: a.id, title: "Removed", bodyMd: "Private", publishedAt: when, deletedAt: when } });
    const collected = new Set<string>(); let cursor: string | undefined;
    do {
      const result = await service.postSitemap(cursor);
      expect(result.items.length).toBeLessThanOrEqual(1000);
      for (const item of result.items) {
        expect(Object.keys(item).sort()).toEqual(["createdAt", "id", "updatedAt"]);
        expect(collected.has(item.id)).toBe(false);
        collected.add(item.id);
      }
      cursor = result.nextCursor ?? undefined;
    } while (cursor);
    expect(ids.every((id) => collected.has(id))).toBe(true);
    expect(collected.has(pending.id)).toBe(false);
    expect(collected.has(removed.id)).toBe(false);
  });
});
