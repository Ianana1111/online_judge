import { createJudgeSandbox } from "../../apps/judge/src/local/sandboxRun";

/** Explicit opt-in for real Sandbox execution. Synthetic tests use this fixture;
 * the editorial audit also passes user-authorized private programs and test data. */
export async function createVercelSandbox() {
  if (process.env.RUN_VERCEL_SANDBOX_TESTS !== "1" || !process.env.JUDGE_SANDBOX_SNAPSHOT_ID) throw new Error("Explicit Vercel fixture configuration required");
  const sandbox = await createJudgeSandbox(process.env.JUDGE_SANDBOX_SNAPSHOT_ID, 120_000);
  return { sandbox, stop: async () => { await sandbox.stop(); } };
}
