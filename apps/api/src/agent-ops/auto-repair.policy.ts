import { opsAgentOutputSchema, opsEvidenceSchema, type OpsStep } from "@oj/shared";

type SourceReport = { id: string; kind: string; status: string; completedAt: Date | null; steps: unknown; evidence: unknown; incident: { id: string; code: string; title: string; recoveredAt: Date | null; lastSeenAt: Date } | null };
/** Reports may propose a repair; they never approve or deploy it. */
export function automaticRepairPayload(run: SourceReport, now = new Date()) {
  if (run.kind !== "INCIDENT" || run.status !== "COMPLETED" || !run.completedAt || !run.incident || run.incident.recoveredAt) return null;
  if (+now - +run.completedAt > 6 * 3600_000 || +now - +run.incident.lastSeenAt > 15 * 60_000 || +run.completedAt > +now) return null;
  const steps = run.steps as OpsStep[];
  if (!Array.isArray(steps) || steps.length !== 3 || steps[2]?.role !== "REVIEW") return null;
  const parsed = opsAgentOutputSchema.safeParse(steps[2].output);
  const evidence = opsEvidenceSchema.array().max(20).safeParse(run.evidence);
  if (!parsed.success || !evidence.success || parsed.data.review !== "SUPPORTED" || !parsed.data.actions.some(a => a.risk === "CHANGE_REQUIRED")) return null;
  const ids = new Set(evidence.data.map(e => e.id));
  if (!parsed.data.findings.length || parsed.data.findings.some(f => f.evidenceIds.some(id => !ids.has(id)))) return null;
  if (!evidence.data.some(e => +now - Date.parse(e.observedAt) <= 30 * 60_000 && Date.parse(e.observedAt) <= +now)) return null;
  return { automatic: true, incidentId: run.incident.id, incidentCode: run.incident.code, objective: `調查尚未恢復的事件：${run.incident.title}。先核對程式與證據；只有能重現的程式問題才提出修復。`, report: parsed.data, evidence: evidence.data, files: [] };
}
