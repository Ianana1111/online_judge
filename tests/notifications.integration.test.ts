import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { markNotificationsReadSchema } from "../packages/shared/src/schemas";
import { NotificationsService } from "../apps/api/src/notifications/notifications.service";

it("requires explicit nonempty notification ids or an all-read snapshot", () => {
  expect(markNotificationsReadSchema.safeParse({}).success).toBe(false);
  expect(markNotificationsReadSchema.safeParse({ ids: [] }).success).toBe(false);
  expect(markNotificationsReadSchema.safeParse({ all: true }).success).toBe(false);
});
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("notification ownership and read semantics", () => {
  const service = new NotificationsService(), users: string[] = [];
  beforeAll(() => { const url = new URL(process.env.DATABASE_URL ?? "invalid:"); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable local database required"); });
  afterAll(async () => { await prisma.user.deleteMany({ where: { id: { in: users } } }); await prisma.$disconnect(); });
  async function account() { const suffix = randomUUID(); const user = await prisma.user.create({ data: { handle: `notif_${suffix}`, email: `${suffix}@example.test` } }); users.push(user.id); return user; }
  it("paginates tied timestamps without duplication and does not mark reads on list", async () => {
    const user = await account();
    await prisma.notification.createMany({ data: Array.from({ length: 25 }, (_, i) => ({ userId: user.id, type: "TEST", title: `Update ${i}`, createdAt: new Date("2026-01-01") })) });
    const first = await service.list(user.id), second = await service.list(user.id, { cursor: first.nextCursor! });
    expect(first.items).toHaveLength(20); expect(second.items).toHaveLength(5);
    expect(new Set([...first.items, ...second.items].map((n) => n.id)).size).toBe(25);
    expect(second.unreadCount).toBe(25); expect(second.nextCursor).toBeNull();
  });
  it("isolates users and leaves later arrivals unread after mark all", async () => {
    const [a, b] = await Promise.all([account(), account()]);
    await service.create(a.id, { type: "TEST", title: "A private message" }); await service.create(b.id, { type: "TEST", title: "B private message" });
    const head = await service.list(a.id), foreign = await service.list(b.id);
    await service.markRead(a.id, { ids: [foreign.items[0].id] });
    expect((await service.list(b.id)).unreadCount).toBe(1);
    await prisma.notification.create({ data: { userId: a.id, type: "TEST", title: "Later", createdAt: new Date(+head.asOf + 1) } });
    await service.markRead(a.id, { all: true, before: head.asOf.toISOString() });
    const remaining = await service.list(a.id, { unread: "true" });
    expect(remaining.items.map((n) => n.title)).toEqual(["Later"]);
  });
});
