import { Injectable } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { AdminOverview } from "@oj/shared";
@Injectable()
export class AdminOverviewService {
  private cached?: { until: number; data: AdminOverview };
  async get(): Promise<AdminOverview> {
    if (this.cached && this.cached.until > Date.now()) return this.cached.data;
    const now = new Date(), since = new Date(+now - 30 * 86400000);
    const account = { role: "USER" as const, deletionRequestedAt: null };
    const [accounts, newAccounts30d, activePro, activeSubscriptions, paid, refunded, cancelledSubscriptions30d,
      pendingPosts, pendingComments, pendingSchools, pendingRefunds, problems, visibleProblems, contests, assignments, liveExams] = await Promise.all([
      prisma.user.count({ where: account }), prisma.user.count({ where: { ...account, createdAt: { gte: since } } }),
      prisma.user.count({ where: { ...account, plan: "PRO", planExpiresAt: { gt: now }, isStudent: false } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.payment.aggregate({ where: { status: "APPROVED", paidAt: { gte: since } }, _sum: { amountNtd: true } }),
      prisma.refundRequest.aggregate({ where: { status: "COMPLETED", completedAt: { gte: since } }, _sum: { amountNtd: true } }),
      prisma.subscription.count({ where: { status: "CANCELLED", cancelledAt: { gte: since } } }),
      prisma.contentRevision.count({ where: { status: "PENDING", post: { deletedAt: null } } }),
      prisma.contentRevision.count({ where: { status: "PENDING", discussion: { deletedAt: null, OR: [{ post: { deletedAt: null, publishedAt: { not: null } } }, { problem: { visibility: true } }] } } }),
      prisma.schoolDomainRequest.count({ where: { status: "PENDING" } }),
      prisma.refundRequest.count({ where: { status: { in: ["REQUESTED", "PROCESSING", "NEEDS_REVIEW"] } } }),
      prisma.problem.count(), prisma.problem.count({ where: { visibility: true } }), prisma.contest.count(), prisma.assignment.count(),
      prisma.contestParticipant.count({ where: { status: "RUNNING", endsAt: { gt: now } } }),
    ]);
    const data = { measuredAt: now.toISOString(), accounts, newAccounts30d, activePro, activeSubscriptions,
      confirmedGross30d: paid._sum.amountNtd ?? 0, refunds30d: refunded._sum.amountNtd ?? 0, cancelledSubscriptions30d,
      pendingPosts, pendingComments, pendingSchools, pendingRefunds, problems, visibleProblems, contests, assignments, liveExams };
    this.cached = { until: Date.now() + 30000, data }; return data;
  }
}
