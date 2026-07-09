import { spawn } from "node:child_process";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Driver around the `isolate` sandbox CLI (https://github.com/ioi/isolate), the ICPC/IOI-standard
 * per-process Linux sandbox. `isolate` itself is what provides the actual security boundary here:
 * cgroups (cpu/mem accounting + limits), PID/mount/net namespaces (no network unless --share-net,
 * which we never pass), and a restricted filesystem view. This worker process must run with the
 * host capabilities isolate needs to set up that boundary (cgroup delegation + CAP_SYS_ADMIN,
 * typically granted via `privileged: true` on the container — see apps/judge/README.md). That is a
 * deliberate, documented trade-off (this worker process itself is trusted/host-privileged so it can
 * build a strong boundary *around the untrusted submission*); gVisor/microVM wrapping of the whole
 * worker is a further-hardening option for later (plan §9 M7), not required for this milestone.
 */

export interface IsolateMeta {
  status?: "TO" | "SG" | "RE" | "XX";
  time?: number; // CPU seconds
  "time-wall"?: number; // wall seconds
  "max-rss"?: number; // KB
  exitcode?: number;
  exitsig?: number;
  message?: string;
}

export interface IsolateRunOptions {
  boxId: number;
  cmd: string[];
  stdinPath?: string;
  stdoutPath: string;
  stderrPath: string;
  timeSec: number;
  wallTimeSec: number;
  memKb: number;
  fsizeKb: number;
  processes: number;
}

export interface IsolateRunResult {
  meta: IsolateMeta;
  exitCode: number | null;
}

function run(cmd: string, args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

/** Acquires a box (isolate --init) and returns its filesystem path (box/ subdir). */
export async function isolateInit(boxId: number): Promise<string> {
  const { code, stdout, stderr } = await run("isolate", [`--box-id=${boxId}`, "--cg", "--init"]);
  if (code !== 0) {
    throw new Error(`isolate --init failed for box ${boxId}: ${stderr || stdout}`);
  }
  const boxRoot = stdout.trim();
  return join(boxRoot, "box");
}

export async function isolateCleanup(boxId: number): Promise<void> {
  await run("isolate", [`--box-id=${boxId}`, "--cg", "--cleanup"]);
}

function parseMetaFile(content: string): IsolateMeta {
  const meta: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx)] = line.slice(idx + 1);
  }
  const result: IsolateMeta = {};
  if (meta.status) result.status = meta.status as IsolateMeta["status"];
  if (meta.time) result.time = parseFloat(meta.time);
  if (meta["time-wall"]) result["time-wall"] = parseFloat(meta["time-wall"]);
  if (meta["max-rss"]) result["max-rss"] = parseInt(meta["max-rss"], 10);
  if (meta.exitcode) result.exitcode = parseInt(meta.exitcode, 10);
  if (meta.exitsig) result.exitsig = parseInt(meta.exitsig, 10);
  if (meta.message) result.message = meta.message;
  return result;
}

/**
 * Runs a command inside an already-initialized isolate box. `--processes=1` (default here) blocks
 * fork bombs; network is always denied (we never pass --share-net); no cgroup memory limit is set
 * unless memKb is provided.
 */
export async function isolateRun(opts: IsolateRunOptions): Promise<IsolateRunResult> {
  const metaPath = `/tmp/isolate-meta-${opts.boxId}-${Date.now()}.txt`;
  const args = [
    `--box-id=${opts.boxId}`,
    "--cg",
    `--cg-mem=${opts.memKb}`,
    `--time=${opts.timeSec}`,
    `--wall-time=${opts.wallTimeSec}`,
    `--fsize=${opts.fsizeKb}`,
    `--processes=${opts.processes}`,
    "--env=PATH=/usr/bin:/bin",
    `--meta=${metaPath}`,
  ];
  if (opts.stdinPath) args.push(`--stdin=${opts.stdinPath}`);
  args.push(`--stdout=${opts.stdoutPath}`, `--stderr=${opts.stderrPath}`, "--run", "--", ...opts.cmd);

  const { code } = await run("isolate", args);

  let meta: IsolateMeta = {};
  try {
    const metaContent = await readFile(metaPath, "utf-8");
    meta = parseMetaFile(metaContent);
  } catch {
    // meta file may not exist if isolate itself failed to even start the box command
  }

  return { meta, exitCode: code };
}

export async function writeBoxFile(boxPath: string, relPath: string, content: string): Promise<string> {
  const full = join(boxPath, relPath);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, content, "utf-8");
  return full;
}

/** Simple pool handing out box-id slots so concurrent jobs don't collide. */
export class BoxIdPool {
  private free: number[];
  private waiters: Array<(id: number) => void> = [];

  constructor(size: number) {
    this.free = Array.from({ length: size }, (_, i) => i);
  }

  async acquire(): Promise<number> {
    const id = this.free.pop();
    if (id !== undefined) return id;
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  release(id: number): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(id);
    } else {
      this.free.push(id);
    }
  }
}
