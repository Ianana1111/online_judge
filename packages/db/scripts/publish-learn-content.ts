/**
 * Publishes the C learning map's content (chapters, practice, class solutions and notes) to the
 * learn_contents table, where GET /learn/c/content serves it to tutored students only.
 *
 * The content is private and the repo is public, so it never lives in git. Build it from the tutor's
 * own folder first, then publish the resulting gitignored bundle:
 *   node content/learn-c/build.mjs --content=<tutor's learning_map folder>
 *   node --import ./packages/db/node_modules/tsx/dist/loader.mjs packages/db/scripts/publish-learn-content.ts \
 *     --file=content/learn-c/dist/content.json [--apply]
 *
 * Review-only by default: prints what is live now and what would replace it. --apply writes it.
 * Publishing the same version again is a no-op.
 */
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { prisma } from "../src/index.js";

type Bundle = { version: string; content: { chapters: unknown[]; problems: unknown[]; practice: unknown[] } };

const option = (name: string) => process.argv.find((s) => s.startsWith(`--${name}=`))?.slice(name.length + 3);

async function main() {
  const file = option("file") ?? "content/learn-c/dist/content.json";
  const allowed = [resolve("content/learn-c/dist") + sep, "/private/tmp/"];
  if (!allowed.some((dir) => resolve(file).startsWith(dir))) throw new Error("--file must be the gitignored build output (content/learn-c/dist/content.json)");
  const bundle = JSON.parse(await readFile(file, "utf8")) as Bundle;
  const { chapters, problems, practice } = bundle.content ?? {};
  if (!bundle.version || !Array.isArray(chapters) || !chapters.length || !Array.isArray(problems) || !Array.isArray(practice)) {
    throw new Error("Not a learning map bundle: run content/learn-c/build.mjs first");
  }
  const apply = process.argv.includes("--apply");
  const live = await prisma.learnContent.findUnique({ where: { slug: "c" }, select: { version: true, updatedAt: true } });
  const summary = {
    apply,
    live: live ? { version: live.version, updatedAt: live.updatedAt } : null,
    next: { version: bundle.version, chapters: chapters.length, problems: problems.length, practice: practice.length },
  };
  if (live?.version === bundle.version) {
    console.log(JSON.stringify({ ...summary, status: "ALREADY_LIVE" }, null, 2));
    return;
  }
  if (apply) {
    await prisma.learnContent.upsert({
      where: { slug: "c" },
      create: { slug: "c", version: bundle.version, content: bundle.content as object },
      update: { version: bundle.version, content: bundle.content as object },
    });
  }
  console.log(JSON.stringify({ ...summary, status: apply ? "PUBLISHED" : "READY (add --apply to publish)" }, null, 2));
}

main()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
