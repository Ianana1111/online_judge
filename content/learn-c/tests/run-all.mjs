// 執行全部測試：node learning_map/tests/run-all.mjs [--only=關鍵字]
//   1. 每份 solution.c × 每個輸入（sample.in + tests/inputs/<題號>/*.in）：解譯器的輸出要和 gcc 逐字相同
//   2. 練習題（practice/*.md，之後加入）：參考解答要通過自己的測資，也要和 gcc 一致
//   3. 解譯器單元測試（unit-cases.mjs）：和 gcc 對照
//   4. 錯誤訊息測試（error-cases.mjs）：錯誤種類、行號、訊息關鍵字
import { readFileSync, readdirSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInterp } from './load-interp.mjs';
import unitCases from './unit-cases.mjs';
import errorCases from './error-cases.mjs';
import { animSmoke } from './anim-smoke.mjs';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
// 內容（練習、題目）在家教資料夾：--content=<learning_map 資料夾> 或環境變數 LEARN_C_CONTENT。
// 沒給的話只跑不需要內容的測試（解譯器單元測試、錯誤訊息、trace、動畫）。
const contentArg = (process.argv.find((a) => a.startsWith('--content=')) || '').slice(10) || process.env.LEARN_C_CONTENT || '';
const CONTENT = contentArg ? join(contentArg) : '';
const root = !CONTENT ? '' : existsSync(join(CONTENT, 'problems')) ? join(CONTENT, 'problems') : join(CONTENT, '..');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
const CInterp = loadInterp();
const work = mkdtempSync(join(tmpdir(), 'c-map-test-'));

// ---------- gcc ----------
// 同時最多跑 6 個 gcc（編譯或執行），太多會讓機器變慢、程式被逾時砍掉
let running = 0;
const waiting = [];
async function limited(fn) {
  if (running >= 6) await new Promise((r) => waiting.push(r));
  running++;
  try { return await fn(); } finally { running--; if (waiting.length) waiting.shift()(); }
}
const bins = new Map();
async function gccBinary(src) {
  const key = createHash('sha256').update(src).digest('hex').slice(0, 16);
  if (!bins.has(key)) {
    bins.set(key, (async () => {
      const file = join(work, key + '.c'), bin = join(work, key);
      writeFileSync(file, src);
      await limited(() => run('gcc', ['-std=c17', '-O0', '-Wall', '-o', bin, file, '-lm']));
      return bin;
    })());
  }
  return bins.get(key);
}
async function gccRun(src, input) {
  const bin = await gccBinary(src);
  return limited(() => new Promise((resolve, reject) => {
    const child = execFile(bin, { maxBuffer: 1 << 26, timeout: 20000 }, (err, stdout) => {
      if (err && err.killed) reject(err); else resolve(stdout);
    });
    child.stdin.end(input);
  }));
}

// ---------- 執行並收集結果 ----------
const results = [];
const record = (group, name, ok, detail) => results.push({ group, name, ok, detail });
const firstDiff = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const line = a.slice(0, i).split('\n').length;
  return `第 ${line} 行開始不同：解譯器 ${JSON.stringify(a.slice(i, i + 40))}，gcc ${JSON.stringify(b.slice(i, i + 40))}`;
};
async function compareWithGcc(group, name, src, input, opts = {}) {
  if (only && !`${group} ${name}`.includes(only)) return;
  const t0 = Date.now();
  const r = CInterp.run(src, { input, maxSteps: opts.maxSteps || 50000000 });
  const ms = Date.now() - t0;
  let want;
  try { want = await gccRun(src, input); } catch (e) { record(group, name, false, 'gcc 執行失敗：' + e.message); return; }
  if (r.status !== 'ok') return record(group, name, false, `解譯器 ${r.status}：第 ${r.error && r.error.line} 行 ${r.error && r.error.msg}${r.internal ? '\n' + r.internal : ''}`);
  if (r.out !== want) return record(group, name, false, firstDiff(r.out, want));
  if (opts.noWarnings && r.warnings.length) return record(group, name, false, '不應該有警告：' + JSON.stringify(r.warnings));
  record(group, name, true, `${r.steps} 步，${ms} ms`);
}

async function solutions() {
  if (!root) return;
  const jobs = [];
  for (const cls of ['0_class', '1_class']) {
    const dir = join(root, cls);
    if (!existsSync(dir)) continue;
    for (const p of readdirSync(dir).filter((x) => /^P\d+$/.test(x)).sort()) {
      const code = `${cls[0]}-${p}`, pdir = join(dir, p);
      const src = readFileSync(join(pdir, 'solution.c'), 'utf8');
      const inputs = [];
      if (existsSync(join(pdir, 'sample.in'))) inputs.push(['sample.in', readFileSync(join(pdir, 'sample.in'), 'utf8')]);
      const extra = join(here, 'inputs', code);
      if (existsSync(extra)) for (const f of readdirSync(extra).sort()) inputs.push([f, readFileSync(join(extra, f), 'utf8')]);
      if (!inputs.length) { record('solution', code, false, '沒有 sample.in'); continue; }
      for (const [f, input] of inputs) jobs.push(compareWithGcc('solution', `${code} ${f}`, src, input, { noWarnings: true }));
    }
  }
  await Promise.all(jobs);
}

async function practice() {
  if (!CONTENT) return;
  const dir = join(CONTENT, 'practice');
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  if (!files.length) return;
  const { parsePractice } = await import('./practice-parse.mjs');
  const jobs = [];
  for (const f of files) {
    const p = parsePractice(readFileSync(join(dir, f), 'utf8'), f);
    p.tests.forEach((t, i) => {
      jobs.push((async () => {
        const name = `${p.id} #${i + 1}`;
        if (only && !`practice ${name}`.includes(only)) return;
        const r = CInterp.run(p.solution, { input: t.input });
        const norm = (s) => s.split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n').replace(/\n+$/, '');
        if (r.status !== 'ok') return record('practice', name, false, `參考解答 ${r.status}：${r.error && r.error.msg}`);
        if (norm(r.out) !== norm(t.output)) return record('practice', name, false, '參考解答沒通過測資：' + firstDiff(norm(r.out), norm(t.output)));
        await compareWithGcc('practice', name + '（gcc）', p.solution, t.input, { noWarnings: true });
      })());
    });
  }
  await Promise.all(jobs);
}

async function units() {
  await Promise.all(unitCases.map((u) => compareWithGcc('unit', u.name, u.src, u.input || '')));
}

function errors() {
  for (const c of errorCases) {
    if (only && !`error ${c.name}`.includes(only)) continue;
    const r = CInterp.run(c.src, { input: c.input || '' });
    const problems = [];
    if (r.status !== c.status) problems.push(`狀態是 ${r.status}，應該是 ${c.status}`);
    if (c.line !== undefined && (!r.error || r.error.line !== c.line)) problems.push(`行號是 ${r.error && r.error.line}，應該是 ${c.line}`);
    for (const h of [].concat(c.has || [])) if (!r.error || !r.error.msg.includes(h)) problems.push(`訊息裡沒有「${h}」`);
    if (c.warn && !r.warnings.some((w) => w.msg.includes(c.warn))) problems.push(`警告裡沒有「${c.warn}」`);
    if (c.out !== undefined && r.out !== c.out) problems.push(`輸出是 ${JSON.stringify(r.out)}，應該是 ${JSON.stringify(c.out)}`);
    if (r.internal) problems.push(r.internal);
    const shown = r.error ? `第 ${r.error.line} 行：${r.error.msg}` : (r.warnings[0] ? `警告 第 ${r.warnings[0].line} 行：${r.warnings[0].msg}` : '');
    record('error', c.name, problems.length === 0, problems.length ? problems.join('；') + `\n      實際：${shown}` : shown);
  }
}

// 逐步執行（trace）：記錄的行號、說明和變數值要正確
function traces() {
  const check = (name, src, fn) => {
    if (only && !`trace ${name}`.includes(only)) return;
    const r = CInterp.run(src, { trace: true });
    let msg = '';
    try { msg = fn(r.trace, r) || ''; } catch (e) { msg = e.message; }
    record('trace', name, !msg && r.status === 'ok', msg || `${r.trace.length} 步`);
  };
  check('for 迴圈的步驟順序', `#include <stdio.h>
int main() {
    int s = 0;
    for (int k = 0; k < 2; k++) {
        s += k;
    }
    printf("%d", s);
    return 0;
}`, (tr) => {
    const got = tr.map((t) => `${t.line}${t.note ? ':' + t.note : ''}`).join(' ');
    const want = '2:呼叫 main() 3 4:初始化 4:檢查條件 5 4:更新 4:檢查條件 5 4:更新 4:檢查條件 7 8:回傳 0 9:程式結束';
    if (got !== want) return `步驟是 ${got}`;
    const last = tr[tr.length - 2];
    const s = last.frames[0].vars.find((v) => v.name === 's');
    if (!s || s.val !== '1' || last.out !== '1') return '最後的變數或輸出不對：' + JSON.stringify(last);
    if (tr[3].frames[0].vars.map((v) => v.name).join(',') !== 's,k') return '迴圈裡應該看得到 s 和 k';
    if (tr[tr.length - 3].frames[0].vars.some((v) => v.name === 'k')) return '離開迴圈後 k 應該消失';
  });
  check('函式呼叫與陣列', `#include <stdio.h>
int add(int a, int b) {
    return a + b;
}
int main() {
    int a[3] = {1, 2, 3};
    char s[4] = "hi";
    int *p = &a[1];
    int x = add(a[0], *p);
    return 0;
}`, (tr) => {
    const call = tr.find((t) => t.note === '呼叫 add(1, 2)');
    if (!call || call.frames.length !== 2 || call.frames[1].name !== 'add()') return '找不到呼叫 add(1, 2) 的步驟';
    const ret = tr.find((t) => t.note === '回傳 3');
    if (!ret) return '找不到回傳 3';
    const end = tr[tr.length - 2].frames[0].vars;
    const a = end.find((v) => v.name === 'a'), s = end.find((v) => v.name === 's'), p = end.find((v) => v.name === 'p');
    if (a.cells.join(',') !== '1,2,3' || a.dims[0] !== 3) return '陣列 a 不對：' + JSON.stringify(a);
    if (s.str !== 'hi' || s.cells[2] !== "'\\0'") return '字串 s 不對：' + JSON.stringify(s);
    if (p.val !== '→ a[1]') return '指標 p 不對：' + JSON.stringify(p);
    if (end.find((v) => v.name === 'x').val !== '3') return 'x 應該是 3';
  });
}

const t0 = Date.now();
await Promise.all([solutions(), practice(), units()]);
errors();
traces();
// 動畫：每一步都能 render（直接載入網站的動畫模組）
for (const a of await animSmoke()) if (!only || `anim ${a.name}`.includes(only)) record('anim', a.name, !a.error, a.error || `${a.steps} 步`);
rmSync(work, { recursive: true, force: true });

const verbose = process.argv.includes('--verbose');
const groups = ['solution', 'practice', 'unit', 'error', 'trace', 'anim'];
let fail = 0;
for (const g of groups) {
  const rs = results.filter((r) => r.group === g);
  if (!rs.length) continue;
  const bad = rs.filter((r) => !r.ok);
  fail += bad.length;
  console.log(`\n== ${g}：${rs.length - bad.length}/${rs.length} 通過`);
  for (const r of rs) if (!r.ok || verbose) console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? '  ' + r.detail : ''}`);
}
console.log(`\n${fail ? `✗ ${fail} 項失敗` : '✓ 全部通過'}（${((Date.now() - t0) / 1000).toFixed(1)} 秒）`);
process.exit(fail ? 1 : 0);
