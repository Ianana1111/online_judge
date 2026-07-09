import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { CreateAssignmentDto } from "@oj/shared";

@Injectable()
export class AssignmentsService {
  async createByAdmin(dto: CreateAssignmentDto, createdById: string) {
    let assigneeUserIds = dto.assigneeUserIds;
    if (dto.assignToAll) {
      const allUsers = await prisma.user.findMany({ where: { role: "USER" }, select: { id: true } });
      assigneeUserIds = allUsers.map((u) => u.id);
    }

    return prisma.assignment.create({
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
}
