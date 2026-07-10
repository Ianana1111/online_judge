import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { RequestUser } from "../common/decorators";

@Injectable()
export class CollectionsService {
  async list() {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { problems: true } } },
    });
    return collections.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      problemCount: c._count.problems,
    }));
  }

  async detail(slug: string, requester: RequestUser | null) {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        problems: {
          orderBy: { ord: "asc" },
          include: { problem: { select: { id: true, slug: true, title: true, difficulty: true, source: true } } },
        },
      },
    });
    if (!collection) throw new NotFoundException("Collection not found");

    let solvedSet = new Set<string>();
    if (requester) {
      const solved = await prisma.submission.findMany({
        where: {
          userId: requester.id,
          verdict: "AC",
          problemId: { in: collection.problems.map((p) => p.problemId) },
        },
        select: { problemId: true },
        distinct: ["problemId"],
      });
      solvedSet = new Set(solved.map((s) => s.problemId));
    }

    return {
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      description: collection.description,
      problems: collection.problems.map((cp) => ({
        id: cp.problem.id,
        slug: cp.problem.slug,
        title: cp.problem.title,
        difficulty: cp.problem.difficulty,
        source: cp.problem.source,
        solvedByMe: solvedSet.has(cp.problem.id),
      })),
    };
  }
}
