import type { OperationalSnapshot } from "../operations/operations.service";
import type { OpsEvidence } from "@oj/shared";

export const OPS_ALERTS: Record<string, { title: string; severity: "HIGH" | "MEDIUM" }> = {
  FUNCTIONAL_VERIFICATION_FAILED: { title: "功能巡檢未通過", severity: "HIGH" },
  INDEPENDENT_MONITOR_ALERT: { title: "獨立監控偵測異常或資料過期", severity: "HIGH" },
  JUDGE_PENDING_OVER_5_MINUTES: { title: "提交等待超過五分鐘", severity: "HIGH" },
  JUDGE_QUEUE_BACKLOG: { title: "判題佇列累積", severity: "MEDIUM" },
  JUDGE_SYSTEM_ERROR_RATE: { title: "判題服務錯誤率升高", severity: "HIGH" },
  REFUND_MANUAL_REVIEW: { title: "退款需要人工確認", severity: "MEDIUM" },
  ACCOUNT_MAIL_DELIVERY_FAILED: { title: "帳號信件寄送失敗", severity: "MEDIUM" },
  RUN_QUEUE_WAIT_HIGH: { title: "執行或提交佇列等待過久", severity: "MEDIUM" },
  JUDGE_WORKER_UNREACHABLE: { title: "判題執行器心跳中斷", severity: "HIGH" },
  SANDBOX_CIRCUIT_OPEN: { title: "Sandbox 保護機制已啟動", severity: "HIGH" },
  RUN_SYSTEM_ERRORS: { title: "範例執行服務出現錯誤", severity: "HIGH" },
  REDIS_MEMORY_HIGH: { title: "Redis 記憶體用量偏高", severity: "MEDIUM" },
  OPS_SNAPSHOT_UNAVAILABLE: { title: "無法取得後端監控資料", severity: "HIGH" },
  PUBLIC_WEB_UNAVAILABLE: { title: "網站首頁無法正常回應", severity: "HIGH" },
};
export function taipeiDay(now = new Date()) { return new Date(+now + 8 * 3600_000).toISOString().slice(0, 10); }
export function dailyReportDue(now = new Date()) { return new Date(+now + 8 * 3600_000).getUTCHours() >= 9; }
const metric = (v: unknown): number | null => typeof v === "number" && Number.isFinite(v) ? v : null;
export function makeOpsEvidence(snapshot: OperationalSnapshot | null, web: { ok: boolean; status: number | null; durationMs: number }, now: Date): OpsEvidence[] {
  const observedAt = now.toISOString();
  const evidence: OpsEvidence[] = [{ id: "web", label: "網站首頁 HTTP 探測（不代表所有功能正常）", observedAt, data: { ok: web.ok, status: web.status, durationMs: web.durationMs } }];
  if (!snapshot) return [...evidence, { id: "operations", label: "後端營運指標", observedAt, data: { available: false } }];
  evidence.push({ id: "operations", label: "後端營運指標（最近 15 分鐘）", observedAt: snapshot.measuredAt, data: {
    available: true, completed: metric(snapshot.completedLast15m), systemErrors: metric(snapshot.systemErrorsLast15m), pending: metric(snapshot.pendingSubmissions), oldestPendingSeconds: metric(snapshot.oldestPendingSeconds), refundReviews: metric(snapshot.refundReviews), failedAuthMail: metric(snapshot.failedAuthMail), databaseConnections: metric(snapshot.databaseConnections),
  } });
  if (snapshot.judge) evidence.push({ id: "judge", label: "判題執行器與 Sandbox", observedAt: snapshot.measuredAt, data: {
    heartbeatAgeSeconds: metric(snapshot.judge.heartbeatAgeSeconds), rssMb: metric(snapshot.judge.rssMb), circuitOpen: snapshot.judge.circuitOpen,
    sandboxes: metric(snapshot.judge.sandboxes), runErrors15m: metric(snapshot.judge.runErrors15m), submitP95Ms: metric(snapshot.judge.submitP95Ms), runP95Ms: metric(snapshot.judge.runP95Ms), waitP95Ms: metric(snapshot.judge.waitP95Ms),
  } });
  if (snapshot.redis) evidence.push({ id: "redis", label: "Redis", observedAt, data: { usedMb: metric(snapshot.redis.usedMb), maxMb: metric(snapshot.redis.maxMb), clients: metric(snapshot.redis.clients) } });
  snapshot.queues.slice(0, 3).forEach((q, i) => evidence.push({ id: `queue-${i}`, label: `工作佇列 ${i + 1}`, observedAt, data: {
    waiting: metric(q.waiting), active: metric(q.active), delayed: metric(q.delayed), failedHistory: metric(q.failed), capacity: metric(q.capacity), concurrency: metric(q.concurrency), oldestWaitingSeconds: metric(q.oldestWaitingSeconds),
  } }));
  return evidence;
}
