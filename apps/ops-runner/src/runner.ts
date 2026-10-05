import { setTimeout as delay } from "node:timers/promises";
import { opsRoleForStep, type OpsClaim, type OpsCompleteInput } from "@oj/shared";
import { executeCodexStage, RunnerFailure } from "./codex.js";

export class TransportError extends Error { constructor(readonly status: number) { super(`HTTP ${status}`); } }
export type Transport = <T>(path: string, body?: unknown) => Promise<T>;
export function createTransport(origin: string, token: string): Transport {
  const url = new URL(origin);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" || !(url.protocol === "https:" || url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname))) throw new Error("JUDGEOPS_API_URL must be an HTTPS origin (HTTP is allowed only on localhost)");
  if (!/^jo_[a-f0-9]{64}$/.test(token)) throw new Error("Invalid JudgeOps executor token");
  return async <T>(path: string, body: unknown = {}) => {
    if (!/^\/(claim|runs\/[a-z0-9]+\/(heartbeat|steps|fail))$/.test(path)) throw new Error("Invalid runner route");
    const response = await fetch(`${url.origin}/internal/agent-ops${path}`, { method: "POST", redirect: "error", signal: AbortSignal.timeout(12_000), headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) { await response.body?.cancel(); throw new TransportError(response.status); }
    const text = await response.text();
    if (text.length > 200_000) throw new Error("Runner response too large");
    return JSON.parse(text) as T;
  };
}
type Execute = (task: OpsClaim, signal: AbortSignal) => Promise<OpsCompleteInput>;
export async function processTask(task: OpsClaim, transport: Transport, signal: AbortSignal, execute: Execute = executeCodexStage) {
  const controller = new AbortController();
  const stop = () => controller.abort(); signal.addEventListener("abort", stop, { once: true });
  if (signal.aborted) controller.abort();
  let ticking = false;
  const heartbeat = async () => {
    if (ticking || controller.signal.aborted) return;
    ticking = true;
    try { await transport(`/runs/${task.run.id}/heartbeat`, { lease: task.lease }); }
    catch { controller.abort(); }
    finally { ticking = false; }
  };
  await heartbeat();
  const timer = setInterval(() => void heartbeat(), 30_000); timer.unref();
  try {
    while (task.step < 3) {
      if (controller.signal.aborted) throw new RunnerFailure("INTERRUPTED");
      const result = await execute(task, controller.signal);
      if (controller.signal.aborted) throw new RunnerFailure("INTERRUPTED");
      // Retry reporting the same result, not the inference. Server receipts make this idempotent.
      for (let attempt = 0; ; attempt++) {
        try { await transport(`/runs/${task.run.id}/steps`, result); break; }
        catch (error) {
          if (attempt >= 2 || error instanceof TransportError && error.status < 500) throw error;
          await delay(1000 * (attempt + 1), undefined, { signal: controller.signal });
        }
      }
      task.run.steps.push({ role: task.role, output: result.output, model: result.model, inputTokens: result.inputTokens, outputTokens: result.outputTokens, completedAt: new Date().toISOString() });
      task.step++;
      if (task.step < 3) task.role = opsRoleForStep(task.step, task.run.steps);
    }
    return "COMPLETED";
  } catch (error) {
    const code = error instanceof RunnerFailure ? error.code : "EXECUTOR_ERROR";
    try { await transport(`/runs/${task.run.id}/fail`, { lease: task.lease, code }); } catch { /* Lease takeover/cancellation is authoritative. */ }
    return code;
  } finally { clearInterval(timer); signal.removeEventListener("abort", stop); }
}
