import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { RequestUser } from "../common/decorators";

// Learning maps that exist. The slug is part of the URL, so only known values ever reach the DB.
const SLUGS = new Set(["c"]);

@Injectable()
export class LearnService {
  // The C learning map (judge.tw/learn/c) carries full solutions to the tutor's class problems, so
  // it is served only to tutored students (isStudent) and admins. Access is decided from the
  // account's current DB row, not the request's token claims, so revoking isStudent takes effect on
  // the very next request.
  async content(slug: string, user: RequestUser) {
    if (!SLUGS.has(slug)) throw new NotFoundException("Unknown learning map");
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { isStudent: true, role: true } });
    if (!account || (!account.isStudent && account.role !== "ADMIN")) {
      throw new ForbiddenException({ message: "This learning map is for tutored students only.", code: "NOT_STUDENT" });
    }
    const row = await prisma.learnContent.findUnique({ where: { slug }, select: { version: true, content: true, updatedAt: true } });
    if (!row) throw new NotFoundException({ message: "This learning map has not been published yet.", code: "NOT_PUBLISHED" });
    return { version: row.version, updatedAt: row.updatedAt, content: row.content };
  }
}
