/** Restore an existing backup into a disposable, network-isolated PostgreSQL 18 container. */
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdir, realpath, stat, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { resolve, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const backup = await realpath(process.argv[2] ?? "generated/backups/judgeops-workflows-before-20261006.dump");
if (!(await stat(backup)).isFile() || !backup.endsWith(".dump")) throw new Error("Expected a PostgreSQL custom-format backup");
const destination = resolve("generated/judgeops", `restore-drill-${new Date().toISOString().slice(0, 10)}`);
await mkdir(destination, { recursive: true, mode: 0o700 });
const name = `judgeops-restore-${randomBytes(6).toString("hex")}`;
async function docker(args, timeout = 180_000) {
  return new Promise((accept, reject) => {
    const p = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] }); let out = "", err = "";
    const timer = setTimeout(() => p.kill("SIGTERM"), timeout);
    p.stdout.on("data", b => { out = (out + b).slice(-2_000_000); });
    p.stderr.on("data", b => { err = (err + b).slice(-100_000); });
    p.once("error", e => { clearTimeout(timer); reject(e); });
    p.once("close", code => { clearTimeout(timer); accept({ code, out, err }); });
  });
}
const started = Date.now(), checks = [];
const check = (name, passed, detail) => { checks.push({ name, passed, detail }); if (!passed) throw new Error(name); };
const hash = createHash("sha256"); for await (const chunk of createReadStream(backup)) hash.update(chunk);
const backupSha256 = hash.digest("hex");
let failure;
try {
  const run = await docker(["run", "--detach", "--name", name, "--network=none", "--memory=768m", "--cpus=1", "--pids-limit=128", "--mount", `type=bind,src=${backup},dst=/backup/input.dump,readonly`, "-e", "POSTGRES_HOST_AUTH_METHOD=trust", "-e", "POSTGRES_DB=judgeops_restore", "postgres:18-bookworm"]);
  check("isolated-container", run.code === 0, "No network, no published ports; only the selected backup is mounted read-only.");
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    if ((await docker(["exec", name, "pg_isready", "-h", "127.0.0.1", "-U", "postgres", "-d", "judgeops_restore"], 5000)).code === 0) { ready = true; break; }
    await delay(1000);
  }
  check("postgres-ready", ready, "PostgreSQL 18 accepts loopback connections after initialization.");
  const restored = await docker(["exec", name, "pg_restore", "--exit-on-error", "--no-owner", "--no-privileges", "-h", "127.0.0.1", "-U", "postgres", "-d", "judgeops_restore", "/backup/input.dump"]);
  if (restored.code) await writeFile(join(destination, "restore-error.log"), restored.err, { mode: 0o600 });
  check("restore", restored.code === 0, "Schema, data, indexes and constraints restored with --exit-on-error.");
  const query = `SELECT json_build_object('tables',(SELECT count(*) FROM pg_tables WHERE schemaname='public'),'problems',(SELECT count(*) FROM "problems"),'users',(SELECT count(*) FROM "users"),'migrations',(SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL),'invalidConstraints',(SELECT count(*) FROM pg_constraint WHERE NOT convalidated),'invalidIndexes',(SELECT count(*) FROM pg_index WHERE NOT indisvalid));`;
  const data = await docker(["exec", name, "psql", "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-h", "127.0.0.1", "-U", "postgres", "-d", "judgeops_restore", "-c", query]);
  if (data.code) await writeFile(join(destination, "query-error.log"), data.err, { mode: 0o600 });
  check("read-restored-data", data.code === 0, "Read aggregate counts only; no personal data exported.");
  const counts = JSON.parse(data.out.trim());
  check("integrity", counts.tables > 20 && counts.problems >= 430 && counts.migrations > 0 && counts.invalidConstraints === 0 && counts.invalidIndexes === 0, counts);
} catch (error) { failure = error instanceof Error ? error.message : "RESTORE_FAILED"; }
finally {
  const removed = await docker(["rm", "-f", "-v", name]);
  checks.push({ name: "cleanup", passed: removed.code === 0, detail: "Disposable database and anonymous volume removed; original backup retained." });
  const report = { completedAt: new Date().toISOString(), backupSha256, backupBytes: (await stat(backup)).size, durationMs: Date.now() - started, outcome: !failure && checks.every(c => c.passed) ? "PASS" : "FAIL", checks, ...(failure ? { failure } : {}) };
  await writeFile(join(destination, "report.json"), JSON.stringify(report, null, 2), { mode: 0o600 });
  console.log(JSON.stringify(report)); if (report.outcome !== "PASS") process.exitCode = 1;
}
