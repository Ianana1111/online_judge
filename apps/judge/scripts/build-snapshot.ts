/**
 * One-time (and periodic-refresh) setup: boots a plain Vercel Sandbox, installs every toolchain
 * the local judge needs, and snapshots it. Print the resulting snapshotId and set it as
 * JUDGE_SANDBOX_SNAPSHOT_ID — every real judging sandbox then boots straight from this snapshot
 * instead of paying the ~dnf-install cost on every submission (see local/judge.ts).
 *
 * Re-run this whenever the toolchain needs to change, or periodically to pick up AL2023 package
 * updates — snapshots aren't automatically refreshed (see snapshotExpiration in the SDK).
 *
 * Usage: VERCEL_TOKEN=... VERCEL_TEAM_ID=... VERCEL_PROJECT_ID=... pnpm --filter @oj/judge exec tsx scripts/build-snapshot.ts
 */
import { Sandbox } from "@vercel/sandbox";

const PACKAGES = ["gcc-c++", "java-17-amazon-corretto-devel", "python3", "time"];

async function main() {
  console.log("Creating base sandbox...");
  const sandbox = await Sandbox.create({ runtime: "node24", timeout: 300_000, persistent: false });

  console.log(`Installing ${PACKAGES.join(", ")}...`);
  const install = await sandbox.runCommand({ cmd: "sudo", args: ["dnf", "install", "-y", ...PACKAGES] });
  if (install.exitCode !== 0) {
    console.error("Install failed:", await install.stderr());
    process.exit(1);
  }

  for (const [label, cmd, args] of [
    ["g++", "g++", ["--version"]],
    ["javac", "javac", ["--version"]],
    ["python3", "python3", ["--version"]],
    ["/usr/bin/time", "/usr/bin/time", ["--version"]],
  ] as const) {
    const r = await sandbox.runCommand(cmd, [...args]);
    console.log(`  ${label}: ${(await r.stdout()).split("\n")[0] || (await r.stderr()).split("\n")[0]}`);
  }

  console.log("\nTaking snapshot...");
  const snap = await sandbox.snapshot();
  await sandbox.stop();

  console.log(`\nDone. Set this as JUDGE_SANDBOX_SNAPSHOT_ID:\n\n  ${snap.snapshotId}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
