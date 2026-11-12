// 動畫的煙霧測試：在 Node 裡載入打包後的 app.js（用假的 DOM），把每個動畫的每一步都 render 一次，不能丟例外。
// 需要先跑 node learning_map/build.mjs。回傳 [{ name, steps, error }]。
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export function animSmoke() {
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'app.js');
  if (!existsSync(file)) return [{ name: 'dist/app.js', steps: 0, error: '找不到 dist/app.js，請先執行 build.mjs' }];
  const noop = () => {};
  const ctx = {
    window: { LM_DATA: { chapters: [], problems: [], practice: [] }, matchMedia: () => ({ matches: false }) },
    document: { addEventListener: noop, createElement: () => ({}), querySelector: () => null },
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    IntersectionObserver: class { observe() {} }, history: {}, location: { hash: '' },
  };
  const src = readFileSync(file, 'utf8').replace(/\nLoader\.start\(\);\n/, '\nglobalThis.__ANIMS = ANIMS;\n');
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return Object.entries(ctx.__ANIMS).map(([name, def]) => {
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
}
