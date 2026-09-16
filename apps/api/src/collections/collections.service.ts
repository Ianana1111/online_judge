import { collectionCategory, examEssentialsIds, TOPIC_COLLECTIONS } from "./catalog";
import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { RequestUser } from "../common/decorators";
import { examAppearancesFor, isRequesterPro } from "../billing/pro-gate.util";

@Injectable()
export class CollectionsService {
  private async catalog() {
    const select = { id: true, uvaId: true, slug: true, title: true, difficulty: true, source: true,
      tags: { select: { tag: { select: { slug: true } } } } } as const;
    const [stored, publicProblems, exams] = await Promise.all([
      prisma.collection.findMany({ orderBy: { createdAt: "asc" }, include: { problems: {
        where: { problem: { visibility: true } }, orderBy: { ord: "asc" }, include: { problem: { select } },
      } } }),
      prisma.problem.findMany({ where: { visibility: true }, select, orderBy: [{ difficulty: "asc" }, { uvaId: "asc" }, { slug: "asc" }] }),
      prisma.contest.findMany({ where: { kind: "CPE", isPublic: true, OR: [{ startAt: null }, { startAt: { lte: new Date() } }] },
        select: { problems: { orderBy: { ord: "asc" }, take: 3, select: { problemId: true, ord: true, problem: { select: { visibility: true } } } } } }),
    ]);
    const collections = stored.map((c) => ({ id: c.id, slug: c.slug, title: c.title,
      description: c.slug === "gpe-history" ? "整理 GPE 歷屆考題，熟悉常見題型與考場節奏。" : c.description, category: collectionCategory(c.category), problems: c.problems.map((p) => p.problem) }));
    for (const [tag, title, description] of TOPIC_COLLECTIONS) {
      const slug = `algo-${tag}`;
      if (collections.some((c) => c.slug === slug)) continue;
      const problems = publicProblems.filter((p) => p.tags.some((t) => t.tag.slug === tag));
      if (problems.length) collections.push({ id: slug, slug, title, description, category: "主題專區", problems });
    }
    const essentials = new Set(examEssentialsIds(exams));
    const problems = publicProblems.filter((p) => essentials.has(p.id));
    if (problems.length && !collections.some((c) => c.slug === "cpe-before-exam")) {
      collections.unshift({ id: "cpe-before-exam", slug: "cpe-before-exam", title: "考前必刷",
        description: "彙整 CPE 歷屆第 1–3 題，重複題目只收錄一次。從前段題建立手感，逐步鞏固考場得分能力；各題保留原始星等。", category: "考試專區", problems });
    }
    return collections;
  }

  async list() {
    return (await this.catalog()).map(({ problems, ...c }) => ({ ...c, problemCount: problems.length,
      tags: [...new Set(problems.flatMap((p) => p.tags.map((t) => t.tag.slug)))],
      difficultyMin: problems.length ? Math.min(...problems.map((p) => p.difficulty)) : null,
      difficultyMax: problems.length ? Math.max(...problems.map((p) => p.difficulty)) : null,
    }));
  }

  async detail(slug: string, requester: RequestUser | null) {
    const collection = (await this.catalog()).find((c) => c.slug === slug);
    if (!collection) throw new NotFoundException("Collection not found");

    let solvedSet = new Set<string>();
    if (requester) {
      const solved = await prisma.submission.findMany({
        where: {
          userId: requester.id,
          verdict: "AC",
          problemId: { in: collection.problems.map((p) => p.id) },
        },
        select: { problemId: true },
        distinct: ["problemId"],
      });
      solvedSet = new Set(solved.map((s) => s.problemId));
    }

    // Same Pro-gated "appeared in N past CPE/GPE sittings" perk as the main problem list (see
    // problems.service.list) — collection pages use the same ProblemFilterTable and must agree,
    // or a collection's appearances column/toggle would silently show nothing for every Pro user.
    const isPro = requester ? await isRequesterPro(requester) : false;
    const collectionProblemIds = collection.problems.map((p) => p.id);
    const [cpeAppearancesById, gpeAppearancesById] = isPro
      ? await Promise.all([examAppearancesFor(collectionProblemIds, "CPE"), examAppearancesFor(collectionProblemIds, "GPE")])
      : [new Map<string, number>(), new Map<string, number>()];

    return {
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      description: collection.description,
      category: collection.category,
      problems: collection.problems.map((cp) => ({
        id: cp.id,
        uvaId: cp.uvaId,
        slug: cp.slug,
        title: cp.title,
        difficulty: cp.difficulty,
        source: cp.source,
        tags: cp.tags.map((t) => t.tag.slug),
        solvedByMe: solvedSet.has(cp.id),
        cpeAppearances: isPro ? (cpeAppearancesById.get(cp.id) ?? 0) : null,
        gpeAppearances: isPro ? (gpeAppearancesById.get(cp.id) ?? 0) : null,
      })),
    };
  }
}
