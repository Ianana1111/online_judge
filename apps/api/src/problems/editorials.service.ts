import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import { EDITORIAL_JUDGE_REVISION, officialEditorialSchema, type OfficialEditorialResponse } from "@oj/shared";
import type { RequestUser } from "../common/decorators";

@Injectable()
export class EditorialsService {
  async detail(slug: string, user: RequestUser | null): Promise<OfficialEditorialResponse> {
    const problem = await prisma.problem.findUnique({ where: { slug }, select: {
      id: true, visibility: true, judgeDataVersion: true,
      editorials: { where: { publishedAt: { not: null }, supersededAt: null }, take: 1, select: {
        content: true, revision: true, verifiedAt: true, publishedAt: true, verifiedProblemVersion: true, judgeRevision: true,
      } },
    } });
    if (!problem || (!problem.visibility && user?.role !== "ADMIN")) throw new NotFoundException("Problem not found");
    if (user && await prisma.contestParticipant.findFirst({ where: {
      userId: user.id, status: "RUNNING", endsAt: { gt: new Date() },
      contest: { problems: { some: { problemId: problem.id } } },
    }, select: { id: true } })) return { status: "EXAM_LOCKED" };
    const current = problem.editorials[0];
    if (!current) return { status: "NOT_READY" };
    if (current.verifiedProblemVersion !== problem.judgeDataVersion || current.judgeRevision !== EDITORIAL_JUDGE_REVISION) return { status: "REVIEW_REQUIRED" };
    const parsed = officialEditorialSchema.safeParse(current.content);
    if (!parsed.success || parsed.data.slug !== slug) return { status: "REVIEW_REQUIRED" };
    return { status: "AVAILABLE", editorial: parsed.data, revision: current.revision,
      verifiedAt: current.verifiedAt.toISOString(), publishedAt: current.publishedAt!.toISOString() };
  }
}
