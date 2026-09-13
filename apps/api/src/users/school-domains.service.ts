import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type Prisma } from "@oj/db";
import { canonicalSchoolName, getSchoolEmailDomains, SCHOOL_CATALOG, verifySchoolEmailDomain } from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { z } from "zod";

const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+edu\.tw$/;
export const schoolDomainRequestSchema = z.object({
  domain: z.string().trim().toLowerCase().max(253).regex(domainPattern),
  officialUrl: z.string().trim().url().max(1000).refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && domainPattern.test(url.hostname);
  }, "Provide an HTTPS page on the school's official edu.tw website"),
  explanation: z.string().trim().min(10).max(1000),
});
export const schoolDomainReviewSchema = z.object({ status: z.enum(["APPROVED", "REJECTED", "REVOKED"]), expectedUpdatedAt: z.string().datetime(), note: z.string().trim().min(10).max(1000) });
type Db = Pick<Prisma.TransactionClient, "schoolDomainRequest">;
export async function schoolEmailAllowed(email: string, school: string, db: Db = prisma) {
  if (verifySchoolEmailDomain(email, school)) return true;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || parts[0].length > 64 || email.length > 254 || /\s|[<>]/.test(parts[0]) || !domainPattern.test(parts[1])) return false;
  // Assisted approvals apply to the exact domain. Subdomains require their own evidence.
  return !!await db.schoolDomainRequest.findFirst({ where: { school: canonicalSchoolName(school), domain: parts[1], status: "APPROVED" }, select: { id: true } });
}

@Injectable()
export class SchoolDomainsService {
  async domains(school: string) {
    const canonical = canonicalSchoolName(school);
    return { roots: getSchoolEmailDomains(canonical), exact: (await prisma.schoolDomainRequest.findMany({ where: { school: canonical, status: "APPROVED" }, select: { domain: true }, take: 100 })).map((r) => r.domain) };
  }
  mine(userId: string) { return prisma.schoolDomainRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10, include: { decisions: { select: { status: true, note: true, createdAt: true }, orderBy: { createdAt: "asc" } } } }); }
  async request(userId: string, body: z.infer<typeof schoolDomainRequestSchema>) {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.deletionRequestedAt) throw new NotFoundException("User not found");
      const school = user.school && canonicalSchoolName(user.school);
      if (!school || !SCHOOL_CATALOG.some((s) => s.name === school)) throw new BadRequestException("Pick a listed school first.");
      if (user.schoolVerifiedAt) throw new BadRequestException("Your school is already verified.");
      if (await schoolEmailAllowed(`check@${body.domain}`, school, tx)) throw new BadRequestException("This domain is already supported. Request a verification email instead.");
      if (await tx.schoolDomainRequest.findFirst({ where: { userId, status: "PENDING" } })) throw new ConflictException("You already have a pending request.");
      if (await tx.schoolDomainRequest.count({ where: { userId, createdAt: { gte: new Date(Date.now() - 86400000) } } }) >= 3) throw new BadRequestException("Please wait before submitting another request.");
      return tx.schoolDomainRequest.create({ data: { ...body, userId, school } });
    });
  }
  async list(status: string, before?: string) {
    const items = await prisma.schoolDomainRequest.findMany({ where: { status, ...(before ? { id: { lt: before } } : {}) }, orderBy: { id: "desc" }, take: 31, include: { decisions: { orderBy: { createdAt: "asc" } } } });
    return { items: items.slice(0, 30), nextCursor: items.length > 30 ? items[29].id : null };
  }
  async review(actor: RequestUser, id: string, input: z.infer<typeof schoolDomainReviewSchema>) {
    if (actor.role !== "ADMIN" || !actor.mfaVerified) throw new ForbiddenException("Verify with two-factor authentication before reviewing school domains.");
    return prisma.$transaction(async (tx) => {
      // Serializes overlapping domain ownership decisions, including parent/subdomain claims.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('school_domain_review'))`;
      const request = await tx.schoolDomainRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException("Request not found");
      if (request.updatedAt.toISOString() !== input.expectedUpdatedAt || (input.status === "REVOKED" ? request.status !== "APPROVED" : request.status !== "PENDING")) throw new ConflictException("This request changed. Refresh before reviewing.");
      if (input.status === "APPROVED") {
        const overlap = (a: string, b: string) => a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
        if (SCHOOL_CATALOG.some((s) => s.name !== request.school && s.emailRoots.some((root) => overlap(root, request.domain)))) throw new ConflictException("This domain overlaps another school's registered domain.");
        const approved = await tx.schoolDomainRequest.findMany({ where: { status: "APPROVED", school: { not: request.school } }, select: { domain: true } });
        if (approved.some((r) => overlap(r.domain, request.domain)) || await tx.schoolDomainRequest.findFirst({ where: { status: "APPROVED", domain: request.domain } })) throw new ConflictException("This domain already has an approved owner.");
      }
      await tx.schoolDomainDecision.create({ data: { requestId: id, actorId: actor.id, status: input.status, note: input.note } });
      if (request.userId) {
        const user = await tx.user.findUnique({ where: { id: request.userId }, select: { settings: true } });
        const en = (user?.settings as Record<string, unknown> | undefined)?.uiLocale === "en";
        await tx.notification.create({ data: { userId: request.userId, type: "SCHOOL_VERIFICATION", title: input.status === "APPROVED" ? (en ? "School email domain approved" : "學校信箱網域已核准") : (en ? "School domain review updated" : "學校網域審核進度更新"), body: input.note, link: "/settings" } });
      }
      return tx.schoolDomainRequest.update({ where: { id }, data: { status: input.status } });
    });
  }
}
