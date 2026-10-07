import { afterEach, describe, expect, it, vi } from "vitest";
import { requestVercelProduction } from "../apps/ops-runner/src/release-provider";
import { runProcess } from "../apps/ops-runner/src/process";
vi.mock("../apps/ops-runner/src/process", () => ({ runProcess: vi.fn() }));
afterEach(() => vi.resetAllMocks());
const sha = "f".repeat(40), signal = new AbortController().signal;
const response = (data: unknown, code = 0) => vi.mocked(runProcess).mockResolvedValue({ code, stdout: JSON.stringify(data), stderr: "" });
describe("explicit Vercel production deployment", () => {
  it("pins the approved SHA and production environment in the existing project", async () => {
    response({ id: "dpl_approved", target: "production", meta: { githubCommitSha: sha } });
    await expect(requestVercelProduction(sha, signal)).resolves.toBe("dpl_approved");
    const [command, args, options] = vi.mocked(runProcess).mock.calls[0];
    expect(command).toBe("vercel"); expect(args).toContain("POST");
    expect(JSON.parse(options!.input!)).toMatchObject({ project: "prj_cMut2xMELaD8i0beZilaaVbe4BaF", target: "production", gitSource: { type: "github", org: "Ianana1111", repo: "online_judge", ref: "main", sha } });
    expect(options!.signal).toBe(signal);
  });
  it.each([
    { id: "dpl_preview", target: null, meta: { githubCommitSha: sha } },
    { id: "dpl_wrong", target: "production", meta: { githubCommitSha: "a".repeat(40) } },
    { target: "production", meta: { githubCommitSha: sha } },
  ])("rejects preview, a different commit or missing deployment evidence", async data => {
    response(data);
    await expect(requestVercelProduction(sha, signal)).rejects.toThrow("VERCEL_PRODUCTION_REQUEST_MISMATCH");
  });
  it("does not retry an ambiguous failed POST", async () => {
    response({}, 1);
    await expect(requestVercelProduction(sha, signal)).rejects.toThrow("VERCEL_PRODUCTION_REQUEST_FAILED");
    expect(runProcess).toHaveBeenCalledTimes(1);
  });
  it("rejects an unpinned branch before contacting Vercel", async () => {
    await expect(requestVercelProduction("main", signal)).rejects.toThrow("INVALID_RELEASE_SHA");
    expect(runProcess).not.toHaveBeenCalled();
  });
});
