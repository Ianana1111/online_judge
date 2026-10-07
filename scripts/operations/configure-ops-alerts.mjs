/** Configure an owner-selected email destination; dry-run unless --apply is supplied. */
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
const deployment = JSON.parse(await readFile("generated/judgeops/gcp-monitor.json", "utf8"));
const email = process.env.JUDGEOPS_ALERT_EMAIL?.trim();
if (email && (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) || email.length > 254)) throw new Error("Invalid alert email");
if (!process.argv.includes("--apply")) {
  console.log(JSON.stringify({ project: deployment.project, destinationConfigured: !!email, changes: "Attach the selected email to the existing JudgeOps uptime alert; preserve other channels.", apply: "Set JUDGEOPS_ALERT_EMAIL privately, then pass --apply." })); process.exit(0);
}
if (!email) throw new Error("Set the owner-selected JUDGEOPS_ALERT_EMAIL before applying");
const token = execFileSync("gcloud", ["auth", "print-access-token"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
async function api(path, method = "GET", body) {
  const r = await fetch(`https://monitoring.googleapis.com/v3/${path}`, { method, redirect: "error", signal: AbortSignal.timeout(20000), headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) { await r.body?.cancel(); throw new Error(`MONITORING_HTTP_${r.status}`); } return r.json();
}
const root = `projects/${deployment.project}`;
const channels = await api(`${root}/notificationChannels`);
let channel = channels.notificationChannels?.find(c => c.type === "email" && c.labels.email_address === email);
if (!channel) channel = await api(`${root}/notificationChannels`, "POST", { type: "email", displayName: "JudgeOps owner alerts", labels: { email_address: email }, enabled: true });
else if (!channel.enabled) channel = await api(`${channel.name}?updateMask=enabled`, "PATCH", { name: channel.name, enabled: true });
if (channel.verificationStatus === "UNVERIFIED") {
  if (process.env.JUDGEOPS_ALERT_VERIFICATION_CODE) channel = await api(`${channel.name}:verify`, "POST", { code: process.env.JUDGEOPS_ALERT_VERIFICATION_CODE });
  else {
    await api(`${channel.name}:sendVerificationCode`, "POST", {});
    console.log(JSON.stringify({ channel: channel.name, status: "AWAITING_EMAIL_VERIFICATION", next: "Provide the received code privately as JUDGEOPS_ALERT_VERIFICATION_CODE and rerun." })); process.exit(2);
  }
}
const policies = await api(`${root}/alertPolicies`);
const policy = policies.alertPolicies?.find(p => p.displayName === "JudgeOps monitor unavailable or incident");
if (!policy) throw new Error("Deploy the JudgeOps monitoring policy first");
const previousChannels = policy.notificationChannels ?? [];
if (!previousChannels.includes(channel.name)) await api(`${policy.name}?updateMask=notificationChannels`, "PATCH", { name: policy.name, notificationChannels: [...previousChannels, channel.name] });
const saved = await api(policy.name);
if (!saved.notificationChannels?.includes(channel.name)) throw new Error("Alert configuration was not persisted");
const result = { configuredAt: new Date().toISOString(), project: deployment.project, channel: channel.name, policy: policy.name, previousChannels, verificationStatus: channel.verificationStatus ?? "NOT_REQUIRED", email: email.replace(/^(.).+(@.*)$/, "$1***$2"), delivery: "Configured; actual inbox receipt still requires a notification drill." };
await writeFile("generated/judgeops/alert-channel.json", JSON.stringify(result, null, 2), { mode: 0o600 }); console.log(JSON.stringify(result));
