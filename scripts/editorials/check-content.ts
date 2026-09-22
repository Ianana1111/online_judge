/** Read-only content preflight. Does not compile, run, upload or publish solutions. */
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEditorial, loadVerification } from "./evidence";

async function main() {
  const root = process.cwd();
  const directories = await readdir(resolve(root, "content/editorials"), { withFileTypes: true });
  let drafts = 0, solutions = 0, mutations = 0, bilingual = 0;
  const failures: { slug: string; reason: string }[] = [];
  for (const directory of directories.filter(d => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    try {
      const editorial = await loadEditorial(root, directory.name);
      if (!editorial) throw new Error("Missing metadata");
      if (editorial.translations?.en) bilingual++;
      else if (process.argv.includes("--require-bilingual")) throw new Error("English teaching explanation is not complete");
      const verification = await loadVerification(root, directory.name);
      const ids = new Set<string>();
      for (const mutation of verification.review.mutations) {
        const reference = editorial.solutions.find(s => s.languageKey === mutation.languageKey);
        if (!mutation.id || ids.has(mutation.id)) throw new Error("Missing or duplicate mutation ID");
        ids.add(mutation.id);
        if (!reference || !mutation.find || reference.sourceCode.split(mutation.find).length !== 2)
          throw new Error("Mutation must match exactly one reference location");
        if (typeof mutation.replace !== "string" || mutation.find === mutation.replace)
          throw new Error("Mutation must change the reference source");
        if (mutation.expectation !== undefined && !["AC", "REJECT"].includes(mutation.expectation))
          throw new Error("Unknown mutation expectation");
      }
      drafts++;
      solutions += editorial.solutions.length;
      mutations += verification.review.mutations.length;
    } catch (error) {
      // Schema errors contain paths and limits, not hidden input/output data.
      failures.push({ slug: directory.name, reason: error instanceof Error ? error.message : "Invalid content" });
    }
  }
  console.log(JSON.stringify({ scope: "Content structure only; no execution evidence", drafts, bilingual, solutions, mutations, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch(() => { console.error("Could not read editorial content"); process.exitCode = 1; });
