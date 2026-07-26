import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { CreateClassSessionDto, UpdateClassSessionDto } from "@oj/shared";
import { NotificationsService } from "../notifications/notifications.service";
import type { RequestUser } from "../common/decorators";

@Injectable()
export class ClassesService {
  constructor(private readonly notifications: NotificationsService) {}
  async createForStudent(teacherId: string, dto: CreateClassSessionDto) {
    const student = await prisma.user.findUnique({ where: { id: dto.studentId } });
    if (!student || !student.isStudent) throw new NotFoundException("Student not found");

    const last = await prisma.classSession.findFirst({
      where: { studentId: dto.studentId },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const number = (last?.number ?? 0) + 1;

    return prisma.classSession.create({
      data: {
        studentId: dto.studentId,
        teacherId,
        number,
        title: dto.title,
        contentMd: dto.contentMd,
        homework: { create: dto.problemIds.map((problemId, ord) => ({ problemId, ord })) },
      },
      include: {
        homework: { include: { problem: { select: { id: true, slug: true, title: true } } } },
      },
    });
  }

  async update(id: string, dto: UpdateClassSessionDto) {
    const existing = await prisma.classSession.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Class not found");

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.contentMd !== undefined) data.contentMd = dto.contentMd;
    const updated = await prisma.classSession.update({ where: { id }, data });

    if (dto.problemIds) {
      await prisma.classHomework.deleteMany({ where: { classId: id } });
      if (dto.problemIds.length > 0) {
        await prisma.classHomework.createMany({
          data: dto.problemIds.map((problemId, ord) => ({ classId: id, problemId, ord })),
        });
      }
    }
    return updated;
  }

  async remove(id: string) {
    const existing = await prisma.classSession.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Class not found");
    await prisma.classSession.delete({ where: { id } });
    return { ok: true };
  }

  async listForStudent(studentId: string) {
    const classes = await prisma.classSession.findMany({
      where: { studentId },
      orderBy: { number: "asc" },
      include: {
        homework: {
          orderBy: { ord: "asc" },
          include: { problem: { select: { id: true, slug: true, title: true, uvaId: true } } },
        },
      },
    });

    const allProblemIds = classes.flatMap((c) => c.homework.map((h) => h.problemId));
    const statusByProblem = await this.latestStatusByProblem(studentId, allProblemIds);

    return classes.map((c) => ({
      id: c.id,
      number: c.number,
      title: c.title,
      contentMd: c.contentMd,
      createdAt: c.createdAt,
      homework: c.homework.map((h) => ({
        id: h.problem.id,
        slug: h.problem.slug,
        title: h.problem.title,
        uvaId: h.problem.uvaId,
        status: statusByProblem.get(h.problemId) ?? "NOT_STARTED",
      })),
    }));
  }

  /** The owning student or any admin can view a class's full detail (content + comment thread) —
   * everyone else gets 403, since a class session can name another student's real progress. */
  private async assertCanAccess(classId: string, requester: RequestUser) {
    const cls = await prisma.classSession.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException("Class not found");
    if (requester.role !== "ADMIN" && requester.id !== cls.studentId) {
      throw new ForbiddenException("You don't have access to this class.");
    }
    return cls;
  }

  async getById(classId: string, requester: RequestUser) {
    const cls = await this.assertCanAccess(classId, requester);
    const [student, teacher, homework, comments] = await Promise.all([
      prisma.user.findUnique({ where: { id: cls.studentId }, select: { handle: true } }),
      prisma.user.findUnique({ where: { id: cls.teacherId }, select: { handle: true } }),
      prisma.classHomework.findMany({
        where: { classId },
        orderBy: { ord: "asc" },
        include: { problem: { select: { id: true, slug: true, title: true, uvaId: true } } },
      }),
      prisma.classComment.findMany({
        where: { classId },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { handle: true, role: true } } },
      }),
    ]);

    const statusByProblem = await this.latestStatusByProblem(
      cls.studentId,
      homework.map((h) => h.problemId),
    );

    return {
      id: cls.id,
      number: cls.number,
      title: cls.title,
      contentMd: cls.contentMd,
      createdAt: cls.createdAt,
      studentId: cls.studentId,
      studentHandle: student?.handle ?? "",
      teacherHandle: teacher?.handle ?? "",
      homework: homework.map((h) => ({
        id: h.problem.id,
        slug: h.problem.slug,
        title: h.problem.title,
        uvaId: h.problem.uvaId,
        status: statusByProblem.get(h.problemId) ?? "NOT_STARTED",
      })),
      comments: comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        authorHandle: c.author.handle,
        isAdmin: c.author.role === "ADMIN",
      })),
    };
  }

  async addComment(classId: string, requester: RequestUser, body: string) {
    const cls = await this.assertCanAccess(classId, requester);
    const comment = await prisma.classComment.create({
      data: { classId, authorId: requester.id, body },
      include: { author: { select: { handle: true, role: true } } },
    });

    // Notify whichever side didn't write the comment — a student asking should reach their
    // teacher, and a teacher/admin reply should reach the student, regardless of which admin
    // account originally recorded the class.
    const notifyUserId = requester.id === cls.studentId ? cls.teacherId : cls.studentId;
    if (notifyUserId !== requester.id) {
      await this.notifications.create(notifyUserId, {
        type: "class_comment",
        title: `New message on Class ${cls.number}${cls.title ? `: ${cls.title}` : ""}`,
        body,
        link: requester.id === cls.studentId ? `/admin/classes/${cls.studentId}/${cls.id}` : `/classes/${cls.id}`,
      });
    }

    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      authorHandle: comment.author.handle,
      isAdmin: comment.author.role === "ADMIN",
    };
  }

  /** Latest submission verdict per problem for a student — "NOT_STARTED" if they've never
   * submitted. Used both for a student's own class view and the admin overview dashboard. */
  private async latestStatusByProblem(studentId: string, problemIds: string[]): Promise<Map<string, string>> {
    if (problemIds.length === 0) return new Map();
    const subs = await prisma.submission.findMany({
      where: { userId: studentId, problemId: { in: problemIds } },
      orderBy: { createdAt: "desc" },
      select: { problemId: true, verdict: true },
    });
    const map = new Map<string, string>();
    for (const s of subs) {
      if (!map.has(s.problemId)) map.set(s.problemId, s.verdict); // first-seen wins = most recent
    }
    return map;
  }

  /** Admin dashboard: every student, which class they're currently on, and a breakdown of their
   * homework status (solved / wrong-or-error / pending / not started). */
  async overview() {
    // Only accounts an admin has explicitly marked as students belong in the Classes dashboard —
    // ordinary self-registered users (role USER but isStudent=false) are not being tutored and
    // shouldn't clutter it.
    const students = await prisma.user.findMany({
      where: { role: "USER", isStudent: true },
      select: { id: true, handle: true },
      orderBy: { handle: "asc" },
    });
    const classes = await prisma.classSession.findMany({
      select: { studentId: true, number: true, homework: { select: { problemId: true } } },
    });

    const byStudent = new Map<string, { maxClass: number; problemIds: Set<string> }>();
    for (const c of classes) {
      const entry = byStudent.get(c.studentId) ?? { maxClass: 0, problemIds: new Set<string>() };
      entry.maxClass = Math.max(entry.maxClass, c.number);
      for (const h of c.homework) entry.problemIds.add(h.problemId);
      byStudent.set(c.studentId, entry);
    }

    const results: {
      studentId: string;
      handle: string;
      currentClass: number;
      totalHomework: number;
      ac: number;
      wrong: number;
      pending: number;
      notStarted: number;
    }[] = [];
    for (const student of students) {
      const entry = byStudent.get(student.id);
      const problemIds = entry ? [...entry.problemIds] : [];
      const statusMap = await this.latestStatusByProblem(student.id, problemIds);
      let ac = 0;
      let wrong = 0;
      let pending = 0;
      let notStarted = 0;
      for (const pid of problemIds) {
        const v = statusMap.get(pid);
        if (!v) notStarted++;
        else if (v === "AC") ac++;
        else if (v === "PENDING" || v === "JUDGING") pending++;
        else wrong++;
      }
      results.push({
        studentId: student.id,
        handle: student.handle,
        currentClass: entry?.maxClass ?? 0,
        totalHomework: problemIds.length,
        ac,
        wrong,
        pending,
        notStarted,
      });
    }
    return results.sort((a, b) => b.currentClass - a.currentClass);
  }
}
