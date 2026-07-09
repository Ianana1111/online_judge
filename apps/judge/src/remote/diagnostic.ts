/**
 * Run this once real UVa credentials are available, BEFORE trusting the remote judge in
 * production: it logs in and dumps everything the scraper parsed off the real, authenticated
 * submit-problem page, so any mismatch against uvaClient.ts's assumptions is obvious immediately
 * instead of surfacing as a mysterious SE on a real submission.
 *
 * Usage: UVA_BOT_USERNAME=... UVA_BOT_PASSWORD=... pnpm exec tsx src/remote/diagnostic.ts <uvaProblemNumber>
 * Example: UVA_BOT_USERNAME=foo UVA_BOT_PASSWORD=bar pnpm exec tsx src/remote/diagnostic.ts 36
 */
import { fetchWithJar, findUhuntUid, parseForm, uvaLogin } from "./uvaClient.js";

async function main() {
  const problemNumber = parseInt(process.argv[2] ?? "", 10);
  const username = process.env.UVA_BOT_USERNAME;
  const password = process.env.UVA_BOT_PASSWORD;

  if (!problemNumber || !username || !password) {
    console.error("Usage: UVA_BOT_USERNAME=... UVA_BOT_PASSWORD=... tsx src/remote/diagnostic.ts <uvaProblemNumber>");
    process.exit(1);
  }

  console.log(`Logging in as ${username}...`);
  const session = await uvaLogin(username, password);
  console.log("Login looked successful (no login form detected on the post-login page).");
  console.log("Session cookies:", Object.keys(session.jar));

  console.log(`\nResolving uHunt uid for ${username} (via the logged-in nav link, not uHunt's own name lookup — that endpoint proved unreliable for freshly-registered accounts)...`);
  const uid = await findUhuntUid(session);
  console.log(`uHunt uid = ${uid}`);

  console.log(`\nFetching submit-problem page for UVa problem ${problemNumber}...`);
  const page = await fetchWithJar(
    `https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=submit_problem&problemid=${problemNumber}&category=0`,
    session.jar,
  );
  const form = parseForm(page.body, /save_submission|problemid/);
  if (!form) {
    console.error("Could not find a submission form on this page. Dumping raw HTML for inspection:");
    console.error(page.body.slice(0, 4000));
    process.exit(1);
  }

  console.log("\nParsed submission form:");
  console.log("  action:", form.action);
  console.log("  enctype:", form.enctype);
  console.log("  hidden fields:", form.hidden);
  console.log("  choice fields (select/radio) and options:");
  for (const [name, opts] of Object.entries(form.choices)) {
    console.log(`    ${name}:`, opts);
  }
  console.log("  textarea fields:", form.textareaNames);
  console.log("  file input fields:", form.fileInputNames);

  console.log(
    "\nCompare the above against uvaClient.ts's assumptions (langFieldName heuristic, " +
      "codeFieldName heuristic, hidden-field replay). Adjust there if anything looks off, then " +
      "re-run this script before enabling remote judging for real submissions.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
