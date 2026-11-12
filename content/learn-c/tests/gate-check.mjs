// 權限檢查：網站外殼（不含內容）向 API 拿內容時，各種回應要顯示對的畫面。
//   node content/learn-c/tests/gate-check.mjs --content=<家教的 learning_map 資料夾>
// 用 Playwright 攔截 API 請求，模擬：沒登入、登入憑證過期但 refresh 成功、不是學生、伺服器錯誤。
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').slice(n.length + 3);
const content = arg('content') || process.env.LEARN_C_CONTENT;
if (!content) { console.error('請用 --content=<家教的 learning_map 資料夾> 指定內容'); process.exit(1); }
const pwPath = process.env.PLAYWRIGHT_PATH || '/Users/liyichen/Desktop/WorkingBabe/Projects/online_judge/node_modules/.pnpm/playwright@1.63.0/node_modules/playwright';
const { chromium } = createRequire(import.meta.url)(pwPath);

const port = 4193, origin = `http://127.0.0.1:${port}`;
const site = mkdtempSync(join(tmpdir(), 'learn-c-site-'));
const build = join(here, '..', 'build.mjs');
// API 用同一個網域的 /api（serve.mjs 的 CSP 只允許 'self'；正式站的 CSP 會允許 api.judge.tw）
execFileSync('node', [build, `--content=${content}`, `--site=${site}`, `--api=${origin}/api`, '--base=/'], { stdio: 'ignore' });
const data = JSON.parse(readFileSync(join(here, '..', 'dist', 'content.json'), 'utf8'));
const server = await serve(site, port);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];

async function scenario(name, handlers, expect) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/status of (401|403|404|500)/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  let contentCalls = 0;
  await page.route('**/api/learn/c/content', (r) => { contentCalls++; return handlers.content(r, contentCalls); });
  await page.route('**/api/auth/refresh', (r) => handlers.refresh(r));
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  let msg = '';
  try { msg = await expect(page, contentCalls); } catch (e) { msg = e.message; }
  if (errors.length) msg += ' 主控台錯誤：' + errors.join(' | ');
  results.push({ name, ok: !msg, msg });
  await page.close();
}
const json = (status, body) => (r) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
const gateText = (page) => page.$eval('#gate', (g) => (g.hidden ? '' : g.textContent));
const shown = async (page) => page.locator('#metro tr').count();

try {
  await scenario('沒登入：顯示「請先登入」，不顯示內容', { content: json(401, {}), refresh: json(401, {}) }, async (page) => {
    const t = await gateText(page);
    if (!t.includes('請先登入')) return `畫面是：${t}`;
    if (await shown(page)) return '不應該顯示路線圖';
    if (await page.locator('#gate a[href="/login"]').count() !== 1) return '應該要有登入連結';
  });
  await scenario('登入憑證過期：refresh 成功後重試，顯示內容', {
    content: (r, n) => (n === 1 ? json(401, {})(r) : json(200, data)(r)),
    refresh: json(200, { csrfToken: 'x' }),
  }, async (page, calls) => {
    if (calls !== 2) return `內容請求應該是 2 次，實際 ${calls} 次`;
    if (await gateText(page)) return '說明框應該要藏起來';
    if (await shown(page) < 5) return '應該要顯示路線圖';
    if (await page.evaluate(() => document.body.classList.contains('locked'))) return 'body 不應該還是 locked';
  });
  await scenario('不是學生：顯示「還沒有開通」', { content: json(403, { code: 'NOT_STUDENT' }), refresh: json(200, {}) }, async (page) => {
    const t = await gateText(page);
    if (!t.includes('還沒有開通')) return `畫面是：${t}`;
    if (await shown(page)) return '不應該顯示路線圖';
  });
  await scenario('還沒發布：顯示「內容還沒發布」', { content: json(404, { code: 'NOT_PUBLISHED' }), refresh: json(200, {}) }, async (page) => {
    const t = await gateText(page);
    if (!t.includes('還沒發布')) return `畫面是：${t}`;
  });
  await scenario('伺服器錯誤：顯示「載入失敗」', { content: json(500, {}), refresh: json(200, {}) }, async (page) => {
    const t = await gateText(page);
    if (!t.includes('載入失敗')) return `畫面是：${t}`;
  });
} finally {
  await browser.close();
  server.close();
  rmSync(site, { recursive: true, force: true });
}
let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : '\n    ' + r.msg}`); }
process.exit(fail ? 1 : 0);
