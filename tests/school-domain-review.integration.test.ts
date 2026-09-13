import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "../packages/db/src/index";
import { SchoolDomainsService, schoolDomainRequestSchema, schoolEmailAllowed } from "../apps/api/src/users/school-domains.service";
import type { RequestUser } from "../apps/api/src/common/decorators";

it("requires narrow edu.tw domains and public HTTPS institutional evidence", () => {
  const input = { domain: "student.example.edu.tw", officialUrl: "https://www.example.edu.tw/email", explanation: "New official mailbox domain" };
  expect(schoolDomainRequestSchema.safeParse(input).success).toBe(true);
  for (const domain of ["edu.tw", "gmail.com", "*.example.edu.tw", "example.edu.tw.evil.test", "-bad.edu.tw"]) expect(schoolDomainRequestSchema.safeParse({ ...input, domain }).success).toBe(false);
  for (const officialUrl of ["http://www.example.edu.tw/email", "https://127.0.0.1/email", "https://user:pass@example.edu.tw/email", "javascript:alert(1)"]) expect(schoolDomainRequestSchema.safeParse({ ...input, officialUrl }).success).toBe(false);
});
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("assisted school domains", () => {
  const service = new SchoolDomainsService(), users: string[] = [], requests: string[] = [];
  const actor = { id: "local-reviewer", role: "ADMIN", mfaVerified: true } as RequestUser;
  beforeAll(() => { const url = new URL(process.env.DATABASE_URL!); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable local database required"); });
  afterAll(async () => { await prisma.schoolDomainRequest.deleteMany({ where: { id: { in: requests } } }); await prisma.user.deleteMany({ where: { id: { in: users } } }); await prisma.$disconnect(); });
  async function account(school = "國立臺灣大學") { const id = randomUUID(); const user = await prisma.user.create({ data: { handle: `domain_${id}`, email: `${id}@example.test`, school } }); users.push(user.id); return user; }
  function body(domain = `fixture-${randomUUID()}.edu.tw`) { return { domain, officialUrl: "https://www.ntu.edu.tw/email", explanation: "Disposable verification test" }; }
  async function request(userId: string, input = body()) { const r = await service.request(userId, input); requests.push(r.id); return r; }
  const review = (r: { id: string; updatedAt: Date }, status: "APPROVED" | "REJECTED" | "REVOKED" = "APPROVED", admin = actor) => service.review(admin, r.id, { status, expectedUpdatedAt: r.updatedAt.toISOString(), note: "Checked official instructions in isolated test" });
  it("allows only one pending application under concurrent requests", async () => {
    const user = await account(), input = body(); const results = await Promise.allSettled(Array.from({ length: 5 }, () => request(user.id, input)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await schoolEmailAllowed(`student@${input.domain}`, user.school!)).toBe(false);
  });
  it("requires MFA, binds exact school/domain, and never marks identity verified", async () => {
    const user = await account(), r = await request(user.id);
    await expect(review(r, "APPROVED", { ...actor, mfaVerified: false })).rejects.toThrow("two-factor");
    await expect(review(r, "APPROVED", { ...actor, role: "USER" })).rejects.toThrow("two-factor");
    await review(r);
    expect(await schoolEmailAllowed(`student@${r.domain}`, r.school)).toBe(true);
    for (const [email, school] of [[`student@sub.${r.domain}`, r.school], [`student@${r.domain}.evil.test`, r.school], [`student@${r.domain}`, "國立清華大學"]]) expect(await schoolEmailAllowed(email, school)).toBe(false);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).schoolVerifiedAt).toBeNull();
  });
  it("prevents stale decisions and preserves approval/revocation history", async () => {
    const user = await account(), r = await request(user.id);
    const results = await Promise.allSettled([review(r), review(r, "REJECTED")]); expect(results.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    const decided = await prisma.schoolDomainRequest.findUniqueOrThrow({ where: { id: r.id } });
    await expect(review(r)).rejects.toThrow("changed");
    if (decided.status === "APPROVED") {
      await review(decided, "REVOKED"); expect(await schoolEmailAllowed(`student@${r.domain}`, r.school)).toBe(false);
      expect((await service.mine(user.id))[0].decisions.map((d) => d.status)).toEqual(["APPROVED", "REVOKED"]);
    }
  });
  it("rejects another school's built-in domain and overlapping assisted approvals", async () => {
    const a = await account(), b = await account("國立清華大學"), first = await request(a.id); await review(first);
    const overlap = await request(b.id, body(`sub.${first.domain}`)); await expect(review(overlap)).rejects.toThrow("approved owner");
    await review(overlap, "REJECTED");
    const known = await request(b.id, body("ntu.edu.tw")); await expect(review(known)).rejects.toThrow("another school");
  });
  it("retains review history after account deletion and scopes private requests", async () => {
    const a = await account(), b = await account(), r = await request(a.id); await review(r);
    expect(await service.mine(b.id)).toEqual([]); await prisma.user.delete({ where: { id: a.id } });
    expect((await prisma.schoolDomainRequest.findUniqueOrThrow({ where: { id: r.id }, include: { decisions: true } })).decisions).toHaveLength(1);
  });
});
