import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateProblemDto } from "@oj/shared";
import { prisma } from "@oj/db";
import type { RequestUser } from "../common/decorators";

const PAGE_SIZE = 20;

export interface ListQuery {
  tag?: string;
  difficulty?: string;
  q?: string;
  page?: string;
}

@Injectable()
export class ProblemsService {
  async list(query: ListQuery, requester: RequestUser | null) {
    const isAdmin = requester?.role === "ADMIN";
    const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);

    const where: Record<string, unknown> = {};
    if (!isAdmin) where.visibility = true;
    if (query.tag) where.tags = { some: { tag: { slug: query.tag } } };
    if (query.difficulty) where.difficulty = parseInt(query.difficulty, 10);
    if (query.q) where.title = { contains: query.q, mode: "insensitive" };

    const [rows, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        include: { tags: { include: { tag: true } } },
        orderBy: [{ uvaId: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.problem.count({ where }),
    ]);

    let solvedSet = new Set<string>();
    if (requester) {
      const solved = await prisma.submission.findMany({
        where: { userId: requester.id, verdict: "AC", problemId: { in: rows.map((r) => r.id) } },
        select: { problemId: true },
        distinct: ["problemId"],
      });
      solvedSet = new Set(solved.map((s) => s.problemId));
    }

    return {
      items: rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        source: p.source,
        tags: p.tags.map((t) => t.tag.slug),
        solvedByMe: solvedSet.has(p.id),
      })),
      total,
      page,
    };
  }

  async detail(slug: string, requester: RequestUser | null) {
    const isAdmin = requester?.role === "ADMIN";
    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        tags: { include: { tag: true } },
        samples: { orderBy: { ord: "asc" } },
      },
    });
    if (!problem || (!problem.visibility && !isAdmin)) {
      throw new NotFoundException("Problem not found");
    }
    return {
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      statementMd: problem.statementMd,
      sourceUrl: problem.sourceUrl,
      inputSpecMd: problem.inputSpecMd,
      outputSpecMd: problem.outputSpecMd,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      difficulty: problem.difficulty,
      source: problem.source,
      tags: problem.tags.map((t) => t.tag.slug),
      samples: problem.samples.map((s) => ({ ord: s.ord, input: s.input, output: s.output })),
    };
  }

  /** Community runtime stats for this problem, LeetCode-style. Memory is never available -
   * onlinejudge.org's own status page doesn't publish it (that column is literally commented out
   * in their markup), so every submission judged through the remote adapter has memoryKb=null. */
  async stats(slug: string, requester: RequestUser | null) {
    const problem = await prisma.problem.findUnique({ where: { slug }, select: { id: true } });
    if (!problem) throw new NotFoundException("Problem not found");

    const acSubs = await prisma.submission.findMany({
      where: { problemId: problem.id, verdict: "AC", timeMs: { not: null } },
      select: { userId: true, timeMs: true },
    });

    const bestByUser = new Map<string, number>();
    for (const s of acSubs) {
      const t = s.timeMs!;
      const prev = bestByUser.get(s.userId);
      if (prev === undefined || t < prev) bestByUser.set(s.userId, t);
    }
    const times = [...bestByUser.values()].sort((a, b) => a - b);

    const percentileOf = (t: number) => {
      if (times.length === 0) return null;
      const slower = times.filter((x) => x >= t).length;
      return Math.round((slower / times.length) * 100);
    };

    let yourBest: { timeMs: number; beatsPct: number | null } | null = null;
    if (requester) {
      const mine = bestByUser.get(requester.id);
      if (mine !== undefined) yourBest = { timeMs: mine, beatsPct: percentileOf(mine) };
    }

    return {
      solvedCount: times.length,
      time:
        times.length > 0
          ? { minMs: times[0], medianMs: times[Math.floor(times.length / 2)], maxMs: times[times.length - 1] }
          : null,
      memoryAvailable: false,
      yourBest,
    };
  }

  /** Private per-user notes — never shown to anyone else, including admins. */
  async getNote(slug: string, userId: string): Promise<{ content: string; updatedAt: Date | null }> {
    const problem = await prisma.problem.findUnique({ where: { slug }, select: { id: true } });
    if (!problem) throw new NotFoundException("Problem not found");
    const note = await prisma.note.findUnique({ where: { userId_problemId: { userId, problemId: problem.id } } });
    return { content: note?.content ?? "", updatedAt: note?.updatedAt ?? null };
  }

  async saveNote(slug: string, userId: string, content: string): Promise<{ content: string; updatedAt: Date }> {
    const problem = await prisma.problem.findUnique({ where: { slug }, select: { id: true } });
    if (!problem) throw new NotFoundException("Problem not found");
    const note = await prisma.note.upsert({
      where: { userId_problemId: { userId, problemId: problem.id } },
      update: { content },
      create: { userId, problemId: problem.id, content },
    });
    return { content: note.content, updatedAt: note.updatedAt };
  }

  async create(dto: CreateProblemDto) {
    const problem = await prisma.problem.create({
      data: {
        uvaId: dto.uvaId,
        slug: dto.slug,
        title: dto.title,
        statementMd: dto.statementMd,
        inputSpecMd: dto.inputSpecMd,
        outputSpecMd: dto.outputSpecMd,
        timeLimitMs: dto.timeLimitMs,
        memoryLimitKb: dto.memoryLimitKb,
        difficulty: dto.difficulty,
        source: dto.source,
        checkerType: dto.checkerType,
        floatEps: dto.floatEps,
      },
    });
    if (dto.tagSlugs.length > 0) {
      await this.setTags(problem.id, dto.tagSlugs);
    }
    return problem;
  }

  async update(id: string, dto: Partial<CreateProblemDto>) {
    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Problem not found");

    const { tagSlugs, ...rest } = dto;
    const problem = await prisma.problem.update({ where: { id }, data: rest });
    if (tagSlugs) {
      await this.setTags(id, tagSlugs);
    }
    return problem;
  }

  async remove(id: string) {
    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Problem not found");
    await prisma.problem.delete({ where: { id } });
    return { ok: true };
  }

  async addSample(problemId: string, body: { ord?: number; input: string; output: string }) {
    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) throw new NotFoundException("Problem not found");

    let ord = body.ord;
    if (ord === undefined) {
      const count = await prisma.sample.count({ where: { problemId } });
      ord = count + 1;
    }

    return prisma.sample.create({
      data: { problemId, ord, input: body.input, output: body.output },
    });
  }

  private async setTags(problemId: string, tagSlugs: string[]) {
    await prisma.problemTag.deleteMany({ where: { problemId } });
    for (const slug of tagSlugs) {
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { slug, name: slug[0]?.toUpperCase() + slug.slice(1) },
      });
      await prisma.problemTag.create({ data: { problemId, tagId: tag.id } });
    }
  }
}
