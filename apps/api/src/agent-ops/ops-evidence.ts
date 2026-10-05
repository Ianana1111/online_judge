import { z } from "zod";
import { opsWorkflowResultSchema, type OpsEvidence } from "@oj/shared";
export function verificationEvidence(task: { completedAt: Date | null; result: unknown } | null, now: Date): OpsEvidence {
  const result = opsWorkflowResultSchema.safeParse(task?.result);
  return { id: "functional-verification", label: "隔離功能測試與正式判題核心巡檢（不含真人付款／收信）", observedAt: task?.completedAt?.toISOString() ?? now.toISOString(), data: {
    available: !!task?.completedAt && result.success, ageSeconds: task?.completedAt ? Math.max(0, Math.floor((+now - +task.completedAt) / 1000)) : null,
    outcome: result.success ? result.data.outcome : null, passed: result.success ? result.data.checks.filter(c => c.status === "PASS").length : null,
    failed: result.success ? result.data.checks.filter(c => c.status === "FAIL").length : null, skipped: result.success ? result.data.checks.filter(c => c.status === "SKIP").length : null,
  } };
}
export async function independentEvidence(url: string, now: Date): Promise<OpsEvidence> {
  const output: OpsEvidence = { id: "independent-monitor", label: "Google Cloud 獨立端點探測", observedAt: now.toISOString(), data: { status: "UNKNOWN", available: false } };
  if (!/^https:\/\/[a-z0-9.-]+\.run\.app\/?$/.test(url)) return output;
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/status`, { redirect: "error", signal: AbortSignal.timeout(5000) });
    const reader = response.body?.getReader(); if (!reader) return output;
    const chunks: Uint8Array[] = []; let size = 0;
    try { while (true) { const r = await reader.read(); if (r.done) break; size += r.value.length; if (size > 64000) throw new Error("Too large"); chunks.push(r.value); } } finally { await reader.cancel().catch(() => {}); }
    const state = z.object({ status: z.enum(["HEALTHY", "INCIDENT", "CHECKING", "STALE", "UNKNOWN"]), checkedAt: z.string().datetime().nullable(), checks: z.array(z.object({ status: z.string() })).max(12), incidents: z.array(z.object({ recoveredAt: z.string().nullable() })).max(100) }).parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    const stale = !state.checkedAt || +now - Date.parse(state.checkedAt) > 15 * 60_000;
    output.observedAt = state.checkedAt ?? now.toISOString(); output.data = { available: !stale, status: stale ? "STALE" : state.status, failed: state.checks.filter(c => c.status === "FAIL").length, openIncidents: state.incidents.filter(i => !i.recoveredAt).length };
  } catch { /* Never attach remote body/error text to model evidence. */ }
  return output;
}
