import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import { EDITORIAL_JUDGE_REVISION, officialEditorialSchema, localizeEditorial, type EditorialLocale, type OfficialEditorialResponse } from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { isUnlimited } from "../billing/billing.service";

@Injectable()
export class EditorialsService {
  async detail(slug: string, user: RequestUser | null, locale: EditorialLocale = "zh-TW"): Promise<OfficialEditorialResponse> {
    const problem = await prisma.problem.findUnique({ where: { slug }, select: {
      id: true, visibility: true, judgeDataVersion: true,
    } });
    if (!problem || (!problem.visibility && !user)) throw new NotFoundException("Problem not found");
    if (!user) return { status: "AUTH_REQUIRED" };
    // Entitlements come from the live database, never the client or an old JWT.
    // Existing student grants and administrator review access follow billing policy.
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: {
      plan: true, planExpiresAt: true, isStudent: true, role: true,
    } });
    if (!problem.visibility && account?.role !== "ADMIN") throw new NotFoundException("Problem not found");
    if (!account || !isUnlimited(account)) return { status: "PRO_REQUIRED" };
    if (await prisma.contestParticipant.findFirst({ where: {
      userId: user.id, status: "RUNNING", endsAt: { gt: new Date() },
      contest: { problems: { some: { problemId: problem.id } } },
    }, select: { id: true } })) return { status: "EXAM_LOCKED" };
    // Do not even load paid content until authorization succeeds.
    const current = await prisma.problemEditorial.findFirst({ where: {
      problemId: problem.id, publishedAt: { not: null }, supersededAt: null,
    }, select: { content: true, revision: true, verifiedAt: true, publishedAt: true, verifiedProblemVersion: true, judgeRevision: true } });
    if (!current) return { status: "NOT_READY" };
    if (current.verifiedProblemVersion !== problem.judgeDataVersion || current.judgeRevision !== EDITORIAL_JUDGE_REVISION) return { status: "REVIEW_REQUIRED" };
    const parsed = officialEditorialSchema.safeParse(current.content);
    if (!parsed.success || parsed.data.slug !== slug) return { status: "REVIEW_REQUIRED" };
    const editorial = localizeEditorial(parsed.data, locale);
    if (!editorial || !parsed.data.translations?.en) return { status: "REVIEW_REQUIRED" };
    return { status: "AVAILABLE", editorial, revision: current.revision,
      verifiedAt: current.verifiedAt.toISOString(), publishedAt: current.publishedAt!.toISOString(),
      accessExpiresAt: account.isStudent || account.role === "ADMIN" ? null : account.planExpiresAt!.toISOString() };
  }
}
