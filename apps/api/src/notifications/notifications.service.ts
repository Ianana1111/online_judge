import { BadRequestException, Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { MarkNotificationsReadDto } from "@oj/shared";

export interface CreateNotificationInput {
  type: string;
  title: string;
  body?: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  /** Fire-and-forget from other services (achievements, assignment creation) — never throws into
   * the caller's own flow, since a failed notification shouldn't fail the thing that triggered it
   * (an AC being recorded, an assignment being created). */
  async create(userId: string, input: CreateNotificationInput): Promise<void> {
    try {
      await prisma.notification.create({ data: { userId, ...input } });
    } catch {
      /* best-effort */
    }
  }

  async createMany(userIds: string[], input: CreateNotificationInput): Promise<void> {
    if (userIds.length === 0) return;
    try {
      await prisma.notification.createMany({ data: userIds.map((userId) => ({ userId, ...input })) });
    } catch {
      /* best-effort */
    }
  }

  async list(userId: string, query: { cursor?: string; unread?: string } = {}) {
    let cursor: { createdAt: string; id: string } | undefined;
    if (query.cursor) {
      try {
        cursor = JSON.parse(Buffer.from(query.cursor, "base64url").toString());
        if (!cursor || typeof cursor.id !== "string" || typeof cursor.createdAt !== "string" || !Number.isFinite(Date.parse(cursor.createdAt))) throw new Error();
      } catch { throw new BadRequestException("Invalid notification cursor"); }
    }
    const asOf = new Date();
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId, ...(query.unread === "true" ? { readAt: null } : {}),
        ...(cursor ? { OR: [{ createdAt: { lt: new Date(cursor.createdAt) } }, { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } }] } : {}) },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 21 }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    const page = items.slice(0, 20), last = page.at(-1);
    return { items: page, unreadCount, asOf, nextCursor: items.length > 20 && last ? Buffer.from(JSON.stringify({ id: last.id, createdAt: last.createdAt })).toString("base64url") : null };
  }

  async markRead(userId: string, input: MarkNotificationsReadDto): Promise<{ ok: true }> {
    await prisma.notification.updateMany({
      where: { userId, readAt: null, ...("ids" in input ? { id: { in: input.ids } } : { createdAt: { lte: new Date(Math.min(Date.parse(input.before), Date.now())) } }) },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }
}
