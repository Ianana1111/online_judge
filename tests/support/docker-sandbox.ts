import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import type { Sandbox } from "@vercel/sandbox";
const exec = promisify(execFile);

/** No host mounts or network. Runs actual production scripts on a disposable Linux toolchain;
 * deliberately does not impersonate Vercel-specific API, kernel or performance guarantees. */
export async function createDockerSandbox() {
  const name = `oj-runner-test-${randomUUID()}`;
  const docker = (args: string[]) => exec("docker", args, { maxBuffer: 20 * 1024 * 1024, timeout: 120_000 });
  await docker(["run", "--detach", "--name", name, "--network", "none", "--env", "DATABASE_URL=synthetic-canary", "--memory", "1536m", "--cpus", "1", "--pids-limit", "256", "oj-readiness-sandbox-fixture"]);
  const stop = async () => { await docker(["rm", "--force", name]); };
  const deadline = setTimeout(() => { void stop().catch(() => {}); }, 120_000); deadline.unref();
  const adapter = {
    async runCommand({ cmd, args = [], cwd = "/vercel/sandbox", sudo = false }: { cmd: string; args?: string[]; cwd?: string; sudo?: boolean }) {
      try { const out = await docker(["exec", "--user", sudo ? "0" : "1000", "--workdir", cwd, name, cmd, ...args]); return { exitCode: 0, stdout: async () => out.stdout, stderr: async () => out.stderr }; }
      catch (error) { const e = error as { code: number; stdout: string; stderr: string }; if (typeof e.code !== "number") throw error; return { exitCode: e.code, stdout: async () => e.stdout, stderr: async () => e.stderr }; }
    },
    async readFileToBuffer({ path }: { path: string }) { const result = await exec("docker", ["exec", "--user", "1000", name, "cat", path], { encoding: "buffer", maxBuffer: 20 * 1024 * 1024, timeout: 30_000 }); return result.stdout; },
    async writeFiles(files: { path: string; content: Buffer }[]) {
      for (const file of files) await new Promise<void>((resolve, reject) => {
        const child = spawn("docker", ["exec", "--interactive", "--user", "1000", name, "sh", "-c", 'cat > "$1"', "sh", file.path]);
        child.on("error", reject); child.stdin.on("error", reject);
        child.on("close", (code) => code === 0 ? resolve() : reject(new Error("fixture write failed"))); child.stdin.end(file.content);
      });
    },
  };
  return { sandbox: adapter as unknown as Sandbox, stop: async () => { clearTimeout(deadline); await stop(); } };
}
