import { z } from "zod";

export const opsSpecialistSchema = z.enum(["SRE", "JUDGE", "ENGINEER"]);
export const opsRoleSchema = z.enum(["TRIAGE", "SRE", "JUDGE", "ENGINEER", "REVIEW"]);
export type OpsRole = z.infer<typeof opsRoleSchema>;
const text = (max: number) => z.string().trim().min(1).max(max);
export const opsAgentOutputSchema = z.object({
  summary: text(1600),
  specialist: opsSpecialistSchema,
  findings: z.array(z.object({ text: text(900), evidenceIds: z.array(text(80)).min(1).max(8) }).strict()).max(10),
  hypotheses: z.array(text(900)).max(6),
  actions: z.array(z.object({ title: text(160), detail: text(1200), risk: z.enum(["READ_ONLY", "CHANGE_REQUIRED"]) }).strict()).max(6),
  limitations: z.array(text(600)).max(8),
  review: z.enum(["NOT_REVIEWED", "SUPPORTED", "NEEDS_EVIDENCE"]),
}).strict();
export type OpsAgentOutput = z.infer<typeof opsAgentOutputSchema>;
// Kept alongside the runtime validator: CLI output is never trusted without parsing again.
const jsText = { type: "string" };
export const OPS_OUTPUT_JSON_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    summary: jsText, specialist: { type: "string", enum: ["SRE", "JUDGE", "ENGINEER"] },
    findings: { type: "array", items: { type: "object", additionalProperties: false, properties: { text: jsText, evidenceIds: { type: "array", items: jsText } }, required: ["text", "evidenceIds"] } },
    hypotheses: { type: "array", items: jsText },
    actions: { type: "array", items: { type: "object", additionalProperties: false, properties: { title: jsText, detail: jsText, risk: { type: "string", enum: ["READ_ONLY", "CHANGE_REQUIRED"] } }, required: ["title", "detail", "risk"] } },
    limitations: { type: "array", items: jsText }, review: { type: "string", enum: ["NOT_REVIEWED", "SUPPORTED", "NEEDS_EVIDENCE"] },
  }, required: ["summary", "specialist", "findings", "hypotheses", "actions", "limitations", "review"],
} as const;
export const opsEvidenceSchema = z.object({ id: text(80), label: text(160), observedAt: z.string().datetime(), data: z.record(z.union([z.string().max(160), z.number().finite(), z.boolean(), z.null()])).refine(v => Object.keys(v).length <= 80) }).strict();
export type OpsEvidence = z.infer<typeof opsEvidenceSchema>;
export const opsFailureSchema = z.enum(["QUOTA", "AUTH", "TIMEOUT", "INVALID_OUTPUT", "EXECUTOR_ERROR", "INTERRUPTED"]);
export type OpsFailure = z.infer<typeof opsFailureSchema>;
export const opsSettingsSchema = z.object({ dispatchEnabled: z.boolean(), dailyRunLimit: z.number().int().min(1).max(20) }).strict();
export const opsCredentialSchema = z.object({ name: text(60) }).strict();
export const opsManualSchema = z.object({ requestId: z.string().uuid() }).strict();
export const opsLeaseSchema = z.object({ lease: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const opsCompleteSchema = opsLeaseSchema.extend({
  step: z.number().int().min(0).max(2), output: opsAgentOutputSchema,
  inputTokens: z.number().int().min(0).max(10_000_000), outputTokens: z.number().int().min(0).max(1_000_000),
  model: text(100),
}).strict();
export const opsFailSchema = opsLeaseSchema.extend({ code: opsFailureSchema }).strict();
export type OpsCompleteInput = z.infer<typeof opsCompleteSchema>;
export type OpsStep = { role: OpsRole; output: OpsAgentOutput; inputTokens: number; outputTokens: number; model: string; completedAt: string };
export type OpsRun = {
  id: string; kind: string; title: string; status: string; incidentId: string | null;
  createdAt: string; startedAt: string | null; completedAt: string | null; availableAt: string;
  errorCode: string | null; attempts: number; steps: OpsStep[]; evidence: OpsEvidence[];
};
export type OpsClaim = { run: OpsRun; lease: string; leaseSeconds: number; role: OpsRole; step: number };
export const OPS_FAILURE_LABELS: Record<OpsFailure | "LEASE_EXPIRED", string> = {
  QUOTA: "Codex 額度不足，已暫停；額度恢復後可重試", AUTH: "Codex 登入需要更新，已暫停",
  TIMEOUT: "調查逾時", INVALID_OUTPUT: "回覆未通過格式或證據檢查", EXECUTOR_ERROR: "執行器發生錯誤",
  INTERRUPTED: "執行器已中斷", LEASE_EXPIRED: "執行器失去連線，任務租約已到期",
};
export type OpsDashboard = {
  measuredAt: string; settings: { dispatchEnabled: boolean; dailyRunLimit: number };
  monitor: { enabled: boolean; lastCollectedAt: string | null; error: boolean; healthy: boolean | null };
  counts: { openIncidents: number; queued: number; running: number; paused: number; completed24h: number; startsToday: number };
  credentials: { id: string; name: string; createdAt: string; expiresAt: string; lastSeenAt: string | null; revokedAt: string | null }[];
  incidents: { id: string; code: string; title: string; severity: string; firstSeenAt: string; lastSeenAt: string; recoveredAt: string | null }[];
  runs: OpsRun[];
};
export function opsRoleForStep(step: number, steps: OpsStep[]): OpsRole {
  if (step === 0) return "TRIAGE";
  if (step === 1) return opsAgentOutputSchema.parse(steps[0]?.output).specialist;
  if (step === 2) return "REVIEW";
  throw new Error("Invalid agent step");
}
export function validateOpsEvidence(output: OpsAgentOutput, evidence: OpsEvidence[], role: OpsRole) {
  const ids = new Set(evidence.map(e => e.id));
  if (output.findings.some(f => f.evidenceIds.some(id => !ids.has(id)))) throw new Error("Unknown evidence reference");
  if (role === "REVIEW" ? output.review === "NOT_REVIEWED" : output.review !== "NOT_REVIEWED") throw new Error("Invalid review stage");
  if (output.review === "SUPPORTED" && output.findings.length === 0) throw new Error("Supported report requires evidence");
}
