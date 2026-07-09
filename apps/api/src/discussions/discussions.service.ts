import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { CreateDiscussionDto } from "@oj/shared";
import type { RequestUser } from "../common/decorators";

@Injectable()
export class DiscussionsService {
  async listByProblem(problemId: string) {
    const rows = await prisma.discussion.findMany({
      where: { problemId },
      include: { user: { select: { handle: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((d) => ({
      id: d.id,
      body: d.body,
      createdAt: d.createdAt,
      userHandle: d.user.handle,
      userRole: d.user.role,
    }));
  }

  async create(problemId: string, userId: string, dto: CreateDiscussionDto) {
    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) throw new NotFoundException("Problem not found");

    const discussion = await prisma.discussion.create({
      data: { problemId, userId, body: dto.body },
      include: { user: { select: { handle: true, role: true } } },
    });
    return {
      id: discussion.id,
      body: discussion.body,
      createdAt: discussion.createdAt,
      userHandle: discussion.user.handle,
      userRole: discussion.user.role,
    };
  }

  async remove(id: string, requester: RequestUser) {
    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) throw new NotFoundException("Discussion post not found");
    if (discussion.userId !== requester.id && requester.role !== "ADMIN") {
      throw new ForbiddenException("You can only delete your own posts");
    }
    await prisma.discussion.delete({ where: { id } });
    return { ok: true };
  }
}
