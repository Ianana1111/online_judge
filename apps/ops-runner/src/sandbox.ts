import { mkdir, mkdtemp, readFile, writeFile, rm, statfs } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import type { OpsCheck } from "@oj/shared";
import { runProcess } from "./process.js";
import { sha256 } from "./repository.js";
export type SandboxResult = { checks: OpsCheck[]; regression: { passed: number; failed: number; total: number; runtimeErrors: number; failedAssertions: number } | null };
export async function ensureCheckImage(source: string, commit: string, signal: AbortSignal) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("Invalid image source");
  const image = `judgeops-checks:${commit.slice(0, 12)}`;
  const existing = await runProcess("docker", ["image", "inspect", image, "--format", "{{index .Config.Labels \"tw.judge.source\"}}"], { signal });
  if (!existing.code && existing.stdout.trim() === commit) return image;
  // Only public base images are needed. Do not inherit unrelated, possibly expired registry helpers.
  const disk = await statfs(source);
  if (disk.bavail * disk.bsize < 5 * 1024 ** 3) throw new Error("INSUFFICIENT_LOCAL_DISK");
  const context = await runProcess("docker", ["context", "inspect", "--format", '{{(index .Endpoints "docker").Host}}'], { signal });
  const host = context.stdout.trim();
  if (context.code || !host.startsWith("unix:///")) throw new Error("LOCAL_DOCKER_REQUIRED");
  const config = await mkdtemp(join(tmpdir(), "judgeops-docker-"));
  try {
    await writeFile(join(config, "config.json"), JSON.stringify({ cliPluginsExtraDirs: [join(homedir(), ".docker/cli-plugins")] }), { mode: 0o600 });
    const build = await runProcess("docker", ["--config", config, "--host", host, "build", "--label", `tw.judge.source=${commit}`, "-f", "docker/Dockerfile.ops-checks", "-t", image, "."], { cwd: source, signal, timeoutMs: 30 * 60_000, maxBytes: 4_000_000 });
    if (build.code) throw new Error("CHECK_IMAGE_BUILD_FAILED"); return image;
  } finally { await rm(config, { recursive: true, force: true }); }
}
export async function runSandbox(image: string, source: string, artifactDir: string, mode: "full" | "baseline" | "regression", signal: AbortSignal, regressionFile = "tests/ops-regression.test.ts"): Promise<SandboxResult> {
  if (!/^judgeops-checks:[a-f0-9]{12}$/.test(image)) throw new Error("Invalid check image");
  await mkdir(artifactDir, { recursive: true, mode: 0o700 });
  const disk = await statfs(artifactDir);
  if (disk.bavail * disk.bsize < 3 * 1024 ** 3) throw new Error("INSUFFICIENT_LOCAL_DISK");
  const name = `judgeops-${mode}-${sha256(artifactDir).slice(0, 12)}`;
  try {
    const result = await runProcess("docker", ["run", "--init", "--name", name, "--network=none", "--read-only", "--cap-drop=ALL", "--security-opt=no-new-privileges", "--pids-limit=512", "--memory=4g", "--cpus=2", "--tmpfs", "/tmp:rw,exec,size=512m,mode=1777", "--shm-size=256m", "--volume", "/results", "--volume", "/work", "--mount", `type=bind,src=${source},dst=/candidate,readonly`, image, mode, regressionFile], { signal, timeoutMs: 35 * 60_000, maxBytes: 2_000_000 });
    await writeFile(join(artifactDir, "stderr.log"), result.stderr, { mode: 0o600 });
    await writeFile(join(artifactDir, "events.jsonl"), result.stdout, { mode: 0o600 });
    await runProcess("docker", ["cp", `${name}:/results/.`, artifactDir], { timeoutMs: 60_000 }).catch(() => {});
    const line = result.stdout.split("\n").reverse().find(line => { try { return JSON.parse(line).event === "result"; } catch { return false; } });
    if (!line) throw new Error("VALIDATION_INCOMPLETE");
    const report = JSON.parse(line) as SandboxResult;
    if (!Array.isArray(report.checks) || !report.checks.length || report.checks.some(c => !["PASS", "FAIL", "SKIP"].includes(c.status))) throw new Error("Invalid validation result");
    return report;
  } finally { await runProcess("docker", ["rm", "-f", "-v", name]).catch(() => {}); }
}
export async function artifact(directory: string, file: string) {
  const content = await readFile(join(directory, file)); return { name: file, bytes: content.length, sha256: sha256(content) };
}
