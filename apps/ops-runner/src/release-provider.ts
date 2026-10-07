import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { github, REPOSITORY } from "./repository.js";
import { runProcess } from "./process.js";
import { RAILWAY_PROJECT, RAILWAY_API, VERCEL_PROJECT, VERCEL_TEAM, railwayVariables } from "./provider-config.js";
import { probeAll } from "../../ops-monitor/src/probes.mjs";
import type { DeploymentSnapshot, ReleaseProvider, ReleaseTargets } from "./release.js";
const JUDGE = "a8841fd0-1256-4f1c-8a68-d9c694469a65";
type Deployment = { id: string; status: string; meta?: { commitHash?: string } };
const repo = `/repos/${REPOSITORY}`;
async function railwayDeployments(service: string): Promise<Deployment[]> {
  const r = await runProcess("railway", ["deployment", "list", "--project", RAILWAY_PROJECT, "--environment", "production", "--service", service, "--limit", "30", "--json"]);
  if (r.code) throw new Error("RAILWAY_DEPLOYMENT_READ_FAILED"); return JSON.parse(r.stdout);
}
async function vercel<T>(endpoint: string): Promise<T> {
  const r = await runProcess("vercel", ["api", `${endpoint}${endpoint.includes("?") ? "&" : "?"}teamId=${VERCEL_TEAM}`, "--raw"]);
  if (r.code) throw new Error("VERCEL_DEPLOYMENT_READ_FAILED"); return JSON.parse(r.stdout);
}
export async function rollbackRailway(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("INVALID_DEPLOYMENT_ID");
  const config = JSON.parse(await readFile(join(homedir(), ".railway/config.json"), "utf8"));
  const token = config.user?.accessToken ?? config.user?.token;
  if (!token) throw new Error("RAILWAY_AUTH_REQUIRED");
  const response = await fetch("https://backboard.railway.com/graphql/v2", { method: "POST", redirect: "error", signal: AbortSignal.timeout(20000), headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ query: "mutation Rollback($id: String!) { deploymentRollback(id: $id) }", variables: { id } }) });
  if (!response.ok) throw new Error("RAILWAY_ROLLBACK_FAILED");
  const data = await response.json() as { data?: { deploymentRollback?: boolean }; errors?: unknown[] };
  if (data.errors?.length || data.data?.deploymentRollback !== true) throw new Error("RAILWAY_ROLLBACK_FAILED");
}
export class ProductionReleaseProvider implements ReleaseProvider {
  async currentMain() { return (await github<{ object: { sha: string } }>(`${repo}/git/ref/heads/main`)).object.sha; }
  async capture(): Promise<DeploymentSnapshot> {
    const [api, judge, web] = await Promise.all([railwayDeployments(RAILWAY_API), railwayDeployments(JUDGE), vercel<{ deploymentId: string }>("/v4/aliases/judge.tw")]);
    const a = api.find(d => d.status === "SUCCESS"), j = judge.find(d => d.status === "SUCCESS");
    if (!a || !j || !/^dpl_[a-zA-Z0-9]+$/.test(web.deploymentId)) throw new Error("DEPLOYMENT_SNAPSHOT_INCOMPLETE");
    return { api: a.id, judge: j.id, web: web.deploymentId };
  }
  async publish(base: string, head: string) {
    if (await this.currentMain() !== base) throw new Error("MAIN_CHANGED");
    await github(`${repo}/git/refs/heads/main`, "PATCH", { sha: head, force: false });
  }
  async deploy(sha: string, targets: ReleaseTargets, signal: AbortSignal) {
    if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error("INVALID_RELEASE_SHA");
    let readyWeb: string | null = null;
    const end = Date.now() + 20 * 60_000;
    while (Date.now() < end) {
      if (signal.aborted) throw new Error("INTERRUPTED");
      if (await this.currentMain() !== sha) throw new Error("MAIN_CHANGED");
      const [api, judge, web] = await Promise.all([railwayDeployments(RAILWAY_API), railwayDeployments(JUDGE), vercel<{ deployments: { uid: string; readyState?: string; state?: string; meta?: { githubCommitSha?: string } }[] }>(`/v6/deployments?projectId=${VERCEL_PROJECT}&limit=30&target=production`)]);
      const a = api.find(d => d.meta?.commitHash === sha), j = judge.find(d => d.meta?.commitHash === sha), w = web.deployments.find(d => d.meta?.githubCommitSha === sha);
      for (const [needed, state] of [[targets.api, a?.status], [targets.judge, j?.status], [targets.web, w?.readyState ?? w?.state]] as const) if (needed && state && ["FAILED", "CRASHED", "ERROR", "CANCELED", "CANCELLED"].includes(state)) throw new Error("DEPLOYMENT_FAILED");
      if ((!targets.api || a?.status === "SUCCESS") && (!targets.judge || j?.status === "SUCCESS") && (!targets.web || (w?.readyState ?? w?.state) === "READY")) { readyWeb = targets.web ? w!.uid : null; break; }
      await delay(15_000, undefined, { signal });
    }
    if (Date.now() >= end) throw new Error("DEPLOYMENT_TIMEOUT");
    if (await this.currentMain() !== sha) throw new Error("MAIN_CHANGED");
    if (readyWeb) {
      const promoted = await runProcess("vercel", ["promote", readyWeb, "--scope", VERCEL_TEAM, "--yes", "--timeout", "5m"], { signal, timeoutMs: 320000 });
      if (promoted.code) throw new Error("VERCEL_PROMOTION_FAILED");
    }
    const snapshot = await this.capture();
    if (await this.currentMain() !== sha) throw new Error("MAIN_CHANGED");
    if (readyWeb && snapshot.web !== readyWeb) throw new Error("VERCEL_ALIAS_MISMATCH");
    return snapshot;
  }
  async healthy(signal: AbortSignal) {
    const config = await railwayVariables("api");
    if (!config.INTERNAL_SERVICE_TOKEN) return false;
    const response = await fetch("https://api.judge.tw/internal/operations", { headers: { "x-internal-token": config.INTERNAL_SERVICE_TOKEN }, redirect: "error", signal: AbortSignal.timeout(10000) });
    if (!response.ok) { await response.body?.cancel(); return false; }
    const state = await response.json() as { judge?: { heartbeatAgeSeconds?: number | null; circuitOpen?: boolean } };
    if (typeof state.judge?.heartbeatAgeSeconds !== "number" || state.judge.heartbeatAgeSeconds > 120 || state.judge.circuitOpen) return false;
    // Two observations reduce the chance of accepting a briefly healthy deployment.
    for (let i = 0; i < 2; i++) { if (signal.aborted || (await probeAll()).some(p => !p.ok)) return false; if (!i) await delay(3000, undefined, { signal }); } return true;
  }
  async revert(base: string, head: string) {
    if (await this.currentMain() !== head) throw new Error("MAIN_CHANGED");
    const original = await github<{ tree: { sha: string } }>(`${repo}/git/commits/${base}`);
    const reverted = await github<{ sha: string }>(`${repo}/git/commits`, "POST", { message: `revert: JudgeOps release ${head.slice(0, 12)} [skip ci]`, tree: original.tree.sha, parents: [head] });
    await this.publish(head, reverted.sha); return reverted.sha;
  }
  async restore(snapshot: DeploymentSnapshot, targets: ReleaseTargets, signal: AbortSignal) {
    // If a platform already retains the original artifact no rollback call is needed.
    const now = await this.capture();
    if (targets.api && now.api !== snapshot.api) await rollbackRailway(snapshot.api);
    if (targets.judge && now.judge !== snapshot.judge) await rollbackRailway(snapshot.judge);
    if (targets.web && now.web !== snapshot.web) {
      const r = await runProcess("vercel", ["rollback", snapshot.web, "--scope", VERCEL_TEAM, "--yes", "--timeout", "5m"], { signal, timeoutMs: 320000 });
      if (r.code) throw new Error("VERCEL_ROLLBACK_FAILED");
    }
  }
}
