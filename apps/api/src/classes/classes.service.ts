import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { CreateClassSessionDto, UpdateClassSessionDto } from "@oj/shared";

@Injectable()
export class ClassesService {
  async createForStudent(teacherId: string, dto: CreateClassSessionDto) {
    const student = await prisma.user.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException("Student not found");

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
    const students = await prisma.user.findMany({
      where: { role: "USER" },
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
