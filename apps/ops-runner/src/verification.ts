import { join } from "node:path";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import type { OpsWorkflowResult, OpsCheck } from "@oj/shared";
import { probeAll } from "../../ops-monitor/src/probes.mjs";
import { ensureCheckImage, runSandbox, artifact } from "./sandbox.js";
import { runProcess } from "./process.js";
import { railwayVariables } from "./provider-config.js";
export type Progress = (label: string, detail: string, data?: Record<string, string | number | boolean | null>) => Promise<void>;
export function emptyResult(summary: string): OpsWorkflowResult { return { summary, outcome: "PASS", checks: [], artifacts: [], review: "NOT_REVIEWED", inputTokens: 0, outputTokens: 0, modelCalls: 0, metrics: {} }; }
export async function verifyLiveJudge(image: string, signal: AbortSignal): Promise<OpsCheck[]> {
  const [judge, db, redis] = await Promise.all([railwayVariables("judge"), railwayVariables("Postgres"), railwayVariables("Redis")]);
  const env: NodeJS.ProcessEnv = { NODE_ENV: "test", JUDGEOPS_LIVE_CANARY: "1", JUDGE_POOL_SIZE: "0", DATABASE_URL: db.DATABASE_PUBLIC_URL, REDIS_URL: redis.REDIS_PUBLIC_URL };
  for (const key of ["VERCEL_TOKEN", "VERCEL_PROJECT_ID", "VERCEL_TEAM_ID", "JUDGE_SANDBOX_SNAPSHOT_ID"]) env[key] = judge[key];
  if (["DATABASE_URL", "REDIS_URL", "VERCEL_TOKEN", "JUDGE_SANDBOX_SNAPSHOT_ID"].some(k => !env[k])) throw new Error("CANARY_CONFIGURATION_MISSING");
  const directory = await mkdtemp(join(tmpdir(), "judgeops-canary-")), name = `judgeops-canary-${randomUUID()}`;
  try {
    const file = join(directory, ".env");
    if (Object.values(env).some(v => /[\r\n]/.test(v ?? ""))) throw new Error("Invalid canary environment");
    await writeFile(file, Object.entries(env).map(([k, v]) => `${k}=${v}`).join("\n"), { mode: 0o600 });
    const response = await runProcess("docker", ["run", "--name", name, "--read-only", "--cap-drop=ALL", "--security-opt=no-new-privileges", "--pids-limit=128", "--memory=768m", "--cpus=1", "--tmpfs", "/tmp:rw,size=64m,mode=1777", "--env-file", file, "--entrypoint", "node", image, "--import", "/opt/oj/packages/db/node_modules/tsx/dist/loader.mjs", "/opt/oj/scripts/operations/live-judge-canary.ts"], { signal, timeoutMs: 15 * 60_000 });
    const line = response.stdout.split("\n").reverse().find(l => { try { return JSON.parse(l).event === "judgeops-canary"; } catch { return false; } });
    if (!line) throw new Error("CANARY_INCOMPLETE"); return JSON.parse(line).checks;
  } finally { await runProcess("docker", ["rm", "-f", name]).catch(() => {}); await rm(directory, { recursive: true, force: true }); }
}
export async function verification(source: string, commit: string, directory: string, signal: AbortSignal, progress: Progress): Promise<OpsWorkflowResult> {
  const result = emptyResult("功能巡檢完成；各檢查的範圍與結果如下。");
  await progress("PUBLIC_PROBES", "從獨立執行環境檢查公開端點與權限。");
  result.checks.push(...(await probeAll()).map(p => ({ name: `public-${p.id}`, status: p.ok ? "PASS" as const : "FAIL" as const, durationMs: p.latencyMs, detail: `${p.name}: HTTP ${p.httpStatus ?? "unreachable"}` })));
  await progress("ISOLATED_TESTS", "在無外部網路、無正式密鑰的容器執行資料庫、HTTP、瀏覽器與安全測試。");
  const image = await ensureCheckImage(source, commit, signal);
  const isolated = await runSandbox(image, source, directory, "full", signal);
  result.checks.push(...isolated.checks);
  await progress("LIVE_JUDGE", "以固定測試程式驗證四種語言的正式判題核心和 Vercel Sandbox，最多 10 次。");
  try { result.checks.push(...await verifyLiveJudge(image, signal)); }
  catch { result.checks.push({ name: "live-judge", status: "FAIL", durationMs: 0, detail: "正式判題巡檢未能完成；請核對本機 Railway 登入與 Sandbox 設定。" }); }
  result.checks.push({ name: "manual-provider-acceptance", status: "SKIP", durationMs: 0, detail: "Google 真人授權、真實付款扣款與外部信箱收件需要人工驗收。自動測試涵蓋 OAuth 狀態、金流簽章／回呼／權限及信箱驗證邏輯，不代表外部實際交易完成。" });
  result.outcome = result.checks.some(c => c.status === "FAIL") ? "FAIL" : "PASS";
  result.metrics = { sourceCommit: commit, passed: result.checks.filter(c => c.status === "PASS").length, failed: result.checks.filter(c => c.status === "FAIL").length, skipped: result.checks.filter(c => c.status === "SKIP").length };
  await writeFile(join(directory, "verification.json"), JSON.stringify(result, null, 2)); result.artifacts.push(await artifact(directory, "verification.json")); return result;
}
