// Copies Monaco's prebuilt static assets into public/vs so the editor can load itself from this
// app's own origin instead of a third-party CDN. Run as a postinstall step (see package.json) —
// not committed to git (public/vs is in .gitignore), since it's fully reproducible from
// node_modules/monaco-editor, exactly the same way node_modules itself isn't committed.
//
// Before this, CodeEditor.tsx (@monaco-editor/react) loaded Monaco at runtime from
// cdn.jsdelivr.net — a single point of failure (jsDelivr is intermittently unreachable from some
// Taiwanese/campus networks, and was already the subject of a real 2026-07-17 production incident
// when CSP started enforcing) and a supply-chain risk (CSP had to allowlist the CDN in script-src,
// meaning a compromised jsDelivr could run arbitrary JS on the page where users type and submit
// code). Self-hosting removes both: the editor now loads from 'self', and the CDN is no longer in
// the CSP allowlist at all (see middleware.ts).
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "monaco-editor", "min", "vs");
const dest = path.join(__dirname, "..", "public", "vs");

if (!fs.existsSync(src)) {
  console.error(`copy-monaco: source not found at ${src} — is monaco-editor installed?`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`copy-monaco: copied ${src} -> ${dest}`);
