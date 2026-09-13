import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compileInSandbox, runOneCase } from "../apps/judge/src/local/sandboxRun";
import { LANGUAGES } from "../apps/judge/src/local/languages";
import { checkOutput } from "../apps/judge/src/local/checkers";
import { createDockerSandbox } from "./support/docker-sandbox";
import { createVercelSandbox } from "./support/vercel-sandbox";

describe("judge output contracts", () => {
  it("rejects non-finite tolerance and non-decimal numeric disguises", () => {
    expect(() => checkOutput("FLOAT", "1", "9", NaN)).toThrow();
    expect(() => checkOutput("FLOAT", "1", "9", Infinity)).toThrow();
    expect(checkOutput("FLOAT", "16", "0x10", 0.001)).toBe(false);
    expect(checkOutput("FLOAT", "1", "NaN", 0.001)).toBe(false);
    expect(checkOutput("FLOAT", "value 1.0", "value 1e0", 0.001)).toBe(true);
    expect(checkOutput("FLOAT", "value 1.0", "wrong 1e0", 0.001)).toBe(false);
  });
  it("keeps exact and whitespace-tolerant policies distinct", () => {
    expect(checkOutput("EXACT", "1\n", "1", null)).toBe(false);
    expect(checkOutput("IGNORE_TRAILING_WS", "1\n", "1 \r\n", null)).toBe(true);
    expect(checkOutput("IGNORE_TRAILING_WS", "1 2", "12", null)).toBe(false);
    expect(() => checkOutput("SPECIAL", "1", "1", null)).toThrow();
  });
});

// Docker remains the default CI fixture. Vercel validation is a separate explicit opt-in and
// uses the production creation path, snapshot and deny-all network policy.
const useVercel = process.env.RUN_VERCEL_SANDBOX_TESTS === "1";
describe.skipIf(process.env.RUN_SANDBOX_TESTS !== "1" && !useVercel)(`untrusted compiler and process isolation on ${useVercel ? "Vercel" : "Linux"}`, () => {
  let fixture: Awaited<ReturnType<typeof createDockerSandbox>>;
  beforeEach(async () => { fixture = await (useVercel ? createVercelSandbox() : createDockerSandbox()); }, 60_000);
  afterEach(async () => { if (fixture) await fixture.stop(); }, 30_000);
  async function compile(language: string, code: string) { const result = await compileInSandbox(fixture.sandbox, LANGUAGES[language], code); expect(result).toEqual({ ok: true }); }
  const run = (language = "python3", input = "", timeMs = 1000) => runOneCase(fixture.sandbox, LANGUAGES[language].runCmd({ memKb: 262144 }), input, timeMs, 262144, LANGUAGES[language].ulimitMemory);
  it.each([
    ["cpp17", '#include <iostream>\nint main(){int x;std::cin>>x;std::cout<<x+1;}'],
    ["c11", '#include <stdio.h>\nint main(){int x;scanf("%d",&x);printf("%d",x+1);}'],
    ["python3", 'print(int(input())+1)'],
    ["java17", 'import java.util.*; public class Main { public static void main(String[] a){System.out.println(new Scanner(System.in).nextInt()+1);}}'],
  ])("accepts correct %s programs in the restricted environment", async (language, code) => {
    await compile(language, code); const result = await run(language, "41\n", 3000); expect(result.stdout.trim()).toBe("42"); expect(result.exitCode).toBe(0);
  });
  it("cannot elevate privilege or modify trusted verdict artifacts", async () => {
    await compile("python3", 'import os, subprocess\nprint(os.getuid())\nprint(subprocess.run(["sudo", "-n", "true"], capture_output=True).returncode != 0)\ntry:\n open("/vercel/sandbox/.oj-control/exit.txt", "w").write("0")\n print("forged")\nexcept PermissionError: print("blocked")\n');
    const result = await run(); expect(result.stdout.trim().split("\n")).toEqual(["60001", "True", "blocked"]); expect(result.exitCode).toBe(0);
  });
  it("removes files between cases and does not expose inherited environment secrets", async () => {
    await compile("python3", 'import os\nprint(os.path.exists("/tmp/remember"))\nopen("/tmp/remember", "w").write("previous")\nprint(os.environ.get("DATABASE_URL", "absent"))');
    for (let i = 0; i < 2; i++) { const result = await run(); expect(result, JSON.stringify(result)).toMatchObject({ exitCode: 0, timedOut: false }); expect(result.stdout.trim()).toBe("False\nabsent"); }
  });
  it("enforces sub-second deadlines even when code ignores termination", async () => {
    await compile("python3", 'import signal\nsignal.signal(signal.SIGTERM, signal.SIG_IGN)\nwhile True: pass');
    const result = await run("python3", "", 200); expect(result.timedOut).toBe(true); expect(result.timeMs).toBeLessThan(1000);
  });
  it.each(["import sys; sys.exit(124)", "import os, signal; os.kill(os.getpid(), signal.SIGKILL)"])("does not mistake a program's own termination for a deadline: %s", async (code) => {
    await compile("python3", code); const result = await run(); expect(result.exitCode).not.toBe(0); expect(result.timedOut).toBe(false);
  });
  it("caps output at the process and keeps results from being rewritten through cwd files", async () => {
    await compile("python3", 'open("time.log", "w").write("fake")\nwhile True: print("X" * 8192)');
    const result = await run(); expect(Buffer.byteLength(result.stdout)).toBeLessThanOrEqual(8 * 1024 * 1024); expect(result.exitCode).not.toBe(0); expect(result.timeMs).toBeGreaterThanOrEqual(0);
  });
  it("blocks outbound HTTPS requests from submitted programs", async () => {
    // The provider's egress gateway can accept TCP before rejecting TLS/SNI. A successful
    // connect() alone does not prove access to the destination service.
    await compile("python3", 'import urllib.request\ntry:\n urllib.request.urlopen("https://example.com/",timeout=1).read(64)\n print("connected")\nexcept OSError: print("blocked")');
    const result = await run("python3", "", 3000); expect(result.stdout.trim()).toBe("blocked"); expect(result.exitCode).toBe(0);
  });
});
