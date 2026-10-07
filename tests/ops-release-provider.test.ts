import { afterEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { rollbackRailway } from "../apps/ops-runner/src/release-provider";

vi.mock("node:fs/promises", async original => ({
  ...await original<typeof import("node:fs/promises")>(),
  readFile: vi.fn(),
}));
afterEach(() => { vi.unstubAllGlobals(); vi.resetAllMocks(); });

describe("Railway rollback response contract", () => {
  const deployment = "6a2921af-f136-43b8-b3c7-965d0af5bd70";
  function provider(body: unknown, status = 200) {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ user: { accessToken: "fixture-only" } }));
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
    vi.stubGlobal("fetch", request);
    return request;
  }
  it("accepts the documented Boolean success and requests no object fields", async () => {
    const request = provider({ data: { deploymentRollback: true } });
    await expect(rollbackRailway(deployment)).resolves.toBeUndefined();
    const body = JSON.parse(request.mock.calls[0][1].body);
    // Live schema inspection on 2026-10-07 reports Boolean!, not Deployment.
    expect(body.query).toMatch(/deploymentRollback\(id: \$id\)\s*}/);
    expect(body.variables.id).toBe(deployment);
  });
  it.each([
    { data: { deploymentRollback: false } },
    { data: { deploymentRollback: null } },
    { data: { deploymentRollback: { id: deployment } } },
    { data: { deploymentRollback: true }, errors: [{ message: "Rejected" }] },
  ])("rejects missing, unsuccessful or invalid rollback confirmation", async body => {
    provider(body);
    await expect(rollbackRailway(deployment)).rejects.toThrow("RAILWAY_ROLLBACK_FAILED");
  });
  it("rejects HTTP errors and invalid deployment identifiers", async () => {
    const request = provider({ error: "unavailable" }, 503);
    await expect(rollbackRailway(deployment)).rejects.toThrow("RAILWAY_ROLLBACK_FAILED");
    request.mockClear();
    await expect(rollbackRailway("not-a-deployment")).rejects.toThrow("INVALID_DEPLOYMENT_ID");
    expect(request).not.toHaveBeenCalled();
  });
});
