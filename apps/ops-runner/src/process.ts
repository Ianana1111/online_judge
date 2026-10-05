import { spawn } from "node:child_process";
export function localEnvironment(): NodeJS.ProcessEnv {
  return { PATH: process.env.PATH, HOME: process.env.HOME, USER: process.env.USER, TMPDIR: process.env.TMPDIR, LANG: "en_US.UTF-8", GIT_TERMINAL_PROMPT: "0" };
}
export async function runProcess(binary: string, args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv; input?: string; timeoutMs?: number; signal?: AbortSignal; maxBytes?: number } = {}) {
  if (options.signal?.aborted) throw new Error("INTERRUPTED");
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(binary, args, { cwd: options.cwd, env: options.env ?? localEnvironment(), stdio: ["pipe", "pipe", "pipe"], detached: true });
    let stdout = "", stderr = "", count = 0, stopped = false;
    const stop = () => { stopped = true; try { process.kill(-child.pid!, "SIGKILL"); } catch { child.kill("SIGKILL"); } };
    const timer = setTimeout(stop, options.timeoutMs ?? 60_000);
    options.signal?.addEventListener("abort", stop, { once: true });
    child.stdout.on("data", b => { count += b.length; if (count > (options.maxBytes ?? 2_000_000)) stop(); else stdout += b; });
    child.stderr.on("data", b => { stderr = (stderr + b).slice(-16000); });
    child.stdin.on("error", () => {}); child.stdin.end(options.input);
    const cleanup = () => { clearTimeout(timer); options.signal?.removeEventListener("abort", stop); };
    child.once("error", () => { cleanup(); reject(new Error("PROCESS_UNAVAILABLE")); });
    child.once("close", code => { cleanup(); if (stopped) reject(new Error(options.signal?.aborted ? "INTERRUPTED" : "PROCESS_LIMIT")); else resolve({ code: code ?? -1, stdout, stderr }); });
  });
}
