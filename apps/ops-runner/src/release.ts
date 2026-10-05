import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { opsWorkflowResultSchema, opsSourcePathSchema, repairReady, type OpsWorkflowResult } from "@oj/shared";
import { git, github, REPOSITORY, sha256 } from "./repository.js";
import { emptyResult, type Progress } from "./verification.js";
import { artifact } from "./sandbox.js";
export type DeploymentSnapshot = { api: string; judge: string; web: string };
export type ReleaseTargets = { api: boolean; judge: boolean; web: boolean };
export interface ReleaseProvider {
  currentMain(): Promise<string>;
  capture(): Promise<DeploymentSnapshot>;
  publish(base: string, head: string): Promise<void>;
  deploy(sha: string, targets: ReleaseTargets, signal: AbortSignal): Promise<DeploymentSnapshot>;
  healthy(signal: AbortSignal): Promise<boolean>;
  revert(base: string, head: string): Promise<string>;
  restore(snapshot: DeploymentSnapshot, targets: ReleaseTargets, signal: AbortSignal): Promise<void>;
}
export function releaseTargets(paths: string[]): ReleaseTargets {
  const shared = paths.some(p => p.startsWith("packages/"));
  return { api: shared || paths.some(p => p.startsWith("apps/api/")), judge: shared || paths.some(p => p.startsWith("apps/judge/")), web: shared || paths.some(p => p.startsWith("apps/web/")) };
}
export async function releaseFlow(approved: OpsWorkflowResult, targets: ReleaseTargets, provider: ReleaseProvider, signal: AbortSignal, progress: Progress): Promise<OpsWorkflowResult> {
  if (!repairReady(approved)) throw new Error("RELEASE_NOT_APPROVED");
  const base = approved.baseSha!, head = approved.headSha!;
  const result = emptyResult("準備發布已批准版本"); result.baseSha = base; result.headSha = head; result.patchHash = approved.patchHash;
  if (await provider.currentMain() !== base) { result.outcome = "NEEDS_INPUT"; result.summary = "主分支已更新，請以新版本重新修復、驗證及批准。"; return result; }
  const previous = await provider.capture();
  // Must be persisted remotely before the first mutation. These identifiers are not credentials.
  await progress("RELEASE_CHECKPOINT", "已保存原部署版本；即將發布精確批准的 commit。", { base, head, ...previous });
  let published = false;
  try {
    if (signal.aborted) throw new Error("INTERRUPTED");
    // A failed network response is ambiguous. Reconcile the ref before deciding whether rollback is required.
    try { await provider.publish(base, head); published = true; }
    catch (error) { published = await provider.currentMain() === head; throw error; }
    await progress("DEPLOYING", "等待 Railway 與 Vercel 完成此版本的建置。", { head });
    const deployed = await provider.deploy(head, targets, signal);
    if (!await provider.healthy(signal)) throw new Error("SMOKE_FAILED");
    result.metrics = { ...deployed }; result.outcome = "RELEASED"; result.summary = "已發布你批准的精確版本，公開功能探測通過。";
    result.checks.push({ name: "production-smoke", status: "PASS", durationMs: 0, detail: "版本已核對，公開端點與權限探測通過。" });
  } catch {
    if (!published) { result.outcome = "NEEDS_INPUT"; result.summary = "發布未確認完成；請核對 GitHub main 與部署檢查點，不會盲目重試。"; return result; }
    if (signal.aborted) { result.outcome = "NEEDS_INPUT"; result.summary = "發布中斷或租約遺失；請依檢查點核對目前部署，執行器已停止後續修改。"; return result; }
    if (await provider.currentMain() !== head) { result.outcome = "NEEDS_INPUT"; result.summary = "發布後主分支又有新版本，未覆寫其他人的更新。請核對部署並決定復原版本。"; return result; }
    await progress("ROLLBACK", "新版本未通過部署驗證，開始回復批准前的程式樹與部署。", previous);
    try {
      const revert = await provider.revert(base, head); result.metrics.rollbackCommit = revert;
      // Restore retained artifacts immediately, then settle the automatic builds of the revert commit.
      await provider.restore(previous, targets, signal);
      const restored = await provider.deploy(revert, targets, signal);
      if (!await provider.healthy(signal)) throw new Error("ROLLBACK_SMOKE_FAILED");
      result.outcome = "ROLLED_BACK"; result.summary = "新版本驗證失敗；已回復原程式樹，復原部署與公開探測均通過。"; Object.assign(result.metrics, restored);
      result.checks.push({ name: "rollback-smoke", status: "PASS", durationMs: 0, detail: "Git 保留復原紀錄，部署與公開端點已核對。" });
    } catch { result.outcome = "NEEDS_INPUT"; result.summary = "自動復原未能完整確認，請立即依部署檢查點人工核對。工作已停止，不會自動重播。"; }
  }
  return result;
}
export async function release(source: string, payload: Record<string, unknown>, directory: string, signal: AbortSignal, progress: Progress, provider: ReleaseProvider) {
  const approved = opsWorkflowResultSchema.parse(payload.result);
  if (!repairReady(approved) || typeof payload.digest !== "string" || !/^[a-f0-9]{64}$/.test(payload.digest)) throw new Error("INVALID_APPROVAL");
  const pr = await github<{ state: string; head: { sha: string; ref: string }; base: { ref: string } }>(`/repos/${REPOSITORY}/pulls/${approved.pullNumber}`);
  if (pr.state !== "open" || pr.head.sha !== approved.headSha || pr.head.ref !== approved.branch || pr.base.ref !== "main") throw new Error("PULL_REQUEST_CHANGED");
  await git(source, ["fetch", "origin", `refs/heads/${approved.branch}`]);
  if (await git(source, ["rev-parse", "FETCH_HEAD"]) !== approved.headSha) throw new Error("APPROVED_COMMIT_CHANGED");
  if (await git(source, ["rev-parse", `${approved.headSha}^`]) !== approved.baseSha) throw new Error("INVALID_REPAIR_PARENT");
  const patch = await git(source, ["diff", "--no-ext-diff", "--binary", approved.baseSha!, approved.headSha!]);
  if (sha256(patch) !== approved.patchHash) throw new Error("APPROVED_PATCH_CHANGED");
  const paths = (await git(source, ["diff", "--name-only", approved.baseSha!, approved.headSha!])).split("\n");
  const expectedTest = `tests/ops-regression-${payload.repairTaskId}.test.ts`;
  if (!paths.includes(expectedTest) || paths.some(p => p !== expectedTest && !opsSourcePathSchema.safeParse(p).success)) throw new Error("PROTECTED_RELEASE_PATH");
  const result = await releaseFlow(approved, releaseTargets(paths), provider, signal, progress);
  await writeFile(join(directory, "release.json"), JSON.stringify(result, null, 2), { mode: 0o600 }); result.artifacts.push(await artifact(directory, "release.json")); return result;
}
