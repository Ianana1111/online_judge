/** Trusted validation harness, baked into the image. Candidate code has no network or host secrets. */
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
const mode = process.argv[2] ?? "full";
if (!["full", "regression", "baseline", "browser"].includes(mode)) throw new Error("Unknown check mode");
const regressionFile = process.argv[3] ?? "tests/ops-regression.test.ts";
if (!/^tests\/ops-regression(?:-[a-z0-9]+)?\.test\.ts$/.test(regressionFile)) throw new Error("Invalid regression filename");
const root = "/work", output = "/results";
await mkdir(root, { recursive: true }); await mkdir(output, { recursive: true }); await mkdir("/tmp/home", { recursive: true });
const copied = spawnSync("rsync", ["-a", "/opt/oj/", `${root}/`], { stdio: "ignore" });
if (copied.status) throw new Error("Cannot initialize validation workspace");
if (mode !== "baseline") {
  const overlay = spawnSync("rsync", ["-a", "--exclude=.git", "--exclude=node_modules", "--exclude=.env*", "--exclude=generated", "--exclude=.next", "--exclude=dist", "--exclude=runtime", "--exclude=boxes", "--exclude=test-results", "--exclude=playwright-report", "--exclude=*.log", "/candidate/", `${root}/`], { stdio: "ignore" });
  if (overlay.status) throw new Error("Cannot overlay candidate");
} else {
  // Only the proposed regression test is added to the unchanged baseline.
  const regression = await readFile(`/candidate/${regressionFile}`, "utf8");
  await writeFile(`${root}/${regressionFile}`, regression);
}
await rm(`${root}/.env`, { force: true });
const env = { PATH: process.env.PATH, HOME: "/tmp/home", XDG_CACHE_HOME: "/tmp/cache", NODE_ENV: "test", CI: "1", NODE_OPTIONS: "--max-old-space-size=1536", RUN_FULL_SITE_E2E: "1", NEXT_TELEMETRY_DISABLED: "1", PLAYWRIGHT_BROWSERS_PATH: "/opt/browsers",
  DATABASE_URL: "postgresql://oj_test:oj_test_local_only@127.0.0.1:55432/oj_test", REDIS_URL: "redis://127.0.0.1:56379", RUN_DB_TESTS: "1", JUDGEOPS_SANDBOX: "1", ECPAY_ENV: "sandbox", BILLING_PROVIDER: "ecpay", STRIPE_ENABLED: "false", ALLOW_LOCAL_DEMO_SEED: "0",
  JWT_ACCESS_SECRET: randomBytes(32).toString("hex"), JWT_REFRESH_SECRET: randomBytes(32).toString("hex"), CSRF_SECRET: randomBytes(32).toString("hex"), INTERNAL_SERVICE_TOKEN: randomBytes(32).toString("hex"), SCHOOL_VERIFY_SECRET: randomBytes(32).toString("hex"), ACCOUNT_SECURITY_KEY: randomBytes(32).toString("hex"),
};
const checks = [], children = [];
async function command(name, bin, args, timeout = 300_000) {
  const start = Date.now(); let log = "", first = "";
  const capture = b => { if (first.length < 40000) first = (first + b).slice(0, 40000); log = (log + b).slice(-60000); };
  const code = await new Promise(resolve => {
    const child = spawn(bin, args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"], detached: true });
    const timer = setTimeout(() => { try { process.kill(-child.pid, "SIGKILL"); } catch {} }, timeout);
    child.stdout.on("data", capture); child.stderr.on("data", capture);
    child.once("error", () => { clearTimeout(timer); resolve(-1); }); child.once("close", value => { clearTimeout(timer); resolve(value ?? -1); });
  });
  // The log contains only isolated fixture data. Never upload it automatically as an LLM prompt.
  await writeFile(`${output}/${name}.log`, first + "\n--- last output ---\n" + log);
  const check = { name, status: code === 0 ? "PASS" : "FAIL", durationMs: Date.now() - start, detail: code === 0 ? "隔離環境執行通過" : `Exit ${code}; inspect local artifact ${name}.log` };
  checks.push(check); console.log(JSON.stringify({ event: "check", ...check })); return code === 0;
}
try {
  const pg = "/usr/lib/postgresql/15/bin";
  await writeFile("/tmp/pg-password", "oj_test_local_only\n", { mode: 0o600 });
  if (!(await command("database-init", `${pg}/initdb`, ["-D", "/tmp/pg", "-U", "oj_test", "--pwfile=/tmp/pg-password", "--auth=scram-sha-256"]))) throw new Error("Database init failed");
  children.push(spawn(`${pg}/postgres`, ["-D", "/tmp/pg", "-h", "127.0.0.1", "-p", "55432", "-k", "/tmp"], { env, stdio: "ignore" }));
  children.push(spawn("redis-server", ["--bind", "127.0.0.1", "--port", "56379", "--save", "", "--appendonly", "no"], { env, stdio: "ignore" }));
  for (let i = 0; i < 30; i++) { if (spawnSync(`${pg}/pg_isready`, ["-h", "127.0.0.1", "-p", "55432"], { stdio: "ignore" }).status === 0) break; await delay(300); }
  const created = spawnSync(`${pg}/createdb`, ["-h", "127.0.0.1", "-p", "55432", "-U", "oj_test", "oj_test"], { env: { ...env, PGPASSWORD: "oj_test_local_only" }, stdio: "ignore" });
  if (created.status) throw new Error("Database create failed");
  if (!(await command("database-migrations", "pnpm", ["--filter", "@oj/db", "exec", "prisma", "migrate", "deploy"]))) throw new Error("Migrations failed");
  if (["baseline", "regression"].includes(mode)) {
    await command("regression", "pnpm", ["exec", "vitest", "run", regressionFile, "--maxWorkers=2", "--reporter=json", `--outputFile=${output}/regression.json`]);
  } else {
    if (mode !== "browser") {
    await command("unit-and-database", "pnpm", ["exec", "vitest", "run", "--maxWorkers=2", "--reporter=json", `--outputFile=${output}/tests.json`], 600_000);
    env.RUN_JUDGEOPS_DB_TESTS = "1";
    await command("workflow-database", "pnpm", ["exec", "vitest", "run", "tests/agent-ops.integration.test.ts", "tests/ops-workflow.integration.test.ts", "--maxWorkers=1", "--no-file-parallelism"]);
    delete env.RUN_JUDGEOPS_DB_TESTS;
    await command("lint", "pnpm", ["lint"]);
    for (const name of ["api", "web", "judge", "ops-runner"]) await command(`typecheck-${name}`, "pnpm", ["--filter", `@oj/${name}`, "typecheck"]);
    const built = await command("build-api", "pnpm", ["--filter", "@oj/api", "build"]);
    if (built) {
      await command("http-business-flows", "node", ["scripts/test-api-runtime.mjs"]);
      await command("workflow-http", "node", ["--import", "./packages/db/node_modules/tsx/dist/loader.mjs", "scripts/operations/verify-judgeops.ts"]);
    }
    }
    if (mode === "browser") await command("build-api", "pnpm", ["--filter", "@oj/api", "build"]);
    env.NODE_ENV = "production";
    env.NODE_OPTIONS = "--max-old-space-size=2048";
    env.API_INTERNAL_URL = "http://127.0.0.1:55440";
    env.NEXT_PUBLIC_API_URL = "http://127.0.0.1:55440";
    env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES = "/opt/oj/scripts/operations/sandbox/font-responses.cjs";
    env.PLAYWRIGHT_PRODUCTION = "1";
    if (!(await command("build-web-offline", "pnpm", ["--filter", "@oj/web", "build"], 600_000))) throw new Error("Offline candidate build failed");
    await command("browser-core-flows", "pnpm", ["exec", "playwright", "test", "tests/e2e/account-security.spec.ts", "tests/e2e/practice-workspace.spec.ts", "tests/e2e/pricing.spec.ts", "tests/e2e/agent-ops.spec.ts"], 600_000);
  }
} catch { checks.push({ name: "harness", status: "FAIL", durationMs: 0, detail: "隔離環境無法完成，不能視為測試通過" }); }
finally {
  for (const child of children) child.kill("SIGTERM");
  let regression = null;
  try {
    const file = `${output}/regression.json`; if ((await stat(file)).size < 5_000_000) {
      const result = JSON.parse(await readFile(file, "utf8"));
      regression = { passed: result.numPassedTests, failed: result.numFailedTests, total: result.numTotalTests, runtimeErrors: result.numRuntimeErrorTestSuites ?? 0, failedAssertions: result.testResults?.flatMap(t => t.assertionResults ?? []).filter(t => t.status === "failed").length ?? 0 };
    }
  } catch {}
  for (const [name, file] of [["memory-events", "/sys/fs/cgroup/memory.events"], ["memory-peak", "/sys/fs/cgroup/memory.peak"]]) { try { await writeFile(`${output}/${name}.log`, await readFile(file)); } catch {} }
  console.log(JSON.stringify({ event: "result", checks, regression }));
  process.exitCode = checks.some(c => c.status === "FAIL") ? 1 : 0;
}
