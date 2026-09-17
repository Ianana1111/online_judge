import { createHash, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
const jwt = createRequire(new URL("../apps/api/package.json", import.meta.url))("jsonwebtoken");
import { prisma } from "../packages/db/src/index";
import { UsersService } from "../apps/api/src/users/users.service";
import { SCHOOL_CATALOG, SCHOOL_NAME_ALIASES } from "../packages/shared/src/taiwanSchoolCatalog";
import { TAIWAN_UNIVERSITIES } from "../packages/shared/src/taiwanUniversities";
import { verifySchoolEmailDomain } from "../packages/shared/src/taiwanUniversityDomains";
import { updateProfileSchema } from "../packages/shared/src/schemas";
import catalog from "../packages/shared/data/taiwan-school-catalog.json";

it("covers every current MOE institution, with source evidence for every enabled email root", () => {
  const moe = catalog.schools.filter((s) => s.authority === "MOE"); expect(moe).toHaveLength(149);
  expect(new Set(SCHOOL_CATALOG.map((s) => s.name)).size).toBe(SCHOOL_CATALOG.length);
  for (const s of moe) expect(TAIWAN_UNIVERSITIES).toContain(s.name);
  expect(catalog.rosterVerification.academicYear).toBe(115);
  expect(catalog.rosterVerification.entries).toHaveLength(163);
  for (const entry of catalog.rosterVerification.entries) {
    expect(TAIWAN_UNIVERSITIES).toContain(entry.institution);
    expect(SCHOOL_NAME_ALIASES[entry.name] ?? entry.name).toBe(entry.institution);
  }
  for (const s of catalog.schools) if (s.emailRoots.length) expect(s.emailEvidence.length).toBeGreaterThan(0);
  for (const canonical of Object.values(SCHOOL_NAME_ALIASES)) expect(TAIWAN_UNIVERSITIES).toContain(canonical);
  expect(updateProfileSchema.parse({ school: "高苑科技大學" }).school).toBe("台鋼科技大學");
});
it("rejects suffix tricks, shared providers, another institution and malformed addresses", () => {
  expect(verifySchoolEmailDomain(" Student@CSIE.NTU.EDU.TW ", "國立臺灣大學")).toBe(true);
  for (const address of ["s@evilntu.edu.tw", "s@ntu.edu.tw.evil.test", "s@ntu.edu.tw@evil.test", "s@.ntu.edu.tw", "s@ntu.edu.tw.", "@ntu.edu.tw", "s@gmail.com", "s@nthu.edu.tw"]) expect(verifySchoolEmailDomain(address, "國立臺灣大學")).toBe(false);
  expect(verifySchoolEmailDomain("s@kmu.edu.tw", "中華醫事科技大學")).toBe(false);
  expect(verifySchoolEmailDomain("s@ms.hwai.edu.tw", "中華醫事科技大學")).toBe(true);
  expect(verifySchoolEmailDomain("s@gmail.com", "一貫道崇德學院")).toBe(false);
  expect(verifySchoolEmailDomain("s@mail.mil.tw", "空軍軍官學校")).toBe(false);
  expect(verifySchoolEmailDomain("s@ntu.edu.tw", "__proto__")).toBe(false);
});
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("school challenge transactions", () => {
  const users: string[] = [], emails: string[] = [], tokens = new Map<string, string[]>();
  const send = vi.fn(async (input: { to: string; html: string }) => {
    const token = decodeURIComponent(input.html.match(/verify-school#token=([^"<]+)/)![1]);
    const sub = (jwt.decode(token) as { sub: string }).sub!; tokens.set(sub, [...(tokens.get(sub) ?? []), token]);
  });
  const service = new UsersService({ send } as never, {} as never, {} as never, {} as never);
  beforeAll(() => { const u = new URL(process.env.DATABASE_URL ?? "invalid:"); if (u.hostname !== "127.0.0.1" || u.port !== "55432" || u.pathname !== "/oj_test") throw new Error("Disposable local test database required"); });
  afterAll(async () => { await prisma.usedSchoolEmail.deleteMany({ where: { email: { in: emails } } }); await prisma.user.deleteMany({ where: { id: { in: users } } }); await prisma.$disconnect(); });
  async function account() { const s = randomUUID(); const u = await prisma.user.create({ data: { handle: `school_${s}`, email: `${s}@example.test`, school: "國立臺灣大學" } }); users.push(u.id); return u; }
  function address() { const e = `${randomUUID()}@ntu.edu.tw`; emails.push(e); return e; }
  async function challenge(id: string, email: string) { await service.requestSchoolVerification(id, email); return tokens.get(id)!.at(-1)!; }
  it("reserves one resend slot across concurrent requests", async () => {
    const a = await account(), email = address(); const before = send.mock.calls.length;
    const results = await Promise.allSettled(Array.from({ length: 6 }, () => service.requestSchoolVerification(a.id, email)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1); expect(send.mock.calls.length - before).toBe(1);
    const token = tokens.get(a.id)![0]; expect(await service.confirmSchoolVerification(token)).toEqual({ ok: true, account: { handle: a.handle, school: a.school } });
    const first = (await prisma.user.findUniqueOrThrow({ where: { id: a.id } })).schoolVerifiedAt;
    expect(await service.confirmSchoolVerification(token)).toEqual({ ok: true, account: { handle: a.handle, school: a.school } });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: a.id } })).schoolVerifiedAt).toEqual(first);
    await expect(service.updateProfile(a.id, { school: "國立清華大學" })).rejects.toThrow();
  });
  it("invalidates a sent challenge when the claimed school changes", async () => {
    const a = await account(), token = await challenge(a.id, address());
    await service.updateProfile(a.id, { school: "國立清華大學" }); expect(await service.confirmSchoolVerification(token)).toEqual({ ok: false });
    const current = await prisma.user.findUniqueOrThrow({ where: { id: a.id } }); expect(current.schoolVerifiedAt).toBeNull(); expect(current.schoolVerificationTokenHash).toBeNull();
  });
  it("serializes a profile change racing a confirmation without transferring verification", async () => {
    const a = await account(), token = await challenge(a.id, address());
    await Promise.allSettled([service.confirmSchoolVerification(token), service.updateProfile(a.id, { school: "國立清華大學" })]);
    const current = await prisma.user.findUniqueOrThrow({ where: { id: a.id } });
    expect(current.schoolVerifiedAt ? current.school === "國立臺灣大學" : current.school === "國立清華大學").toBe(true);
  });
  it("replaces older links even when the email stays the same", async () => {
    const a = await account(), email = address(), old = await challenge(a.id, email);
    await prisma.user.update({ where: { id: a.id }, data: { schoolVerificationSentAt: new Date(0) } });
    const latest = await challenge(a.id, email); expect(old).not.toBe(latest);
    expect(await service.confirmSchoolVerification(old)).toEqual({ ok: false }); expect(await service.confirmSchoolVerification(latest)).toEqual({ ok: true, account: { handle: a.handle, school: a.school } });
  });
  it("lets only one account claim an inbox and keeps the claim after deletion", async () => {
    const [a, b] = await Promise.all([account(), account()]), email = address();
    const [ta, tb] = await Promise.all([challenge(a.id, email), challenge(b.id, email)]);
    const results = await Promise.all([service.confirmSchoolVerification(ta), service.confirmSchoolVerification(tb)]); expect(results.filter((r) => r.ok)).toHaveLength(1);
    const claim = await prisma.usedSchoolEmail.findUniqueOrThrow({ where: { email } }); await prisma.user.delete({ where: { id: claim.userId! } });
    expect((await prisma.usedSchoolEmail.findUniqueOrThrow({ where: { email } })).userId).toBeNull();
    const c = await account(); await expect(service.requestSchoolVerification(c.id, email)).rejects.toThrow("already been used");
  });
  it("releases a failed email reservation so the user can retry immediately", async () => {
    const a = await account(), email = address(); send.mockRejectedValueOnce(new Error("Synthetic delivery failure"));
    await expect(service.requestSchoolVerification(a.id, email)).rejects.toThrow("Synthetic delivery failure");
    const current = await prisma.user.findUniqueOrThrow({ where: { id: a.id } }); expect(current.schoolVerificationTokenHash).toBeNull(); expect(current.schoolVerificationSentAt).toBeNull();
    expect(await service.confirmSchoolVerification(await challenge(a.id, email))).toEqual({ ok: true, account: { handle: a.handle, school: a.school } });
  });
  it("rejects expired tokens, a different token purpose/algorithm, and forged signatures", async () => {
    const a = await account(), email = address(), valid = await challenge(a.id, email), secret = process.env.SCHOOL_VERIFY_SECRET ?? "dev_school_verify_secret_change_me";
    const payload = { purpose: "school-verify", sub: a.id, school: a.school, email, jti: randomUUID() };
    for (const token of [valid + "x", jwt.sign(payload, secret, { issuer: "judge.tw", audience: "school-verification", expiresIn: -1 }), jwt.sign({ ...payload, purpose: "access" }, secret), jwt.sign(payload, secret, { algorithm: "HS512" })]) {
      await prisma.user.update({ where: { id: a.id }, data: { schoolVerificationTokenHash: createHash("sha256").update(token).digest("hex") } });
      expect(await service.confirmSchoolVerification(token)).toEqual({ ok: false });
    }
  });
});
