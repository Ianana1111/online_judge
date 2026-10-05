import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { processWorkflow } from "./workflow.js";
import { selectedOpsModel } from "./model.js";
import type { OpsWorkflowClaim, OpsClaim } from "@oj/shared";
import { checkCodexAuth, executeCodexStage, RunnerFailure } from "./codex.js";
import { createTransport, processTask, TransportError } from "./runner.js";

const stop = new AbortController();
process.once("SIGINT", () => stop.abort()); process.once("SIGTERM", () => stop.abort());
async function main() {
  selectedOpsModel(process.env.JUDGEOPS_CODEX_MODEL);
  await checkCodexAuth();
  if (process.argv.includes("--check")) { console.log("Codex ChatGPT authentication: OK. No model request made."); return; }
  const api = process.env.JUDGEOPS_API_URL ?? "https://api.judge.tw";
  const token = process.env.JUDGEOPS_RUNNER_TOKEN ?? "";
  const transport = createTransport(api, token);
  const once = process.argv.includes("--once");
  console.log("JudgeOps executor started. ChatGPT authentication; GPT-6 Sol / high; no API fallback; production releases require exact revision approval.");
  while (!stop.signal.aborted) {
    let wait = 30;
    try {
      await checkCodexAuth();
      if (process.env.JUDGEOPS_WORKFLOWS_ENABLED === "true") {
        const workflow = await transport<{ task: OpsWorkflowClaim | null }>("/tasks/claim");
        if (workflow.task) {
          const id = workflow.task.task.id;
          console.log(JSON.stringify({ event: "workflow_claimed", id, kind: workflow.task.task.kind }));
          const result = await processWorkflow(workflow.task, transport, resolve(process.env.JUDGEOPS_RUNTIME_DIR ?? fileURLToPath(new URL("../runtime", import.meta.url))), stop.signal);
          console.log(JSON.stringify({ event: "workflow_finished", id, result }));
          if (once || ["QUOTA", "AUTH"].includes(result)) break;
          continue;
        }
      }
      const { task, retryAfterSeconds, reason } = await transport<{ task: OpsClaim | null; retryAfterSeconds: number; reason?: string }>("/claim");
      wait = Math.max(10, Math.min(300, retryAfterSeconds));
      if (task) {
        console.log(JSON.stringify({ event: "task_claimed", id: task.run.id, step: task.step }));
        const result = await processTask(task, transport, stop.signal, (t, signal) => executeCodexStage(t, signal, { model: process.env.JUDGEOPS_CODEX_MODEL }));
        console.log(JSON.stringify({ event: "task_finished", id: task.run.id, result }));
        if (["QUOTA", "AUTH"].includes(result)) break;
      } else if (once) console.log(JSON.stringify({ event: "no_task", reason }));
    } catch (error) {
      if (error instanceof RunnerFailure && error.code === "AUTH") { console.error("Codex ChatGPT sign-in is required. Run codex login and restart."); process.exitCode = 1; return; }
      if (error instanceof TransportError && [401, 403].includes(error.status)) { console.error("JudgeOps executor credential was rejected. Check expiration or revocation in the admin console."); process.exitCode = 1; return; }
      console.error("JudgeOps API unavailable; retrying without calling the model.");
    }
    if (once || stop.signal.aborted) break;
    await delay(wait * 1000, undefined, { signal: stop.signal }).catch(() => {});
  }
}
main().catch(error => { console.error(error instanceof RunnerFailure ? `Codex preflight failed: ${error.code}` : "JudgeOps could not start. Check local configuration."); process.exitCode = 1; });
