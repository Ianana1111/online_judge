/** Independent GCP monitor. Dry-run by default; authenticated --apply provisions only named JudgeOps resources. */
import { spawn } from "node:child_process";
import { mkdtemp, cp, writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const project = process.env.JUDGEOPS_GCP_PROJECT ?? "judge-510903", region = "asia-east1";
if (!/^[a-z][a-z0-9-]{4,60}[a-z0-9]$/.test(project)) throw new Error("Invalid project id");
const bucket = `${project}-judgeops-monitor`, registry = "judgeops", writer = "judgeops-monitor-writer", reader = "judgeops-status", scheduler = "judgeops-probe";
const identity = name => `${name}@${project}.iam.gserviceaccount.com`;
const image = `${region}-docker.pkg.dev/${project}/${registry}/monitor:${Date.now()}`;
if (!process.argv.includes("--apply")) {
  console.log(JSON.stringify({ project, region, bucket, services: [writer, reader], interval: "5 minutes", maxInstancesPerService: 1, minInstances: 0, writer: "IAM private", reader: "public read-only", storage: "private GCS; compare-and-swap", monitoring: "external uptime check and alert policy; no email recipient configured", apply: "node scripts/operations/deploy-ops-monitor.mjs --apply" }, null, 2));
  process.exit(0);
}
async function command(args, optional = false) {
  const result = await new Promise((resolve, reject) => {
    const p = spawn("gcloud", [...args, "--project", project, "--quiet"], { stdio: ["ignore", "pipe", "pipe"] }); let out = "", err = "";
    p.stdout.on("data", b => { out += b; }); p.stderr.on("data", b => { err = (err + b).slice(-3000); }); p.on("error", reject); p.on("close", code => resolve({ code, out, err }));
  });
  if (result.code && !optional) throw new Error(`GCP command failed: ${args.slice(0, 3).join(" ")}: ${result.err.trim()}`);
  return result;
}
const token = (await command(["auth", "print-access-token"])).out.trim();
// Fail before provisioning anything when the selected account cannot use the project.
const projectInfo = JSON.parse((await command(["projects", "describe", project, "--format=json"])).out);
if (projectInfo.lifecycleState !== "ACTIVE") throw new Error(`Project ${project} is not active.`);
const billing = JSON.parse((await command(["billing", "projects", "describe", project, "--format=json"])).out);
if (billing.billingEnabled !== true) throw new Error(`Billing is not enabled for ${project}. Link the intended billing account before deploying: https://console.cloud.google.com/billing/linkedaccount?project=${project}`);
async function monitoring(path, method = "GET", body) {
  const response = await fetch(`https://monitoring.googleapis.com/v3/projects/${project}/${path}`, { method, redirect: "error", signal: AbortSignal.timeout(20000), headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`Cloud Monitoring ${response.status}`); return response.json();
}
const temporary = await mkdtemp(join(tmpdir(), "judgeops-gcp-"));
try {
  await command(["services", "enable", "run.googleapis.com", "cloudbuild.googleapis.com", "artifactregistry.googleapis.com", "cloudscheduler.googleapis.com", "monitoring.googleapis.com", "storage.googleapis.com", "iam.googleapis.com"]);
  for (const name of [writer, reader, scheduler]) if ((await command(["iam", "service-accounts", "describe", identity(name)], true)).code) await command(["iam", "service-accounts", "create", name, "--display-name", name]);
  if ((await command(["storage", "buckets", "describe", `gs://${bucket}`], true)).code) await command(["storage", "buckets", "create", `gs://${bucket}`, "--location", region, "--uniform-bucket-level-access", "--public-access-prevention"]);
  for (const [name, role] of [[writer, "roles/storage.objectUser"], [reader, "roles/storage.objectViewer"]]) await command(["storage", "buckets", "add-iam-policy-binding", `gs://${bucket}`, "--member", `serviceAccount:${identity(name)}`, "--role", role]);
  if ((await command(["artifacts", "repositories", "describe", registry, "--location", region], true)).code) await command(["artifacts", "repositories", "create", registry, "--location", region, "--repository-format", "docker"]);
  // Upload only dependency-free monitor source, never this repository's .env, worktrees, logs or database dumps.
  await cp(resolve("apps/ops-monitor"), join(temporary, "monitor"), { recursive: true });
  await writeFile(join(temporary, "Dockerfile"), 'FROM node:22-bookworm-slim\nWORKDIR /app\nCOPY monitor/package.json ./package.json\nCOPY monitor/src ./src\nUSER node\nENV PORT=8080\nCMD ["node", "src/server.mjs"]\n');
  await command(["builds", "submit", temporary, "--tag", image, "--timeout", "600s"]);
  for (const [service, mode, publicAccess] of [[writer, "writer", false], [reader, "reader", true]]) await command(["run", "deploy", service, "--image", image, "--region", region, "--service-account", identity(service), "--memory", "256Mi", "--cpu", "1", "--min", "0", "--max", "1", "--concurrency", "1", "--timeout", "90s", "--set-env-vars", `MONITOR_MODE=${mode},MONITOR_BUCKET=${bucket}`, publicAccess ? "--allow-unauthenticated" : "--no-allow-unauthenticated"]);
  await command(["run", "services", "add-iam-policy-binding", writer, "--region", region, "--member", `serviceAccount:${identity(scheduler)}`, "--role", "roles/run.invoker"]);
  const writerUrl = (await command(["run", "services", "describe", writer, "--region", region, "--format=value(status.url)"])).out.trim();
  const readerUrl = (await command(["run", "services", "describe", reader, "--region", region, "--format=value(status.url)"])).out.trim();
  const exists = !(await command(["scheduler", "jobs", "describe", scheduler, "--location", region], true)).code;
  await command(["scheduler", "jobs", exists ? "update" : "create", "http", scheduler, "--location", region, "--schedule", "*/5 * * * *", "--time-zone", "Asia/Taipei", "--uri", `${writerUrl}/probe`, "--http-method", "POST", "--oidc-service-account-email", identity(scheduler), "--oidc-token-audience", writerUrl, "--attempt-deadline", "90s", "--max-retry-attempts", "1"]);
  await command(["scheduler", "jobs", "run", scheduler, "--location", region]);
  const checks = await monitoring("uptimeCheckConfigs");
  let uptime = checks.uptimeCheckConfigs?.find(c => c.displayName === "JudgeOps independent monitor");
  if (!uptime) uptime = await monitoring("uptimeCheckConfigs", "POST", { displayName: "JudgeOps independent monitor", monitoredResource: { type: "uptime_url", labels: { project_id: project, host: new URL(readerUrl).host } }, httpCheck: { path: "/status", port: 443, useSsl: true, validateSsl: true, requestMethod: "GET" }, period: "300s", timeout: "10s" });
  const policies = await monitoring("alertPolicies");
  if (!policies.alertPolicies?.some(p => p.displayName === "JudgeOps monitor unavailable or incident")) await monitoring("alertPolicies", "POST", { displayName: "JudgeOps monitor unavailable or incident", combiner: "OR", enabled: true, conditions: [{ displayName: "Independent probe unhealthy", conditionThreshold: { filter: `metric.type="monitoring.googleapis.com/uptime_check/check_passed" AND resource.type="uptime_url" AND metric.label.check_id="${uptime.name.split('/').at(-1)}"`, comparison: "COMPARISON_LT", thresholdValue: 1, duration: "300s", aggregations: [{ alignmentPeriod: "300s", perSeriesAligner: "ALIGN_FRACTION_TRUE" }], trigger: { count: 1 } } }], documentation: { content: `Open ${readerUrl} for independent status. API, database and the local executor are not required for this page.`, mimeType: "text/markdown" } });
  await mkdir("generated/judgeops", { recursive: true });
  const deployment = { project, region, bucket, image, writerUrl, monitorUrl: readerUrl, scheduler, deployedAt: new Date().toISOString() };
  await writeFile("generated/judgeops/gcp-monitor.json", JSON.stringify(deployment, null, 2)); console.log(JSON.stringify(deployment, null, 2));
} finally { await rm(temporary, { recursive: true, force: true }); }
