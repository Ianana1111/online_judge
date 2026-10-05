import { mkdir, lstat, readFile, realpath, writeFile } from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { createHash } from "node:crypto";
import { runProcess } from "./process.js";
export const REPOSITORY = "Ianana1111/online_judge";
export const SOURCE_REMOTE = `https://github.com/${REPOSITORY}.git`;
export const sha256 = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
export async function git(cwd: string, args: string[], input?: string) {
  const result = await runProcess("git", ["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "-c", "core.quotePath=false", ...args], { cwd, input, timeoutMs: 120_000 });
  if (result.code) throw new Error("GIT_OPERATION_FAILED"); return result.stdout.trim();
}
export async function workspace(runtime: string, taskId: string) {
  if (!/^[a-z0-9]+$/.test(taskId)) throw new Error("Invalid task id");
  await mkdir(runtime, { recursive: true, mode: 0o700 });
  const mirror = join(runtime, "source.git");
  try { await lstat(mirror); } catch { await git(runtime, ["clone", "--bare", SOURCE_REMOTE, mirror]); }
  if (await git(mirror, ["remote", "get-url", "origin"]) !== SOURCE_REMOTE) throw new Error("Wrong repository mirror");
  await git(mirror, ["fetch", "origin", "+refs/heads/main:refs/heads/main"]);
  const baseSha = await git(mirror, ["rev-parse", "refs/heads/main"]);
  if (!/^[a-f0-9]{40}$/.test(baseSha)) throw new Error("Invalid source commit");
  const directory = join(runtime, `work-${taskId}`);
  try { await lstat(directory); throw new Error("Existing worktree needs reconciliation"); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  await git(mirror, ["worktree", "add", "--detach", directory, baseSha]);
  return { directory, baseSha, mirror };
}
export async function sourceFile(root: string, path: string) {
  const file = resolve(root, path), actualRoot = await realpath(root), actual = await realpath(file);
  if (relative(actualRoot, actual).startsWith("..") || actual !== file || !(await lstat(file)).isFile()) throw new Error("Unsafe source path");
  if (!/^(apps\/(web|api|judge)\/|packages\/shared\/src\/|tests\/)/.test(path) || /(?:agent-ops|opsWorkflow|agentOps|runtime-config|\.env|\.git|node_modules)/.test(path)) throw new Error("Protected path");
  const content = await readFile(file, "utf8"); if (Buffer.byteLength(content) > 36_000) throw new Error("Source file exceeds review context limit");
  return { path, content, sha256: sha256(content) };
}
export async function applyCandidate(root: string, sources: { path: string; sha256: string }[], files: { path: string; beforeHash: string; content: string }[], test: string, regressionFile: string) {
  if (!/^tests\/ops-regression-[a-z0-9]+\.test\.ts$/.test(regressionFile)) throw new Error("Invalid regression path");
  if (files.length < 1 || files.length > 4 || Buffer.byteLength(test) > 16_000 || !/\b(?:it|test)\s*\(/.test(test)) throw new Error("Invalid repair patch");
  const paths = new Set<string>();
  for (const file of files) {
    const source = sources.find(s => s.path === file.path);
    if (!source || paths.has(file.path) || file.beforeHash !== source.sha256 || Buffer.byteLength(file.content) > 50_000) throw new Error("Patch outside approved context");
    const current = await sourceFile(root, file.path); if (current.sha256 !== source.sha256) throw new Error("Source changed"); paths.add(file.path);
  }
  for (const file of files) await writeFile(resolve(root, file.path), file.content, { flag: "w" });
  const regression = join(root, regressionFile);
  await writeFile(regression, test, { flag: "wx" });
}
export async function github<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  if (path !== `/repos/${REPOSITORY}` && !path.startsWith(`/repos/${REPOSITORY}/`)) throw new Error("Repository boundary violation");
  // Existing Git credential helper is used only by this trusted adapter, never passed to Codex or test containers.
  const credential = await runProcess("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", maxBytes: 16000 });
  const password = credential.stdout.split("\n").find(v => v.startsWith("password="))?.slice(9);
  if (credential.code || !password) throw new Error("GITHUB_AUTH_REQUIRED");
  const response = await fetch(`https://api.github.com${path}`, { method, redirect: "error", signal: AbortSignal.timeout(20000), headers: { authorization: `Bearer ${password}`, accept: "application/vnd.github+json", "content-type": "application/json", "x-github-api-version": "2022-11-28" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) { await response.body?.cancel(); throw new Error(`GITHUB_HTTP_${response.status}`); }
  return response.json() as T;
}
