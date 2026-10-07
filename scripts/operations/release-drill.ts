/** Exercise the real release state machine against disposable Cloud Run revisions and local Git refs. */
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { opsWorkflowResultSchema, repairReady } from "../../packages/shared/src/opsWorkflow";
import { releaseFlow, type ReleaseProvider, type DeploymentSnapshot } from "../../apps/ops-runner/src/release";
import { git, github, REPOSITORY, SOURCE_REMOTE } from "../../apps/ops-runner/src/repository";
import { runProcess } from "../../apps/ops-runner/src/process";

if (!process.argv[2]) throw new Error("Pass the result.json of a real, verified repair PR");
const approved = opsWorkflowResultSchema.parse(JSON.parse(await readFile(resolve(process.argv[2]), "utf8")));
if (!repairReady(approved)) throw new Error("VERIFIED_REPAIR_REQUIRED");
const pr = await github<{ head: { sha: string } }>(`/repos/${REPOSITORY}/pulls/${approved.pullNumber}`);
if (pr.head.sha !== approved.headSha) throw new Error("PULL_REQUEST_CHANGED");
const deployed = JSON.parse(await readFile("generated/judgeops/gcp-monitor.json", "utf8"));
const { project, region, image, bucket } = deployed;
if (project !== "judge-510903" || region !== "asia-east1" || !image.startsWith(`${region}-docker.pkg.dev/${project}/judgeops/`)) throw new Error("UNEXPECTED_DRILL_TARGET");
const service = `judgeops-release-drill-${randomBytes(3).toString("hex")}`;
const temporary = await mkdtemp(join(tmpdir(), "judgeops-release-drill-"));
const directory = resolve("generated/judgeops", service); await mkdir(directory, { recursive: true, mode: 0o700 });
const signal = AbortSignal.timeout(20 * 60_000), events: unknown[] = [];
const progress = async (label: string, detail: string, data = {}) => { const event = { at: new Date().toISOString(), label, detail, data }; events.push(event); await writeFile(join(directory, "events.json"), JSON.stringify(events, null, 2), { mode: 0o600 }); console.log(JSON.stringify(event)); };
async function gcloud(args: string[], cleanup = false) {
  const result = await runProcess("gcloud", [...args, "--project", project, "--quiet"], { ...(cleanup ? {} : { signal }), timeoutMs: 360_000, maxBytes: 30_000 });
  if (result.code) throw new Error("DRILL_GCLOUD_FAILED"); return result.stdout.trim();
}
const describe = async () => JSON.parse(await gcloud(["run", "services", "describe", service, "--region", region, "--format=json"]));
const snapshot = async (): Promise<DeploymentSnapshot> => { const s = await describe(), revision = s.status.traffic.find((t: { percent: number }) => t.percent === 100)?.revisionName; if (!revision) throw new Error("DRILL_TRAFFIC_NOT_READY"); return { api: revision, judge: revision, web: revision }; };
let failCandidate = false, created = false, url = "";
const outcomes: unknown[] = [];
try {
  await git(temporary, ["init", "--bare"]);
  await git(temporary, ["remote", "add", "origin", SOURCE_REMOTE]);
  await git(temporary, ["fetch", "--depth=2", "origin", `refs/heads/${approved.branch}`]);
  if (await git(temporary, ["rev-parse", "FETCH_HEAD"]) !== approved.headSha || await git(temporary, ["rev-parse", "FETCH_HEAD^"]) !== approved.baseSha) throw new Error("DRILL_SOURCE_CHANGED");
  await git(temporary, ["update-ref", "refs/heads/drill", approved.baseSha!]);
  const deploy = async (fault: boolean) => {
    await gcloud(["run", "deploy", service, "--image", image, "--region", region, "--service-account", `judgeops-status@${project}.iam.gserviceaccount.com`, "--memory", "256Mi", "--cpu", "1", "--min", "0", "--max", "1", "--concurrency", "1", "--timeout", "30s", "--allow-unauthenticated", "--labels", "managed-by=judgeops,purpose=release-drill", "--set-env-vars", `MONITOR_MODE=reader,MONITOR_BUCKET=${fault ? `${project}-drill-nonexistent` : bucket}`]);
    created = true; const state = await describe(); url = state.status.url;
    await gcloud(["run", "services", "update-traffic", service, "--region", region, "--to-latest"]);
    return snapshot();
  };
  const provider: ReleaseProvider = {
    currentMain: () => git(temporary, ["rev-parse", "refs/heads/drill"]), capture: snapshot,
    publish: async (base, head) => { await git(temporary, ["update-ref", "refs/heads/drill", head, base]); },
    deploy: async sha => deploy(failCandidate && sha === approved.headSha),
    healthy: async () => { const r = await fetch(`${url}/status`, { signal: AbortSignal.timeout(15000) }); const state = await r.json(); return r.ok && state.status === "HEALTHY"; },
    revert: async (base, head) => { const tree = await git(temporary, ["rev-parse", `${base}^{tree}`]); const sha = await git(temporary, ["-c", "user.name=JudgeOps drill", "-c", "user.email=judgeops@judge.tw", "commit-tree", tree, "-p", head, "-m", "Isolated release drill rollback"]); await git(temporary, ["update-ref", "refs/heads/drill", sha, head]); return sha; },
    restore: async saved => { await gcloud(["run", "services", "update-traffic", service, "--region", region, "--to-revisions", `${saved.web}=100`]); },
  };
  await progress("STAGING_BASELINE", "建立一次性 Cloud Run 服務；Git 變更只寫入本機 drill ref，正式站與 main 不會被更動。");
  await deploy(false); if (!await provider.healthy(signal)) throw new Error("DRILL_BASELINE_UNHEALTHY");
  const targets = { api: false, judge: false, web: true };
  const success = await releaseFlow(approved, targets, provider, signal, progress); outcomes.push(success);
  if (success.outcome !== "RELEASED") throw new Error("DRILL_SUCCESS_PATH_FAILED");
  await git(temporary, ["update-ref", "refs/heads/drill", approved.baseSha!, approved.headSha!]);
  failCandidate = true;
  await progress("STAGING_FAULT", "以不存在的唯讀狀態儲存桶注入 503，驗證真实 revision 流量復原與 Git 程式樹恢復。");
  const rollback = await releaseFlow(approved, targets, provider, signal, progress); outcomes.push(rollback);
  if (rollback.outcome !== "ROLLED_BACK" || !await provider.healthy(signal)) throw new Error("DRILL_ROLLBACK_FAILED");
  if (await git(temporary, ["rev-parse", "refs/heads/drill^{tree}"]) !== await git(temporary, ["rev-parse", `${approved.baseSha}^{tree}`])) throw new Error("DRILL_TREE_NOT_RESTORED");
  await writeFile(join(directory, "result.json"), JSON.stringify({ completedAt: new Date().toISOString(), outcome: "PASS", scope: "Real isolated Cloud Run revisions and local Git refs using releaseFlow; does not exercise Railway/Vercel production rollback endpoints.", repairPullUrl: approved.pullUrl, service, outcomes }, null, 2), { mode: 0o600 });
  await progress("STAGING_PASS", "成功發布與失敗復原兩條實際雲端演練路徑通過。");
} finally {
  if (created) await gcloud(["run", "services", "delete", service, "--region", region], true);
  await rm(temporary, { recursive: true, force: true });
}
