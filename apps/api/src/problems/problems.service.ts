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
  pageSize?: string;
}

/**
 * UVa's own submission form needs its internal problem id ("pid" in uHunt's API), which is
 * unrelated to the public problem number (uvaId) everyone knows the problem by except by
 * coincidence — e.g. public number 100 has internal pid 36, while UVa's internal id "100" is a
 * completely different problem. Submitting with uvaId instead of uvaPid silently judges against
 * the wrong problem's test data. Returns null (rather than throwing) on any lookup failure so a
 * transient uHunt outage doesn't block creating/editing a problem — judgeViaUva refuses to submit
 * without a uvaPid rather than guess, so the worst case is "not remotely judgeable yet", not a
 * wrong-problem verdict.
 */
async function resolveUvaPid(uvaId: number): Promise<number | null> {
  try {
    const res = await fetch(`https://uhunt.onlinejudge.org/api/p/num/${uvaId}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { pid?: number };
    return typeof data.pid === "number" ? data.pid : null;
  } catch {
    return null;
  }
}

// Upper bound on a single page. The problems/collections UIs fetch the whole set (~350) and do
// their own client-side filtering/sorting, so they pass a large pageSize; keep a cap so an
// arbitrary client can't ask for an unbounded result set.
const MAX_PAGE_SIZE = 1000;

@Injectable()
export class ProblemsService {
  async list(query: ListQuery, requester: RequestUser | null) {
    const isAdmin = requester?.role === "ADMIN";
    const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
    const pageSize = query.pageSize
      ? Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(query.pageSize, 10) || PAGE_SIZE))
      : PAGE_SIZE;

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
        skip: (page - 1) * pageSize,
        take: pageSize,
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
        uvaId: p.uvaId,
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
      // null for reference-only problems with no matching UVa judge (some archived GPE problems)
      // — the frontend uses this to disable submission instead of letting it burn quota for a
      // guaranteed system-error verdict.
      uvaId: problem.uvaId,
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
    const uvaPid = dto.uvaId != null ? await resolveUvaPid(dto.uvaId) : null;
    const problem = await prisma.problem.create({
      data: {
        uvaId: dto.uvaId,
        uvaPid,
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
    // Re-resolve uvaPid whenever uvaId actually changes — a stale uvaPid left over from the
    // problem's old uvaId would silently judge against the wrong problem (see resolveUvaPid).
    const data: typeof rest & { uvaPid?: number | null } = { ...rest };
    if ("uvaId" in dto && dto.uvaId !== existing.uvaId) {
      data.uvaPid = dto.uvaId != null ? await resolveUvaPid(dto.uvaId) : null;
    }
    const problem = await prisma.problem.update({ where: { id }, data });
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
