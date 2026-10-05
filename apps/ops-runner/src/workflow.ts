import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { opsWorkflowResultSchema, type OpsWorkflowClaim, type OpsWorkflowResult } from "@oj/shared";
import { RunnerFailure } from "./codex.js";
import { type Transport, TransportError } from "./runner.js";
import { git, workspace } from "./repository.js";
import { verification, type Progress } from "./verification.js";
import { repair } from "./repair.js";
import { evaluation } from "./evaluation.js";
import { release } from "./release.js";
import { ProductionReleaseProvider } from "./release-provider.js";
export type WorkflowExecute = (claim: OpsWorkflowClaim, runtime: string, signal: AbortSignal, progress: Progress) => Promise<OpsWorkflowResult>;
export const executeWorkflow: WorkflowExecute = async (claim, runtime, signal, progress) => {
  const task = claim.task, directory = join(runtime, `artifacts-${task.id}`);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  if (task.kind === "EVALUATE") return evaluation(directory, signal, progress);
  const work = await workspace(runtime, task.id);
  try {
    await progress("SOURCE", "已建立獨立工作目錄，使用固定來源版本。", { commit: work.baseSha });
    if (task.kind === "VERIFY") return await verification(work.directory, work.baseSha, directory, signal, progress);
    if (task.kind === "REPAIR") return await repair(work.directory, work.baseSha, task.id, task.payload, directory, signal, progress);
    if (!task.approvedAt || !task.approvalDigest || task.approvalDigest !== task.payload.digest) throw new Error("INVALID_APPROVAL");
    return await release(work.directory, task.payload, directory, signal, progress, new ProductionReleaseProvider());
  } finally {
    // Keep failed repair source for inspection; always retain hashed reports and test logs.
    if (task.kind !== "REPAIR") await git(work.mirror, ["worktree", "remove", "--force", work.directory]).catch(() => {});
  }
};
export async function processWorkflow(claim: OpsWorkflowClaim, transport: Transport, runtime: string, signal: AbortSignal, execute: WorkflowExecute = executeWorkflow) {
  const control = new AbortController(); const stop = () => control.abort();
  signal.addEventListener("abort", stop, { once: true }); if (signal.aborted) control.abort();
  const route = `/tasks/${claim.task.id}`; let ticking = false, sequence = claim.task.events.length;
  const heartbeat = async () => { if (ticking || control.signal.aborted) return; ticking = true; try { await transport(`${route}/heartbeat`, { lease: claim.lease }); } catch { control.abort(); } finally { ticking = false; } };
  const retryReceipt = async (path: string, body: unknown) => {
    for (let i = 0; ; i++) { try { return await transport(path, body); } catch (e) { if (i >= 2 || e instanceof TransportError && e.status < 500) throw e; await delay((i + 1) * 1000, undefined, { signal: control.signal }); } }
  };
  const progress: Progress = async (label, detail, data = {}) => {
    if (control.signal.aborted) throw new RunnerFailure("INTERRUPTED");
    await retryReceipt(`${route}/events`, { lease: claim.lease, event: { sequence, label, detail, data } }); sequence++;
  };
  await heartbeat(); const timer = setInterval(() => void heartbeat(), 30_000); timer.unref();
  try {
    if (control.signal.aborted) throw new RunnerFailure("INTERRUPTED");
    const result = opsWorkflowResultSchema.parse(await execute(claim, runtime, control.signal, progress));
    // Persist before reporting; a lost API acknowledgement must not repeat inference or deployment.
    await mkdir(runtime, { recursive: true, mode: 0o700 });
    await writeFile(join(runtime, `result-${claim.task.id}.json`), JSON.stringify(result, null, 2), { mode: 0o600 });
    if (control.signal.aborted) throw new RunnerFailure("INTERRUPTED");
    await retryReceipt(`${route}/complete`, { lease: claim.lease, result }); return result.outcome;
  } catch (error) {
    const code = error instanceof RunnerFailure ? error.code : "EXECUTOR_ERROR";
    console.error(JSON.stringify({ event: "workflow_error", id: claim.task.id, code, reason: error instanceof Error && /^[A-Z_]{3,80}$/.test(error.message) ? error.message : "See last workflow checkpoint" }));
    await transport(`${route}/fail`, { lease: claim.lease, code }).catch(() => {}); return code;
  } finally { clearInterval(timer); signal.removeEventListener("abort", stop); }
}
