import { NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { CreatePostDto } from "@oj/shared";

/** Strips common Markdown syntax (headings, bold, italic, code, quotes, bullets) so a plain-text
 * preview reads as prose — this is never rendered through a Markdown parser, just truncated. */
function plainExcerpt(bodyMd: string, maxLen: number): string {
  const plain = bodyMd
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    // A leading H1 almost always just repeats the post's own title (already shown separately
    // right above the excerpt), so drop that whole line rather than merely un-hashing it —
    // otherwise every excerpt starts by restating the headline it's sitting directly under.
    .replace(/^#\s+.+\n+/, "")
    .replace(/^#{1,6}\s+/gm, "") // remaining heading markers
    .replace(/^>\s?/gm, "") // blockquote markers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^[-*]\s+/gm, "") // list bullets
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, maxLen);
}

@Injectable()
export class PostsService {
  async list() {
    const rows = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { handle: true, avatarUrl: true } } },
    });
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      // List view only needs an excerpt, not the full body — trims a 20KB+ analysis report down
      // to a preview instead of shipping the whole thing for a page that never renders it. Markdown
      // syntax is stripped first so the excerpt reads as prose (this is a plain-text preview, not
      // rendered Markdown) instead of showing raw #/**/> characters from wherever the slice landed.
      excerpt: plainExcerpt(p.bodyMd, 240),
      // So the list view can show an accurate "N 分鐘閱讀" byline without shipping the full body —
      // the excerpt alone (240 chars) would make every post look like a 1-minute read.
      bodyLength: p.bodyMd.length,
      authorHandle: p.author.handle,
      authorAvatarUrl: p.author.avatarUrl,
      isOfficial: p.isOfficial,
      createdAt: p.createdAt,
    }));
  }

  async detail(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { handle: true, avatarUrl: true } } },
    });
    if (!post) throw new NotFoundException("Post not found");
    return {
      id: post.id,
      title: post.title,
      bodyMd: post.bodyMd,
      authorHandle: post.author.handle,
      authorAvatarUrl: post.author.avatarUrl,
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
