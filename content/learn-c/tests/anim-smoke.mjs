// 動畫的煙霧測試：在 Node 裡載入網站的動畫模組（apps/web/lib/learn-c/app），把每個動畫的每一步都 render 一次，不能丟例外。
// 這些 .js 是給 Next.js 打包的 ES 模組；Node 會把 .js 當成 CommonJS，所以先複製成 .mjs 再載入。回傳 [{ name, steps, error }]。
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'apps', 'web', 'lib', 'learn-c', 'app');

export async function animSmoke() {
  const tmp = mkdtempSync(join(tmpdir(), 'learn-c-anims-'));
  try {
    for (const f of readdirSync(APP).filter((x) => x.endsWith('.js'))) {
      const src = readFileSync(join(APP, f), 'utf8').replace(/from "\.\/([\w-]+)\.js"/g, 'from "./$1.mjs"').replace(/import "\.\/([\w-]+)\.js"/g, 'import "./$1.mjs"');
      writeFileSync(join(tmp, f.replace(/\.js$/, '.mjs')), src);
    }
    const core = await import(pathToFileURL(join(tmp, 'anim-core.mjs')).href);
    for (const f of readdirSync(tmp).filter((x) => /^anims-.*\.mjs$/.test(x))) await import(pathToFileURL(join(tmp, f)).href);
    return Object.entries(core.ANIMS).map(([name, def]) => {
      try {
        const steps = def.steps || def.build();
        if (!steps.length) return { name, steps: 0, error: '沒有任何步驟' };
        let prev = null;
        steps.forEach((s, i) => {
          if (!s.text) throw new Error(`第 ${i + 1} 步沒有說明文字`);
          const html = def.render(s.s, prev, i);
          if (typeof html !== 'string' || !html) throw new Error(`第 ${i + 1} 步 render 沒有回傳 HTML`);
          prev = s.s;
        });
        return { name, steps: steps.length };
      } catch (e) {
        return { name, steps: 0, error: e.message };
      }
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
