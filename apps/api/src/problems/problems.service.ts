import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateProblemDto } from "@oj/shared";
import { prisma } from "@oj/db";
import type { RequestUser } from "../common/decorators";
import { cpeAppearancesFor, isRequesterPro } from "../billing/pro-gate.util";

const PAGE_SIZE = 20;

export interface ListQuery {
  tag?: string;
  difficulty?: string;
  q?: string;
  page?: string;
  pageSize?: string;
}

interface HistogramBucket {
  minValue: number;
  maxValue: number;
  count: number;
  languageCounts: Record<string, number>;
}

/** Equal-width histogram over one best-submission value per user (runtime ms or memory KB), capped
 * at 10 buckets (or fewer distinct values) so a problem with only a handful of solvers doesn't get
 * a mostly-empty 10-bar chart. Returns which bucket each userId landed in alongside the buckets
 * themselves, so the caller can mark "you are here" without a second pass over the same data. Only
 * aggregate counts (and a per-bucket language breakdown) are ever returned — never which specific
 * user or submission a bucket's count came from, so this can't be used to single out one person's
 * code by process of elimination. */
function buildHistogram(
  points: { userId: string; value: number; languageKey: string }[],
): { buckets: HistogramBucket[]; bucketIndexByUserId: Map<string, number> } {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const bucketCount = Math.max(1, Math.min(10, new Set(values).size));
  const width = max > min ? (max - min) / bucketCount : 1;

  const buckets: HistogramBucket[] = Array.from({ length: bucketCount }, (_, i) => ({
    minValue: min + i * width,
    maxValue: i === bucketCount - 1 ? max : min + (i + 1) * width,
    count: 0,
    languageCounts: {},
  }));

  const bucketIndexByUserId = new Map<string, number>();
  for (const p of points) {
    let idx = width > 0 ? Math.floor((p.value - min) / width) : 0;
    if (idx >= bucketCount) idx = bucketCount - 1; // the max value falls exactly on the top edge
    buckets[idx].count += 1;
    buckets[idx].languageCounts[p.languageKey] = (buckets[idx].languageCounts[p.languageKey] ?? 0) + 1;
    bucketIndexByUserId.set(p.userId, idx);
  }
  return { buckets, bucketIndexByUserId };
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

    // "Appeared in N past CPE sittings" is a Pro perk (see billing.service isProActive) — never
    // computed-and-hidden client-side only, since that would let anyone read it straight off the
    // network response. Cheap either way: at most ~350 problems total, one groupBy for the page.
    const isPro = requester ? await isRequesterPro(requester) : false;
    const appearancesById = isPro ? await cpeAppearancesFor(rows.map((r) => r.id)) : new Map<string, number>();

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
        cpeAppearances: isPro ? (appearancesById.get(p.id) ?? 0) : null,
      })),
      total,
      page,
    };
  }

  /**
   * Deterministic "what to solve next" heuristic — no ML, just: figure out the user's current
   * difficulty tier (the highest tier they've solved at least 3 problems in, so a single lucky
   * ★★★★ solve doesn't immediately bump them), then suggest a few more unsolved problems at that
   * tier to consolidate plus one at the next tier up as a stretch goal. If their most recently
   * solved problem belongs to a curated Collection, also surface the next unsolved problem in that
   * same collection so working through a set (e.g. "CPE 必考49題") doesn't require manually
   * tracking where you left off.
   */
  async recommendNext(userId: string) {
    const acSubs = await prisma.submission.findMany({
      where: { userId, verdict: "AC" },
      select: { problemId: true, createdAt: true, problem: { select: { difficulty: true } } },
      orderBy: { createdAt: "desc" },
    });

    const solvedIds = new Set<string>();
    const countByDifficulty = new Map<number, number>();
    let mostRecentProblemId: string | null = null;
    for (const s of acSubs) {
      if (solvedIds.has(s.problemId)) continue;
      solvedIds.add(s.problemId);
      countByDifficulty.set(s.problem.difficulty, (countByDifficulty.get(s.problem.difficulty) ?? 0) + 1);
      mostRecentProblemId ??= s.problemId; // first-seen is most recent (createdAt desc, deduped)
    }

    let tier = 1;
    for (let d = 4; d >= 1; d--) {
      if ((countByDifficulty.get(d) ?? 0) >= 3) {
        tier = d;
        break;
      }
    }

    const solvedIdList = [...solvedIds];
    const recommendedSelect = { id: true, uvaId: true, slug: true, title: true, difficulty: true } as const;

    const [consolidate, stretch, collectionNext] = await Promise.all([
      prisma.problem.findMany({
        where: { visibility: true, difficulty: tier, id: { notIn: solvedIdList } },
        select: recommendedSelect,
        orderBy: { uvaId: { sort: "asc", nulls: "last" } },
        take: 3,
      }),
      tier < 4
        ? prisma.problem.findMany({
            where: { visibility: true, difficulty: tier + 1, id: { notIn: solvedIdList } },
            select: recommendedSelect,
            orderBy: { uvaId: { sort: "asc", nulls: "last" } },
            take: 1,
          })
        : Promise.resolve([]),
      this.nextInCollection(mostRecentProblemId, solvedIdList),
    ]);

    return { tier, consolidate, stretch: stretch[0] ?? null, collectionNext };
  }

  private async nextInCollection(mostRecentProblemId: string | null, solvedIdList: string[]) {
    if (!mostRecentProblemId) return null;

    const membership = await prisma.collectionProblem.findFirst({
      where: { problemId: mostRecentProblemId },
      select: { collectionId: true, ord: true, collection: { select: { title: true, slug: true } } },
    });
    if (!membership) return null;

    const next = await prisma.collectionProblem.findFirst({
      where: {
        collectionId: membership.collectionId,
        ord: { gt: membership.ord },
        problemId: { notIn: solvedIdList },
      },
      orderBy: { ord: "asc" },
      select: { problem: { select: { id: true, uvaId: true, slug: true, title: true, difficulty: true } } },
    });
    if (!next) return null;

    return { ...next.problem, collectionTitle: membership.collection.title, collectionSlug: membership.collection.slug };
  }

  /**
   * Today's featured problem — the same one for everyone, all day, so it works as a shared "did
   * you do today's?" reference point rather than a private recommendation. Picked deterministically
   * from today's UTC date (no state to store or a cron to rotate it): hash the date string, index
   * into the full visible problem set ordered by id for a stable, arbitrary-but-fixed sequence.
   * Every visible problem is eligible — there's no difficulty floor — so some days it's a ★ and
   * some days a ★★★★, the same variety a real exam would throw at you.
   */
  async dailyPick(requester: RequestUser | null) {
    const problems = await prisma.problem.findMany({
      where: { visibility: true },
      select: { id: true, uvaId: true, slug: true, title: true, difficulty: true, source: true, tags: { select: { tag: { select: { slug: true } } } } },
      orderBy: { id: "asc" },
    });
    if (problems.length === 0) return null;

    const todayKey = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < todayKey.length; i++) hash = (hash * 31 + todayKey.charCodeAt(i)) >>> 0;
    const picked = problems[hash % problems.length];

    let solvedByMe = false;
    if (requester) {
      const ac = await prisma.submission.findFirst({ where: { userId: requester.id, problemId: picked.id, verdict: "AC" } });
      solvedByMe = !!ac;
    }

    return {
      id: picked.id,
      uvaId: picked.uvaId,
      slug: picked.slug,
      title: picked.title,
      difficulty: picked.difficulty,
      source: picked.source,
      tags: picked.tags.map((t) => t.tag.slug),
      solvedByMe,
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
    const isPro = requester ? await isRequesterPro(requester) : false;
    const cpeAppearances = isPro ? (await cpeAppearancesFor([problem.id])).get(problem.id) ?? 0 : null;
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
      // Pro-only "appeared in N past CPE sittings" — null (not 0) for non-Pro so the frontend can
      // tell "not Pro" apart from "genuinely never appeared".
      cpeAppearances,
      tags: problem.tags.map((t) => t.tag.slug),
      samples: problem.samples.map((s) => ({ ord: s.ord, input: s.input, output: s.output })),
    };
  }

  /** Community runtime stats for this problem, LeetCode-style. Memory histogram only appears when
   * at least one AC submission actually has a memoryKb reading — onlinejudge.org's own status page
   * doesn't publish memory (that column is literally commented out in their markup), so every
   * submission judged through the remote adapter has memoryKb=null; only locally-judged problems
   * ever have real memory data to chart. */
  async stats(slug: string, requester: RequestUser | null) {
    const problem = await prisma.problem.findUnique({ where: { slug }, select: { id: true } });
    if (!problem) throw new NotFoundException("Problem not found");

    const acSubs = await prisma.submission.findMany({
      where: { problemId: problem.id, verdict: "AC", timeMs: { not: null } },
      select: { userId: true, timeMs: true, memoryKb: true, languageKey: true },
    });

    const bestByUser = new Map<string, { timeMs: number; memoryKb: number | null; languageKey: string }>();
    for (const s of acSubs) {
      const prev = bestByUser.get(s.userId);
      if (!prev || s.timeMs! < prev.timeMs) {
        bestByUser.set(s.userId, { timeMs: s.timeMs!, memoryKb: s.memoryKb, languageKey: s.languageKey });
      }
    }
    const entries = [...bestByUser.entries()];
    const times = entries.map(([, v]) => v.timeMs).sort((a, b) => a - b);

    const percentileOf = (t: number) => {
      if (times.length === 0) return null;
      const slower = times.filter((x) => x >= t).length;
      return Math.round((slower / times.length) * 100);
    };

    let yourBest: { timeMs: number; beatsPct: number | null } | null = null;
    if (requester) {
      const mine = bestByUser.get(requester.id);
      if (mine !== undefined) yourBest = { timeMs: mine.timeMs, beatsPct: percentileOf(mine.timeMs) };
    }

    const timePoints = entries.map(([userId, v]) => ({ userId, value: v.timeMs, languageKey: v.languageKey }));
    const timeHist = buildHistogram(timePoints);

    const memPoints = entries
      .filter(([, v]) => v.memoryKb !== null)
      .map(([userId, v]) => ({ userId, value: v.memoryKb!, languageKey: v.languageKey }));
    const memHist = memPoints.length > 0 ? buildHistogram(memPoints) : null;

    return {
      solvedCount: times.length,
      time:
        times.length > 0
          ? { minMs: times[0], medianMs: times[Math.floor(times.length / 2)], maxMs: times[times.length - 1] }
          : null,
      memoryAvailable: memHist !== null,
      yourBest,
      timeHistogram: timeHist.buckets.map((b) => ({ minMs: b.minValue, maxMs: b.maxValue, count: b.count, languageCounts: b.languageCounts })),
      memoryHistogram: memHist
        ? memHist.buckets.map((b) => ({ minKb: b.minValue, maxKb: b.maxValue, count: b.count, languageCounts: b.languageCounts }))
        : null,
      yourTimeBucketIndex: requester ? (timeHist.bucketIndexByUserId.get(requester.id) ?? null) : null,
      yourMemoryBucketIndex: requester && memHist ? (memHist.bucketIndexByUserId.get(requester.id) ?? null) : null,
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
