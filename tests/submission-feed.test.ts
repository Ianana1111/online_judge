import { expect, it, vi } from "vitest";
import { SubmissionsService } from "../apps/api/src/submissions/submissions.service";
const fixture = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("../packages/db/src/index.ts", () => ({ prisma: { submission: { findMany: fixture.findMany } }, Prisma: { DbNull: null } }));
vi.mock("../apps/api/src/billing/billing.service", () => ({ BillingService: class {}, currentMonthKey: () => "2026-10" }));

const row = (id: string) => ({ id, languageKey: "cpp17", verdict: "JUDGING", timeMs: null, createdAt: new Date(0), user: { handle: "alice" }, problem: { slug: "p", title: "P" } });
const service = () => new SubmissionsService({} as never, {} as never, { publish: vi.fn() } as never, {} as never, {} as never);

it("lists only public practice submissions and never selects source or compiler output", async () => {
  fixture.findMany.mockResolvedValue([row("s1")]);
  expect(await service().feed()).toEqual([{ id: "s1", handle: "alice", problemSlug: "p", problemTitle: "P", languageKey: "cpp17", verdict: "JUDGING", timeMs: null, createdAt: new Date(0) }]);
  const query = fixture.findMany.mock.calls[0][0];
  expect(query.where).toEqual({ contestId: null, contestParticipantId: null, problem: { visibility: true }, user: { deletionRequestedAt: null } });
  expect(query.select).not.toHaveProperty("sourceCode");
  expect(query.select).not.toHaveProperty("compileError");
});

it("coalesces concurrent readers into one follow-up read that reflects later writes", async () => {
  let release!: () => void;
  fixture.findMany
    .mockImplementationOnce(() => new Promise((resolve) => { release = () => resolve([row("old")]); }))
    .mockResolvedValueOnce([row("new")]);
  const feed = service();
  const first = feed.feed();
  // Woken by a write while the first read is in flight: these must not be served the stale read.
  const late = Array.from({ length: 20 }, () => feed.feed());
  release();
  expect((await first)[0].id).toBe("old");
  for (const items of await Promise.all(late)) expect(items[0].id).toBe("new");
  expect(fixture.findMany).toHaveBeenCalledTimes(2);
});
