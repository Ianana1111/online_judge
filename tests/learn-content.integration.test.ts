import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { LearnService } from "../apps/api/src/learn/learn.service";
import { UsersService } from "../apps/api/src/users/users.service";

// The C learning map holds full class solutions, so only students enrolled in C (learnC) and admins
// may read it; CPE-only students (isStudent without learnC) may not.
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("learning map content access", () => {
  const service = new LearnService(), users: string[] = [];
  const admin = new UsersService({} as never, {} as never, {} as never, {} as never);
  const content = { chapters: [{ id: "ch-basics", title: "程式的骨架", md: "secret chapter" }], problems: [], practice: [] };
  let previous: { version: string; content: unknown } | null = null;

  beforeAll(async () => {
    const u = new URL(process.env.DATABASE_URL ?? "invalid:");
    if (u.hostname !== "127.0.0.1" || u.port !== "55432" || u.pathname !== "/oj_test") throw new Error("Disposable database required");
    previous = await prisma.learnContent.findUnique({ where: { slug: "c" }, select: { version: true, content: true } });
    await prisma.learnContent.deleteMany({ where: { slug: "c" } });
  });
  afterAll(async () => {
    await prisma.learnContent.deleteMany({ where: { slug: "c" } });
    if (previous) await prisma.learnContent.create({ data: { slug: "c", version: previous.version, content: previous.content as object } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.$disconnect();
  });
  async function account(data: { isStudent?: boolean; learnC?: boolean; role?: "USER" | "ADMIN" } = {}) {
    const u = await prisma.user.create({ data: { handle: `learn_${randomUUID()}`, email: `${randomUUID()}@example.test`, ...data } });
    users.push(u.id);
    return { id: u.id, handle: u.handle, role: u.role, sid: "test", authVersion: 0, mfaVerified: false };
  }
  const code = async (p: Promise<unknown>) => {
    // Nest's HTTP exceptions (ForbiddenException, NotFoundException) carry their body in getResponse().
    try { await p; return "OK"; } catch (e) {
      const http = e as { getResponse?: () => unknown; constructor: { name: string } };
      if (typeof http.getResponse !== "function") throw e;
      const body = http.getResponse();
      return (typeof body === "object" && body && "code" in body ? String(body.code) : "") || http.constructor.name;
    }
  };

  it("says the map is not published yet before anything is published, even to students", async () => {
    expect(await code(service.content("c", await account({ isStudent: true, learnC: true })))).toBe("NOT_PUBLISHED");
  });

  it("serves the content to C students and admins only, not to CPE-only students", async () => {
    await prisma.learnContent.create({ data: { slug: "c", version: "v1", content } });
    const student = await account({ isStudent: true, learnC: true });
    expect(await service.content("c", student)).toMatchObject({ version: "v1", content });
    expect(await service.content("c", await account({ role: "ADMIN" }))).toMatchObject({ version: "v1" });
    expect(await code(service.content("c", await account({ isStudent: true })))).toBe("NOT_STUDENT");
    expect(await code(service.content("c", await account()))).toBe("NOT_STUDENT");
  });

  it("keeps learnC and isStudent in step when an admin toggles them", async () => {
    const u = await account();
    expect(await admin.setLearnC(u.id, true)).toMatchObject({ isStudent: true, learnC: true });
    expect(await code(service.content("c", u))).toBe("OK");
    expect(await admin.setLearnC(u.id, false)).toMatchObject({ isStudent: true, learnC: false });
    expect(await code(service.content("c", u))).toBe("NOT_STUDENT");
    await admin.setLearnC(u.id, true);
    expect(await admin.setIsStudent(u.id, false)).toMatchObject({ isStudent: false, learnC: false });
    expect(await code(service.content("c", u))).toBe("NOT_STUDENT");
  });

  it("uses the current account state, so revoking C takes effect immediately", async () => {
    const student = await account({ isStudent: true, learnC: true });
    expect(await code(service.content("c", student))).toBe("OK");
    await prisma.user.update({ where: { id: student.id }, data: { learnC: false } });
    expect(await code(service.content("c", student))).toBe("NOT_STUDENT");
    // A request object claiming ADMIN does not help when the DB row says otherwise.
    expect(await code(service.content("c", { ...student, role: "ADMIN" }))).toBe("NOT_STUDENT");
  });

  it("rejects unknown learning maps without touching the database", async () => {
    expect(await code(service.content("python", await account({ isStudent: true, learnC: true })))).toBe("NotFoundException");
  });
});
