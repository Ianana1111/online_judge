// 瀏覽器實測：用真的 Chrome（Playwright）在嚴格 CSP 底下打開頁面，檢查主控台沒有錯誤，並截圖。
//   node learning_map/tests/browser-check.mjs [--dir=dist] [--shots=截圖資料夾]
// Playwright 用 online_judge repo 裡安裝的版本（或環境變數 PLAYWRIGHT_PATH 指定）。
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').slice(n.length + 3) || d;
const dir = resolve(arg('dir', join(here, '..', 'dist')));
const shots = resolve(arg('shots', join(here, '..', 'dist-shots')));
const base = arg('base', '');
const pwPath = process.env.PLAYWRIGHT_PATH || '/Users/liyichen/Desktop/WorkingBabe/Projects/online_judge/node_modules/.pnpm/playwright@1.63.0/node_modules/playwright';
const { chromium } = createRequire(import.meta.url)(pwPath);
mkdirSync(shots, { recursive: true });

const port = 4190;
const server = base ? null : await serve(dir, port);
const url = base || `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

async function newPage(viewport) {
  const page = await browser.newPage({ viewport });
  page.errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') page.errors.push(m.text()); });
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  return page;
}

try {
  const page = await newPage({ width: 1360, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle' });
  check('頁面載入、路線圖出現', await page.locator('#metro tr').count() > 5);
  await page.screenshot({ path: join(shots, '01-top.png') });

  // 每一章都捲過去，讓章節、動畫、練習都初始化
  const chapters = await page.$$eval('.chapter[id^=ch-]', (s) => s.map((x) => x.id));
  for (const id of chapters) {
    await page.evaluate((h) => { document.querySelector(`a[href="#${h}"]`).click(); }, id);
    await page.waitForTimeout(250);
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(250);
  }
  check('13 個章節都渲染了', await page.locator('.ch-body .loading').count() === 0);

  // 抽屜：在這裡執行範例
  await page.evaluate(() => document.querySelector('[data-open="1_class/P8"]').click());
  await page.click('#tabCode');
  await page.click('#dRun [data-act="run"]');
  await page.waitForSelector('#dRun .res-out', { timeout: 15000 });
  const out = await page.textContent('#dRun .res-out pre');
  check('抽屜裡執行 1-P8 範例', out.trim() === '67\n13015\n442011', out);
    check('程式在 Web Worker 裡執行（沒有退回頁面上執行）', await page.evaluate(() =>
      performance.getEntriesByType('resource').some((e) => /\/worker\.js/.test(e.name)) && !window.CInterp));
  await page.screenshot({ path: join(shots, '02-drawer-run.png') });
  await page.click('#dRun [data-act="trace"]');
  await page.waitForSelector('#dRun .pl', { timeout: 15000 });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  check('抽屜裡逐步執行', await page.locator('#dRun .pl-l.cur').count() === 1);
  await page.screenshot({ path: join(shots, '03-drawer-trace.png') });
  await page.click('#dPanel .close');

  // 練習：故意寫錯，再改對
  const first = await page.$('.practice[data-practice]');
  if (first) {
    const id = await first.getAttribute('data-practice');
    await page.evaluate((i) => { location.hash = '#pr-' + i; }, id);
    await page.evaluate((i) => document.getElementById('pr-' + i).scrollIntoView(), id);
    await page.waitForSelector(`#pr-${id} .ed-ta`, { timeout: 10000 });
    const align = await page.evaluate((i) => {
      const ta = document.querySelector(`#pr-${i} .ed-ta`), code = document.querySelector(`#pr-${i} .ed-hl code`), pre = code.parentElement;
      const a = getComputedStyle(ta), c = getComputedStyle(code), p = getComputedStyle(pre);
      return [a.fontSize === c.fontSize, a.paddingLeft === p.paddingLeft, c.paddingLeft === '0px', a.lineHeight === p.lineHeight].join(',');
    }, id);
    check('編輯器：上色的文字和輸入框對齊（字型、padding、行高一樣）', align === 'true,true,true,true', align);
    await page.fill(`#pr-${id} .ed-ta`, '#include <stdio.h>\nint main() {\n    printf("wrong\\n")\n    return 0;\n}\n');
    await page.click(`#pr-${id} [data-a="check"]`);
    await page.waitForSelector(`#pr-${id} .res-err`, { timeout: 15000 });
    check('練習：編譯錯誤會顯示並標出行號', (await page.textContent(`#pr-${id} .res-err`)).includes('第 3 行'));
    await page.fill(`#pr-${id} .ed-ta`, '#include <stdio.h>\nint main() {\n    printf("wrong\\n");\n    return 0;\n}\n');
    await page.click(`#pr-${id} [data-a="check"]`);
    await page.waitForSelector(`#pr-${id} .res-fail`, { timeout: 15000 });
    check('練習：答錯會顯示差異', await page.locator(`#pr-${id} .diff`).count() > 0);
    await page.screenshot({ path: join(shots, '04-practice-wrong.png'), fullPage: false });
    const sol = await page.evaluate((i) => window.LM_DATA.practice.find((p) => p.id === i).solution, id);
    await page.fill(`#pr-${id} .ed-ta`, sol);
    await page.click(`#pr-${id} [data-a="check"]`);
    await page.waitForSelector(`#pr-${id} .res-pass`, { timeout: 15000 });
    check('練習：寫對會全部通過、側欄進度更新', (await page.textContent('.route')).includes('練習 1/'));
    await page.screenshot({ path: join(shots, '05-practice-pass.png') });
  }

  // 動畫：按下一步
  // 從頭捲到尾，讓所有延遲初始化的元件都初始化
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
  });
  await page.waitForTimeout(300);
  const animTotal = await page.locator('.anim').count();
  check('每個動畫都初始化了（沒有「找不到動畫」）', await page.locator('.anim.ready').count() === animTotal && await page.locator('.anim .box.warn').count() === 0, `${animTotal} 個`);
  for (const [name, clicks] of [['compile-pipeline', 3], ['int-overflow', 2], ['scanf-buffer', 9], ['else-if-flow', 2], ['row-major', 6], ['magic-square', 5], ['call-stack', 2], ['pointer-arrow', 3], ['cola-sim', 6]]) {
    const anim = await page.$(`.anim[data-anim="${name}"]`);
    if (!anim) { check(`動畫 ${name} 在頁面上`, false); continue; }
    await anim.scrollIntoViewIfNeeded();
    await page.waitForSelector(`.anim[data-anim="${name}"].ready`, { timeout: 5000 });
    for (let i = 0; i < clicks; i++) await anim.$eval('[data-p="next"]', (b) => b.click());
    const pos = await anim.$eval('.pl-pos', (e) => e.textContent);
    check(`動畫 ${name} 可以切換步驟`, pos.startsWith(`${clicks + 1} /`), pos);
    await anim.screenshot({ path: join(shots, `06-anim-${name}.png`) });
  }
  // 逐步執行區塊
  const tr = await page.$('#ch-array [data-trace-start]') || await page.$('[data-trace-start]');
  if (tr) {
    await tr.scrollIntoViewIfNeeded();
    await tr.click();
    const box = await page.waitForSelector('.trace .pl', { timeout: 15000 });
    for (let i = 0; i < 9; i++) await page.keyboard.press('ArrowRight');
    const cells = await box.$$eval('.pa td', (t) => t.map((x) => x.textContent).join(','));
    check('章節裡的逐步執行：陣列格子會更新', /10,20/.test(cells), cells);
    await box.screenshot({ path: join(shots, '07-trace.png') });
  }
  // 搜尋
  await page.fill('#search', '溢位');
  check('搜尋有結果', await page.locator('#searchResults a').count() > 0);
  await page.screenshot({ path: join(shots, '08-search.png') });
  check('主控台沒有錯誤（含 CSP）', page.errors.length === 0, page.errors.slice(0, 5).join('\n'));

  // 手機版
  const phone = await newPage({ width: 390, height: 844 });
  await phone.goto(url + '#ch-loop', { waitUntil: 'networkidle' });
  await phone.waitForTimeout(500);
  await phone.screenshot({ path: join(shots, '09-phone.png') });
  const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('手機版沒有水平捲動', overflow <= 1, `多出 ${overflow}px`);
  check('手機版主控台沒有錯誤', phone.errors.length === 0, phone.errors.slice(0, 5).join('\n'));
} catch (e) {
  check('執行過程沒有例外', false, e.stack);
} finally {
  await browser.close();
  if (server) server.close();
}
let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? '✓' : '✗'} ${r.name}${!r.ok && r.detail ? '\n    ' + r.detail : ''}`); }
console.log(`\n截圖：${shots}`);
process.exit(fail ? 1 : 0);
