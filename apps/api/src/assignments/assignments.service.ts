import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { CreateAssignmentDto } from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class AssignmentsService {
  constructor(private readonly notifications: NotificationsService) {}

  async createByAdmin(dto: CreateAssignmentDto, createdById: string) {
    let assigneeUserIds = dto.assigneeUserIds;
    if (dto.assignToAll) {
      const allUsers = await prisma.user.findMany({ where: { role: "USER" }, select: { id: true } });
      assigneeUserIds = allUsers.map((u) => u.id);
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        createdById,
        problems: { create: dto.problemIds.map((problemId, ord) => ({ problemId, ord })) },
        assignees: { create: assigneeUserIds.map((userId) => ({ userId })) },
      },
      include: { problems: true, assignees: true },
    });

    await this.notifications.createMany(assigneeUserIds, {
      type: "assignment",
      title: `New assignment: ${dto.title}`,
      body: dto.description || undefined,
      link: "/assignments",
    });

    return assignment;
  }

  async listAllForAdmin() {
    const rows = await prisma.assignment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { problems: true, assignees: true } },
        problems: { orderBy: { ord: "asc" }, include: { problem: { select: { title: true, slug: true } } } },
        assignees: { include: { user: { select: { handle: true } } } },
      },
    });
    return rows.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueAt: a.dueAt,
      createdAt: a.createdAt,
      problemCount: a._count.problems,
      assigneeCount: a._count.assignees,
      problems: a.problems.map((p) => ({ slug: p.problem.slug, title: p.problem.title })),
      assignees: a.assignees.map((x) => x.user.handle),
    }));
  }

  async remove(id: string) {
    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Assignment not found");
    await prisma.assignment.delete({ where: { id } });
    return { ok: true };
  }

  async listForUser(userId: string) {
    const rows = await prisma.assignment.findMany({
      where: { assignees: { some: { userId } } },
      orderBy: { dueAt: "asc" },
      include: {
        problems: {
          orderBy: { ord: "asc" },
          include: { problem: { select: { id: true, slug: true, title: true, difficulty: true } } },
        },
      },
    });

    const allProblemIds = rows.flatMap((a) => a.problems.map((p) => p.problemId));
    const acSubs =
      allProblemIds.length > 0
        ? await prisma.submission.findMany({
            where: { userId, verdict: "AC", problemId: { in: allProblemIds } },
            select: { problemId: true },
            distinct: ["problemId"],
          })
        : [];
    const solvedSet = new Set(acSubs.map((s) => s.problemId));

    return rows.map((a) => {
      const problems = a.problems.map((ap) => ({
        id: ap.problem.id,
        slug: ap.problem.slug,
        title: ap.problem.title,
        difficulty: ap.problem.difficulty,
        completed: solvedSet.has(ap.problemId),
      }));
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        dueAt: a.dueAt,
        createdAt: a.createdAt,
        problems,
        completedCount: problems.filter((p) => p.completed).length,
        totalCount: problems.length,
      };
    });
  }

  /** Per-assignment mini-leaderboard — ranks assignees by how many of the assignment's problems
   * they've solved. Visible to any assignee (so classmates can see each other's progress on this
   * specific set) or an admin; not to arbitrary logged-in users who weren't assigned it. */
  async leaderboard(assignmentId: string, requester: RequestUser) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        problems: { select: { problemId: true } },
        assignees: { select: { userId: true, user: { select: { handle: true } } } },
      },
    });
    if (!assignment) throw new NotFoundException("Assignment not found");

    const isAssignee = assignment.assignees.some((a) => a.userId === requester.id);
    if (requester.role !== "ADMIN" && !isAssignee) {
      throw new ForbiddenException("You are not assigned to this assignment.");
    }

    const problemIds = assignment.problems.map((p) => p.problemId);
    const assigneeIds = assignment.assignees.map((a) => a.userId);

    const acSubs =
      problemIds.length > 0 && assigneeIds.length > 0
        ? await prisma.submission.findMany({
            where: { userId: { in: assigneeIds }, problemId: { in: problemIds }, verdict: "AC" },
            select: { userId: true, problemId: true },
            distinct: ["userId", "problemId"],
          })
        : [];

    const solvedByUser = new Map<string, Set<string>>();
    for (const s of acSubs) {
      const set = solvedByUser.get(s.userId) ?? new Set<string>();
      set.add(s.problemId);
      solvedByUser.set(s.userId, set);
    }

    const rows = assignment.assignees.map((a) => ({
      userId: a.userId,
      handle: a.user.handle,
      solvedCount: solvedByUser.get(a.userId)?.size ?? 0,
      totalCount: problemIds.length,
    }));
    rows.sort((a, b) => b.solvedCount - a.solvedCount || a.handle.localeCompare(b.handle));

    let rank = 0;
    let lastCount = -1;
    return rows.map((row, i) => {
      if (row.solvedCount !== lastCount) {
        rank = i + 1;
        lastCount = row.solvedCount;
      }
      return { ...row, rank };
    });
  }
}
