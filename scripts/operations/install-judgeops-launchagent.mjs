/** Install/remove the current user's macOS executor. Tokens stay in a mode-600 env file. */
import { chmod, mkdir, readFile, writeFile, rm, access } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

if (process.platform !== "darwin") throw new Error("This installer supports macOS; see docs/judgeops.md for the foreground executor.");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const label = "tw.judge.ops-runner", domain = `gui/${process.getuid()}`;
const target = join(homedir(), "Library/LaunchAgents", `${label}.plist`);
const launchctl = (...args) => spawnSync("/bin/launchctl", args, { stdio: "pipe" });
if (process.argv.includes("--uninstall")) {
  launchctl("bootout", `${domain}/${label}`);
  await rm(target, { force: true });
  console.log("JudgeOps automatic startup removed. Revoke the credential in the admin console if retiring this executor.");
} else {
  const envFile = join(root, "apps/ops-runner/.env.local");
  const config = await readFile(envFile, "utf8");
  if (!/^JUDGEOPS_RUNNER_TOKEN=jo_[a-f0-9]{64}$/m.test(config)) throw new Error("Configure apps/ops-runner/.env.local first; see docs/judgeops.md.");
  await chmod(envFile, 0o600);
  const loader = join(root, "apps/ops-runner/node_modules/tsx/dist/loader.mjs");
  await access(loader);
  const args = [process.execPath, `--env-file=${envFile}`, "--import", loader, join(root, "apps/ops-runner/src/cli.ts")];
  const preflight = spawnSync(args[0], [...args.slice(1), "--check"], { cwd: root, stdio: "pipe" });
  if (preflight.status !== 0) throw new Error("Codex ChatGPT authentication failed; run codex login before installing.");
  const logDir = join(root, "apps/ops-runner/runtime");
  await mkdir(logDir, { recursive: true, mode: 0o700 });
  const xml = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const env = { HOME: homedir(), PATH: process.env.PATH ?? "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin", ...(process.env.CODEX_HOME ? { CODEX_HOME: process.env.CODEX_HOME } : {}) };
  const plist = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array>${args.map(arg => `<string>${xml(arg)}</string>`).join("")}</array>
<key>WorkingDirectory</key><string>${xml(root)}</string>
<key>EnvironmentVariables</key><dict>${Object.entries(env).map(([key, value]) => `<key>${xml(key)}</key><string>${xml(value)}</string>`).join("")}</dict>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>60</integer>
<key>StandardOutPath</key><string>${xml(join(logDir, "runner.log"))}</string>
<key>StandardErrorPath</key><string>${xml(join(logDir, "runner-error.log"))}</string>
</dict></plist>\n`;
  await mkdir(dirname(target), { recursive: true });
  const temporary = `${target}.new`;
  await writeFile(temporary, plist, { mode: 0o600 });
  const lint = spawnSync("/usr/bin/plutil", ["-lint", temporary], { stdio: "pipe" });
  if (lint.status !== 0) { await rm(temporary, { force: true }); throw new Error("Invalid launch agent configuration"); }
  launchctl("bootout", `${domain}/${label}`);
  await writeFile(target, plist, { mode: 0o600 }); await rm(temporary, { force: true });
  // bootout can return before launchd has finished unloading the previous process.
  let started = false;
  for (let attempt = 0; attempt < 10; attempt++) {
    if (launchctl("bootstrap", domain, target).status === 0) { started = true; break; }
    if (attempt < 9) await delay(500);
  }
  if (!started) throw new Error("launchctl could not start JudgeOps. Run this command in the logged-in macOS user session.");
  console.log("JudgeOps executor installed and started. Login starts it automatically; sleeping/shutting down the Mac pauses execution. No API-key fallback.");
}
