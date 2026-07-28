import { NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { CreatePostDto } from "@oj/shared";

@Injectable()
export class PostsService {
  async list() {
    const rows = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { handle: true } } },
    });
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      // List view only needs an excerpt, not the full body — trims a 20KB+ analysis report down
      // to a preview instead of shipping the whole thing for a page that never renders it.
      excerpt: p.bodyMd.slice(0, 240),
      authorHandle: p.author.handle,
      isOfficial: p.isOfficial,
      createdAt: p.createdAt,
    }));
  }

  async detail(id: string) {
    const post = await prisma.post.findUnique({ where: { id }, include: { author: { select: { handle: true } } } });
    if (!post) throw new NotFoundException("Post not found");
    return {
      id: post.id,
      title: post.title,
      bodyMd: post.bodyMd,
      authorHandle: post.author.handle,
      isOfficial: post.isOfficial,
      createdAt: post.createdAt,
    };
  }

  /** Admin-authored only for now — this is a news/announcements feed, not an open forum. */
  async create(authorId: string, dto: CreatePostDto) {
    const post = await prisma.post.create({
      data: { authorId, title: dto.title, bodyMd: dto.bodyMd, isOfficial: dto.isOfficial },
    });
    return { id: post.id };
  }

  async remove(id: string) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Post not found");
    await prisma.post.delete({ where: { id } });
    return { ok: true };
  }
}
