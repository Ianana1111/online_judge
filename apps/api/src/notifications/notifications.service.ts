import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";

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

  async list(userId: string) {
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, unreadCount };
  }

  async markRead(userId: string, ids?: string[]): Promise<{ ok: true }> {
    await prisma.notification.updateMany({
      where: { userId, readAt: null, ...(ids && ids.length > 0 ? { id: { in: ids } } : {}) },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }
}
