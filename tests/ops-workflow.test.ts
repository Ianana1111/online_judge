import { describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyObservation, publicStatus } from "../apps/ops-monitor/src/state.mjs";
import { monitorServer } from "../apps/ops-monitor/src/server.mjs";
import { readBounded } from "../apps/ops-monitor/src/probes.mjs";
import { repairReady, opsSourcePathSchema, type OpsWorkflowClaim, type OpsWorkflowResult } from "../packages/shared/src/opsWorkflow";
import { selectedOpsModel } from "../apps/ops-runner/src/model";
import { codexArgs } from "../apps/ops-runner/src/codex";
import { regressionProved, validateRegression } from "../apps/ops-runner/src/repair";
import { releaseFlow, type ReleaseProvider } from "../apps/ops-runner/src/release";
import { processWorkflow } from "../apps/ops-runner/src/workflow";
import type { Transport } from "../apps/ops-runner/src/runner";
const base = "a".repeat(40), head = "b".repeat(40);
export function ready(): OpsWorkflowResult { return { outcome: "READY", summary: "Synthetic repair", checks: ["regression-proof", "full-suite", "qa-review", "security-review"].map(name => ({ name, status: "PASS", durationMs: 0, detail: "fixture" })), artifacts: [], baseSha: base, headSha: head, patchHash: "c".repeat(64), branch: "judgeops/test1", pullNumber: 1, pullUrl: "https://github.com/Ianana1111/online_judge/pull/1", review: "APPROVED", modelCalls: 3, inputTokens: 100, outputTokens: 100, metrics: {} }; }
const probe = (ok: boolean) => [{ id: "api", name: "API", ok, latencyMs: 10, httpStatus: ok ? 200 : 503 }];
describe("independent monitor", () => {
  it("requires two failures and two recoveries, deduplicates and retains incident history without mutating snapshots", () => {
    const t = Date.now();
    const a = applyObservation(null, probe(false), new Date(t));
    expect(a.incidents).toHaveLength(0);
    expect(applyObservation(a, probe(false), new Date(t + 100))).toBe(a);
    const b = applyObservation(a, probe(false), new Date(t + 300000)); expect(b.incidents).toHaveLength(1);
    const c = applyObservation(b, probe(true), new Date(t + 600000)); expect(c.incidents[0].recoveredAt).toBeNull();
    const d = applyObservation(c, probe(true), new Date(t + 900000)); expect(d.incidents[0].recoveredAt).toBeTruthy(); expect(c.incidents[0].recoveredAt).toBeNull();
    expect(publicStatus(d, t + 900000).status).toBe("HEALTHY"); expect(publicStatus(d, t + 1900000).status).toBe("STALE"); expect(publicStatus(null).status).toBe("UNKNOWN");
  });
  it("makes the public service read-only and fails closed on stale/missing state", async () => {
    const write = vi.fn(), probes = vi.fn(), store = { read: async () => ({ state: null, generation: "0" }), write };
    const server = monitorServer({ mode: "reader", store, probes });
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address(); if (!address || typeof address === "string") throw new Error("No port");
    try {
      const origin = `http://127.0.0.1:${address.port}`;
      expect((await fetch(origin + "/probe", { method: "POST" })).status).toBe(405);
      expect((await fetch(origin + "/status")).status).toBe(503);
      expect((await fetch(origin + "/")).headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
      expect(write).not.toHaveBeenCalled(); expect(probes).not.toHaveBeenCalled();
    } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
  });
  it("bounds response bodies before recording evidence", async () => { await expect(readBounded(new Response("x".repeat(100)), 50)).rejects.toThrow(); });
});
describe("repair and release controls", () => {
  it("pins Sol high and refuses higher models", () => {
    expect(selectedOpsModel()).toBe("gpt-6-sol"); expect(() => selectedOpsModel("gpt-6-astra")).toThrow();
    const args = codexArgs("/tmp/a", "/tmp/b", "/tmp/c"); expect(args).toContain("gpt-6-sol"); expect(args).toContain('model_reasoning_effort="high"');
  });
  it("rejects orchestration, traversal and empty/partial acceptance evidence", () => {
    for (const p of ["apps/api/src/../billing.ts", "apps/api/src/agent-ops/x.ts", "packages/shared/src/opsWorkflow.ts", ".env"]) expect(opsSourcePathSchema.safeParse(p).success).toBe(false);
    expect(repairReady(ready())).toBe(true); expect(repairReady({ ...ready(), checks: [] })).toBe(false);
    expect(repairReady({ ...ready(), checks: ready().checks.slice(1) })).toBe(false);
    expect(repairReady({ ...ready(), headSha: base })).toBe(false);
    expect(() => validateRegression("test('x',()=>{process.exit(0);expect(true).toBe(true)})")).toThrow();
  });
  it("requires assertion failure on baseline, not a syntax/import error", () => {
    const before = { checks: [{ name: "regression", status: "FAIL" as const, durationMs: 1, detail: "" }], regression: { passed: 0, failed: 1, total: 1, runtimeErrors: 0, failedAssertions: 1 } };
    const after = { checks: [{ name: "regression", status: "PASS" as const, durationMs: 1, detail: "" }], regression: { passed: 1, failed: 0, total: 1, runtimeErrors: 0, failedAssertions: 0 } };
    expect(regressionProved(before, after)).toBe(true); expect(regressionProved({ ...before, regression: { ...before.regression, runtimeErrors: 1 } }, after)).toBe(false);
  });
  function provider() {
    let current = base;
    const snapshot = { api: "old-api", judge: "old-judge", web: "old-web" };
    const p: ReleaseProvider = { currentMain: vi.fn(async () => current), capture: vi.fn(async () => snapshot), publish: vi.fn(async (_base, sha) => { current = sha; }), deploy: vi.fn(async () => snapshot), healthy: vi.fn(async () => true), revert: vi.fn(async () => { current = "d".repeat(40); return current; }), restore: vi.fn(async () => {}) }; return p;
  }
  const targets = { api: true, judge: false, web: true };
  it("persists rollback checkpoint before publication and deploys only the approved SHA", async () => {
    const p = provider(), events: string[] = [];
    const progress = vi.fn(async (label: string) => { events.push(label); if (label === "RELEASE_CHECKPOINT") expect(p.publish).not.toHaveBeenCalled(); });
    const result = await releaseFlow(ready(), targets, p, new AbortController().signal, progress);
    expect(result.outcome).toBe("RELEASED"); expect(p.publish).toHaveBeenCalledWith(base, head); expect(p.deploy).toHaveBeenCalledWith(head, targets, expect.any(AbortSignal)); expect(events[0]).toBe("RELEASE_CHECKPOINT");
  });
  it("restores code and retained artifacts after a failed deployment", async () => {
    const p = provider(); vi.mocked(p.deploy).mockRejectedValueOnce(new Error("build failed"));
    const r = await releaseFlow(ready(), targets, p, new AbortController().signal, async () => {});
    expect(r.outcome).toBe("ROLLED_BACK"); expect(p.revert).toHaveBeenCalledWith(base, head); expect(p.restore).toHaveBeenCalledTimes(1); expect(p.deploy).toHaveBeenCalledTimes(2);
  });
  it("never overwrites a concurrent main update or reports an unconfirmed rollback as successful", async () => {
    const p = provider(); vi.mocked(p.currentMain).mockResolvedValue("e".repeat(40));
    expect((await releaseFlow(ready(), targets, p, new AbortController().signal, async () => {})).outcome).toBe("NEEDS_INPUT"); expect(p.publish).not.toHaveBeenCalled();
    const broken = provider(); vi.mocked(broken.deploy).mockRejectedValue(new Error("failed")); vi.mocked(broken.restore).mockRejectedValue(new Error("offline"));
    expect((await releaseFlow(ready(), targets, broken, new AbortController().signal, async () => {})).outcome).toBe("NEEDS_INPUT");
  });
  it("reconciles an ambiguous GitHub response before rollback", async () => {
    const p = provider(); vi.mocked(p.currentMain).mockResolvedValueOnce(base).mockResolvedValue(head); vi.mocked(p.publish).mockRejectedValue(new Error("timeout"));
    expect((await releaseFlow(ready(), targets, p, new AbortController().signal, async () => {})).outcome).toBe("ROLLED_BACK"); expect(p.revert).toHaveBeenCalledTimes(1);
  });
  it("does not execute or replay a workflow after losing its lease", async () => {
    const runtime = await mkdtemp(join(tmpdir(), "judgeops-workflow-test-"));
    try {
      const claim = { task: { id: "test1", events: [] }, lease: "a".repeat(64), leaseSeconds: 180 } as unknown as OpsWorkflowClaim;
      const execute = vi.fn(); const transport: Transport = async () => { throw new Error("offline"); };
      expect(await processWorkflow(claim, transport, runtime, new AbortController().signal, execute)).toBe("INTERRUPTED"); expect(execute).not.toHaveBeenCalled();
    } finally { await rm(runtime, { recursive: true, force: true }); }
  });
});
