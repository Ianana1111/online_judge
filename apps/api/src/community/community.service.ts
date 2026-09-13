import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type Prisma } from "@oj/db";
import type { CommunityListDto, CreateDiscussionDto, CreatePostDto, ReviewContentDto } from "@oj/shared";
import type { RequestUser } from "../common/decorators";

type Tx = Prisma.TransactionClient;
type Parent = { problemId: string; postId?: never } | { postId: string; problemId?: never };
const authorSelect = { handle: true, avatarUrl: true } as const;
const live = { publishedAt: { not: null }, deletedAt: null } as const;
const newest = [{ createdAt: "desc" }, { id: "desc" }] as const;
function afterCursor(cursor?: string) {
  if (!cursor) return {};
  try {
    const p = JSON.parse(Buffer.from(cursor, "base64url").toString());
    if (typeof p.id !== "string" || p.id.length > 100 || typeof p.createdAt !== "string" || !Number.isFinite(Date.parse(p.createdAt))) throw new Error();
    return { OR: [{ createdAt: { lt: new Date(p.createdAt) } }, { createdAt: new Date(p.createdAt), id: { lt: p.id } }] };
  } catch { throw new BadRequestException("Invalid page cursor"); }
}
function page<T extends { id: string; createdAt: Date }>(rows: T[], size = 20) {
  const items = rows.slice(0, size), last = items.at(-1);
  return { items, nextCursor: rows.length > size && last ? Buffer.from(JSON.stringify({ id: last.id, createdAt: last.createdAt })).toString("base64url") : null };
}
function excerpt(body: string) {
  return body.replace(/```[\s\S]*?```/g, " ").replace(/^#\s+.+\n+/, "").replace(/^#{1,6}\s+|^>\s?|^[-*]\s+/gm, "").replace(/[*`]/g, "").replace(/\s+/g, " ").trim().slice(0, 240);
}
async function lock(tx: Tx, id: string) { await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('community'), hashtext(${id}))`; }
function officialPermission(user: RequestUser, dto: CreatePostDto) {
  if ((dto.isOfficial || dto.category === "ANNOUNCEMENT") && user.role !== "ADMIN") throw new ForbiddenException("Only administrators can publish official announcements");
}
async function parentExists(tx: Tx, parent: Parent) {
  if (parent.postId) {
    if (!await tx.post.findFirst({ where: { id: parent.postId, ...live } })) throw new NotFoundException("Post not found");
  } else if (!await tx.problem.findFirst({ where: { id: parent.problemId, visibility: true } })) throw new NotFoundException("Problem not found");
}

@Injectable()
export class CommunityService {
  async postSitemap(cursor?: string) {
    return page(await prisma.post.findMany({ where: { ...live, ...afterCursor(cursor) },
      select: { id: true, createdAt: true, updatedAt: true }, orderBy: [...newest], take: 1001 }), 1000);
  }
  async listPosts(query: CommunityListDto = {}) {
    const result = page(await prisma.post.findMany({ where: { ...live, ...afterCursor(query.cursor),
      ...(query.category ? { category: query.category } : {}),
      ...(query.q ? { AND: [{ OR: [{ title: { contains: query.q, mode: "insensitive" } }, { bodyMd: { contains: query.q, mode: "insensitive" } }] }] } : {}) },
      include: { author: { select: authorSelect }, _count: { select: { comments: { where: live } } } }, orderBy: [...newest], take: 21 }));
    return { ...result, items: result.items.map((p) => ({ id: p.id, title: p.title, excerpt: excerpt(p.bodyMd), bodyLength: p.bodyMd.length,
      category: p.category, authorId: p.authorId, authorHandle: p.author.handle, authorAvatarUrl: p.author.avatarUrl, isOfficial: p.isOfficial,
      commentCount: p._count.comments, createdAt: p.createdAt, publishedAt: p.publishedAt })) };
  }
  async postDetail(id: string) {
    const p = await prisma.post.findFirst({ where: { id, ...live }, include: { author: { select: authorSelect } } });
    if (!p) throw new NotFoundException("Post not found");
    return { id: p.id, title: p.title, bodyMd: p.bodyMd, category: p.category, authorId: p.authorId, authorHandle: p.author.handle,
      authorAvatarUrl: p.author.avatarUrl, isOfficial: p.isOfficial, createdAt: p.createdAt, publishedAt: p.publishedAt, updatedAt: p.updatedAt };
  }
  async ownPost(id: string, user: RequestUser) {
    const p = await prisma.post.findFirst({ where: { id, authorId: user.id, deletedAt: null }, include: { revisions: { orderBy: [...newest], take: 1 } } });
    if (!p) throw new NotFoundException("Post not found");
    const r = p.revisions[0];
    return { id: p.id, title: r?.title ?? p.title, bodyMd: r?.body ?? p.bodyMd, category: r?.category ?? p.category,
      isOfficial: r?.isOfficial ?? p.isOfficial, status: r?.status ?? "APPROVED", reason: r?.reason ?? null, publishedAt: p.publishedAt };
  }
  async ownPosts(userId: string, cursor?: string) {
    const result = page(await prisma.post.findMany({ where: { authorId: userId, deletedAt: null, ...afterCursor(cursor) },
      include: { revisions: { orderBy: [...newest], take: 1, select: { title: true, status: true, reason: true } } }, orderBy: [...newest], take: 21 }));
    return { ...result, items: result.items.map((p) => ({ id: p.id, title: p.revisions[0]?.title ?? p.title, status: p.revisions[0]?.status ?? "APPROVED",
      reason: p.revisions[0]?.reason ?? null, publishedAt: p.publishedAt, createdAt: p.createdAt })) };
  }
  async submitPost(user: RequestUser, dto: CreatePostDto, id?: string) {
    officialPermission(user, dto);
    return prisma.$transaction(async (tx) => {
      if (id) await lock(tx, id);
      const p = id ? await tx.post.findFirst({ where: { id, authorId: user.id, deletedAt: null } })
        : await tx.post.create({ data: { authorId: user.id, title: "", bodyMd: "" } });
      if (!p) throw new NotFoundException("Post not found");
      await tx.contentRevision.updateMany({ where: { postId: p.id, status: "PENDING" }, data: { status: "SUPERSEDED" } });
      const revision = await tx.contentRevision.create({ data: { postId: p.id, submittedById: user.id, title: dto.title,
        body: dto.bodyMd, category: dto.category, isOfficial: dto.isOfficial } });
      return { id: p.id, revisionId: revision.id, status: revision.status };
    });
  }
  async listComments(parent: Parent, cursor?: string, ownUserId?: string) {
    await parentExists(prisma, parent);
    const result = page(await prisma.discussion.findMany({ where: { ...parent, deletedAt: null, ...afterCursor(cursor),
      ...(ownUserId ? { userId: ownUserId } : { publishedAt: { not: null } }) }, include: { user: { select: { handle: true, role: true } },
      ...(ownUserId ? { revisions: { orderBy: [...newest], take: 1 } } : {}) }, orderBy: [...newest], take: 21 }));
    return { ...result, items: result.items.map((d) => {
      const r = ownUserId ? d.revisions?.[0] : undefined;
      return { id: d.id, body: r?.body ?? d.body, userId: d.userId, userHandle: d.user.handle, userRole: d.user.role,
        createdAt: d.createdAt, publishedAt: d.publishedAt, ...(ownUserId ? { status: r?.status ?? "APPROVED", reason: r?.reason ?? null } : {}) };
    }) };
  }
  async submitComment(parent: Parent, user: RequestUser, dto: CreateDiscussionDto) {
    return prisma.$transaction(async (tx) => {
      await parentExists(tx, parent);
      const d = await tx.discussion.create({ data: { ...parent, userId: user.id, body: "" } });
      const revision = await tx.contentRevision.create({ data: { discussionId: d.id, submittedById: user.id, body: dto.body } });
      return { id: d.id, revisionId: revision.id, status: revision.status };
    });
  }
  async editComment(id: string, user: RequestUser, dto: CreateDiscussionDto) {
    return prisma.$transaction(async (tx) => {
      await lock(tx, id);
      const d = await tx.discussion.findFirst({ where: { id, userId: user.id, deletedAt: null } });
      if (!d) throw new NotFoundException("Comment not found");
      await parentExists(tx, d.postId ? { postId: d.postId } : { problemId: d.problemId! });
      await tx.contentRevision.updateMany({ where: { discussionId: id, status: "PENDING" }, data: { status: "SUPERSEDED" } });
      const revision = await tx.contentRevision.create({ data: { discussionId: id, submittedById: user.id, body: dto.body } });
      return { id, revisionId: revision.id, status: revision.status };
    });
  }
  async remove(kind: "post" | "comment", id: string, user: RequestUser) {
    return prisma.$transaction(async (tx) => {
      await lock(tx, id);
      if (kind === "post") {
        const p = await tx.post.findFirst({ where: { id, deletedAt: null } });
        if (!p || (p.authorId !== user.id && user.role !== "ADMIN")) throw new NotFoundException("Post not found");
        await tx.post.update({ where: { id }, data: { deletedAt: new Date() } });
      } else {
        const d = await tx.discussion.findFirst({ where: { id, deletedAt: null } });
        if (!d || (d.userId !== user.id && user.role !== "ADMIN")) throw new NotFoundException("Comment not found");
        await tx.discussion.update({ where: { id }, data: { deletedAt: new Date() } });
      }
      await tx.contentRevision.updateMany({ where: { ...(kind === "post" ? { postId: id } : { discussionId: id }), status: "PENDING" }, data: { status: "SUPERSEDED" } });
      return { ok: true };
    });
  }
  async reviewQueue(cursor?: string, state: "pending" | "reviewed" = "pending") {
    return page(await prisma.contentRevision.findMany({ where: { status: state === "pending" ? "PENDING" : { in: ["APPROVED", "REJECTED"] }, OR: [
      { post: { deletedAt: null } }, { discussion: { deletedAt: null, OR: [{ post: live }, { problem: { visibility: true } }] } },
    ], AND: [afterCursor(cursor)] }, include: {
      post: { select: { title: true, bodyMd: true, publishedAt: true, author: { select: authorSelect } } },
      discussion: { select: { body: true, postId: true, problem: { select: { title: true, slug: true } }, user: { select: authorSelect } } },
    }, orderBy: [...newest], take: 21 }));
  }
  async review(id: string, user: RequestUser, dto: ReviewContentDto) {
    if (user.role !== "ADMIN") throw new ForbiddenException("Administrator review required");
    return prisma.$transaction(async (tx) => {
      const initial = await tx.contentRevision.findUnique({ where: { id } });
      if (!initial) throw new NotFoundException("Revision not found");
      await lock(tx, initial.postId ?? initial.discussionId!);
      const r = await tx.contentRevision.findUniqueOrThrow({ where: { id } });
      if (r.status !== "PENDING") throw new ConflictException("This revision has already been reviewed or replaced. Refresh the queue.");
      const now = new Date(); let link: string;
      if (r.postId) {
        const p = await tx.post.findFirst({ where: { id: r.postId, deletedAt: null } });
        if (!p) throw new ConflictException("This post was deleted");
        if (dto.decision === "APPROVED") await tx.post.update({ where: { id: p.id }, data: { title: r.title!, bodyMd: r.body,
          category: r.category!, isOfficial: r.isOfficial, publishedAt: p.publishedAt ?? now } });
        link = dto.decision === "APPROVED" ? `/discussion/${p.id}` : `/discussion/write?id=${p.id}`;
      } else {
        const d = await tx.discussion.findFirst({ where: { id: r.discussionId!, deletedAt: null }, include: { problem: { select: { slug: true } } } });
        if (!d) throw new ConflictException("This comment was deleted");
        await parentExists(tx, d.postId ? { postId: d.postId } : { problemId: d.problemId! });
        if (dto.decision === "APPROVED") await tx.discussion.update({ where: { id: d.id }, data: { body: r.body, publishedAt: d.publishedAt ?? now } });
        link = d.postId ? `/discussion/${d.postId}` : `/problems/${d.problem!.slug}`;
      }
      await tx.contentRevision.update({ where: { id }, data: { status: dto.decision, reviewedAt: now, reviewedById: user.id, reason: dto.reason ?? null } });
      // Decision and notification commit together, so a retry cannot publish twice or lose the notice.
      await tx.notification.create({ data: { userId: r.submittedById, type: "CONTENT_REVIEW",
        title: dto.decision === "APPROVED" ? "你的內容已通過審核" : "你的內容需要修改", body: dto.reason ?? "內容已公開，感謝你的分享。", link } });
      return { id, status: dto.decision };
    });
  }
}
