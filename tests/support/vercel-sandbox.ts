import { createJudgeSandbox } from "../../apps/judge/src/local/sandboxRun";

/** Explicit opt-in: exercises the real production sandbox API with synthetic programs only. */
export async function createVercelSandbox() {
  if (process.env.RUN_VERCEL_SANDBOX_TESTS !== "1" || !process.env.JUDGE_SANDBOX_SNAPSHOT_ID) throw new Error("Explicit Vercel fixture configuration required");
  const sandbox = await createJudgeSandbox(process.env.JUDGE_SANDBOX_SNAPSHOT_ID, 120_000);
  return { sandbox, stop: async () => { await sandbox.stop(); } };
}
