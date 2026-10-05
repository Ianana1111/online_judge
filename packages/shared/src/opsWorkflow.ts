import { z } from "zod";
const text = (max: number) => z.string().trim().min(1).max(max);
export const opsTaskKindSchema = z.enum(["VERIFY", "REPAIR", "EVALUATE", "RELEASE"]);
export type OpsTaskKind = z.infer<typeof opsTaskKindSchema>;
export const opsSourcePathSchema = z.string().max(180).regex(/^(apps\/(web|api|judge)\/(app|components|lib|store|src)\/|packages\/shared\/src\/|tests\/)[a-zA-Z0-9_./[\]()-]+\.(tsx?|mjs)$/)
  .refine(p => !p.split("/").some(s => s === "." || s === "..") && !/(agent-ops|opsWorkflow|agentOps|runtime-config|\.test\.)/.test(p), "Select application source files, not orchestration or tests");
export const opsTaskCreateSchema = z.object({
  kind: z.enum(["VERIFY", "REPAIR", "EVALUATE"]), requestId: z.string().uuid(),
  sourceRunId: z.string().cuid().optional(), objective: text(2000).optional(), files: z.array(opsSourcePathSchema).min(1).max(4).optional(),
}).strict().superRefine((v, ctx) => { if (v.kind === "REPAIR" && (!v.objective || !v.files)) ctx.addIssue({ code: "custom", message: "修復需要重現描述及 1–4 個來源檔案" }); });
export const opsCheckSchema = z.object({ name: text(100), status: z.enum(["PASS", "FAIL", "SKIP"]), durationMs: z.number().int().nonnegative(), detail: z.string().max(1800) }).strict();
export type OpsCheck = z.infer<typeof opsCheckSchema>;
export const opsArtifactSchema = z.object({ name: text(100), sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().min(0).max(100_000_000) }).strict();
export const opsWorkflowResultSchema = z.object({
  summary: text(2400), outcome: z.enum(["PASS", "FAIL", "NEEDS_INPUT", "READY", "RELEASED", "ROLLED_BACK"]),
  checks: z.array(opsCheckSchema).max(60), artifacts: z.array(opsArtifactSchema).max(20),
  baseSha: z.string().regex(/^[a-f0-9]{40}$/).optional(), headSha: z.string().regex(/^[a-f0-9]{40}$/).optional(),
  patchHash: z.string().regex(/^[a-f0-9]{64}$/).optional(), branch: z.string().regex(/^judgeops\/[a-z0-9-]+$/).max(100).optional(),
  pullNumber: z.number().int().positive().optional(), pullUrl: z.string().url().refine(v => /^https:\/\/github.com\/Ianana1111\/online_judge\/pull\/\d+$/.test(v)).optional(),
  review: z.enum(["APPROVED", "REJECTED", "NOT_REVIEWED"]),
  inputTokens: z.number().int().nonnegative(), outputTokens: z.number().int().nonnegative(), modelCalls: z.number().int().min(0).max(12),
  metrics: z.record(z.union([z.string().max(200), z.number().finite(), z.boolean(), z.null()])).refine(v => Object.keys(v).length <= 60),
}).strict();
export type OpsWorkflowResult = z.infer<typeof opsWorkflowResultSchema>;
export const opsTaskEventSchema = z.object({ sequence: z.number().int().min(0).max(40), label: text(120), detail: text(1800), data: z.record(z.union([z.string().max(300), z.number().finite(), z.boolean(), z.null()])).refine(v => Object.keys(v).length <= 20).default({}) }).strict();
export type OpsTaskEvent = z.infer<typeof opsTaskEventSchema> & { at: string };
export type OpsWorkflowTask = { id: string; kind: OpsTaskKind; status: string; title: string; createdAt: string; completedAt: string | null; sourceRunId: string | null; payload: Record<string, unknown>; events: OpsTaskEvent[]; result: OpsWorkflowResult | null; errorCode: string | null; approvalDigest: string | null; approvedAt: string | null; attempts: number };
export type OpsWorkflowClaim = { task: OpsWorkflowTask; lease: string; leaseSeconds: number };
export type OpsWorkflowDashboard = { tasks: OpsWorkflowTask[]; monitorUrl: string | null; enabled: boolean; autoVerify: boolean; latestVerification: OpsWorkflowTask | null; evaluation: OpsWorkflowTask | null; approvedReleases: number; revertedReleases: number };
export const OPS_AI_TASK_UNITS: Record<OpsTaskKind, number> = { VERIFY: 0, REPAIR: 1, EVALUATE: 3, RELEASE: 0 };
export const REQUIRED_REPAIR_CHECKS = ["regression-proof", "full-suite", "qa-review", "security-review"] as const;
export function repairReady(result: OpsWorkflowResult) {
  return result.outcome === "READY" && result.review === "APPROVED" && !!result.baseSha && !!result.headSha && result.baseSha !== result.headSha && !!result.patchHash && !!result.branch && !!result.pullNumber && result.pullUrl === `https://github.com/Ianana1111/online_judge/pull/${result.pullNumber}` && result.checks.every(c => c.status === "PASS") && REQUIRED_REPAIR_CHECKS.every(name => result.checks.filter(c => c.name === name && c.status === "PASS").length === 1);
}
