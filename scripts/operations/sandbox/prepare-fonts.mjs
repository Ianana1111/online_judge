/** Reuse the real font bytes from the trusted build during offline candidate builds. */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const cssDir = "/opt/oj/apps/web/.next/static/css", media = "/opt/oj/apps/web/.next/static/media";
const rules = new Set();
for (const file of await readdir(cssDir)) {
  const css = await readFile(join(cssDir, file), "utf8");
  for (const match of css.matchAll(/@font-face\{([^}]+)\}/g)) {
    const body = match[1];
    if (!/font-family:(?:["']?Noto Sans TC["']?|__Noto_Sans_TC_[^;]+);/.test(body) || !body.includes(".woff2")) continue;
    const source = body.match(/src:url\(["']?\/_next\/static\/media\/([^"')]+)["']?\)/)?.[1];
    if (!source || !/^[a-z0-9.-]+\.woff2$/.test(source)) throw new Error("Unexpected trusted font path");
    await readFile(join(media, source));
    const rule = body.replace(/font-family:[^;]+;/, "font-family:'Noto Sans TC';").replace(/src:url\([^)]+\)/, `src:url(${join(media, source)})`).replace(/;/g, ";\n").replace(/:\s*/g, ": ");
    rules.add(`/* ${/unicode-range:u\+0-ff[,;]/i.test(body) ? "latin" : "cjk"} */\n@font-face {\n${rule}\n}`);
  }
}
if (rules.size < 2) throw new Error("Trusted Noto Sans TC font assets not found");
const css = [...rules].join("\n");
await writeFile("/opt/oj/scripts/operations/sandbox/font-responses.cjs", `module.exports = new Proxy({}, {get: (_, url) => /^https:\\/\\/fonts\\.googleapis\\.com\\/css2\\?family=Noto\\+Sans\\+TC(?::wght@100\\.\\.900)?&display=swap$/.test(String(url)) ? ${JSON.stringify(css)} : undefined});\n`);
