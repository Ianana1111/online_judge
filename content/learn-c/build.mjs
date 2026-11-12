#!/usr/bin/env node
// 打包學習地圖的內容：
//   node content/learn-c/build.mjs --content=<家教的 learning_map 資料夾>
//
// 程式碼在公開的 repo（頁面：apps/web/app/learn/c，互動元件和 C 解譯器：apps/web/lib/learn-c，由 Next.js 打包）；
// 內容（章節、練習、題目解答和筆記）放在家教資料夾，**不能**放進 repo。內容資料夾也可以用環境變數 LEARN_C_CONTENT 指定。
//
// 輸出 content/learn-c/dist/content.json（已 gitignore），再用 packages/db/scripts/publish-learn-content.ts 寫進資料庫，
// 由 API 檢查權限後提供給學 C 的學生。打包時會檢查：引用的題目／練習／動畫都存在、:::trace 的程式能正常執行、
// 練習的參考解答通過自己的測資。
//
// 題目會自動偵測：內容資料夾的上一層裡，每個 <數字>_class/P<數字>/ 有 solution.c 的就是一題。
// 題名從 knowledge.md 的「# P1 題名：知識點筆記」抓，摘要從「> 本題主打：…」抓，
// 「這題和第 1 堂課 P5 是同一題」會自動標成重複題。problems.json（選填）可以覆寫這些欄位或指定顏色。
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parsePractice } from './tests/practice-parse.mjs';
import { loadInterp } from './tests/load-interp.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (n) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : null; };
const OUT = arg('out') ? resolve(arg('out')) : join(HERE, 'dist');
const CONTENT = resolve(arg('content') || process.env.LEARN_C_CONTENT || HERE);
if (!existsSync(join(CONTENT, 'chapters'))) {
  console.error(`找不到內容資料夾（${CONTENT}/chapters）。請用 --content=<家教的 learning_map 資料夾> 指定。`);
  process.exit(1);
}
const PROB_ROOT = existsSync(join(CONTENT, 'problems')) ? join(CONTENT, 'problems') : join(CONTENT, '..');
// 網站上的學習地圖程式（動畫名稱從這裡找）
const APP_DIR = join(HERE, '..', '..', 'apps', 'web', 'lib', 'learn-c', 'app');
const read = (p) => readFileSync(p, 'utf8');
const problems = [], warnings = [];
const warn = (m) => warnings.push(m);
let errors = 0;
const error = (m) => { errors++; console.error('錯誤：' + m); };

// ---------- 章節 ----------
const chapters = readdirSync(join(CONTENT, 'chapters')).filter((f) => f.endsWith('.md'))
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
  .map((f, k) => {
    let text = read(join(CONTENT, 'chapters', f));
    const meta = {};
    const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
    if (m) {
      m[1].split('\n').forEach((l) => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
      text = text.slice(m[0].length);
    }
    return Object.assign(meta, { md: text, num: k + 1, file: f });
  });

// ---------- 題目：自動偵測 N_class/P*，再用 problems.json 覆寫 ----------
const PALETTE = ['#8D6E00', '#4338CA', '#2E7D32', '#D7263D', '#C25E00', '#147D72', '#6A4C93', '#1F7FB8', '#5E8C1F', '#C2185B',
  '#7A4E2D', '#3F5566', '#AD1457', '#00695C', '#5D4037', '#283593', '#9E5A00', '#37474F', '#6D4C41', '#1565C0'];
const overrides = existsSync(join(CONTENT, 'problems.json')) ? JSON.parse(read(join(CONTENT, 'problems.json'))) : [];
const byId = new Map(overrides.map((p) => [p.id, p]));
const num = (s) => parseInt(s.replace(/\D/g, ''), 10);
const classes = readdirSync(PROB_ROOT).filter((d) => /^\d+_class$/.test(d)).sort((a, b) => num(a) - num(b));
const found = [];
for (const cls of classes) {
  for (const p of readdirSync(join(PROB_ROOT, cls)).filter((d) => /^P\d+$/.test(d)).sort((a, b) => num(a) - num(b))) {
    if (existsSync(join(PROB_ROOT, cls, p, 'solution.c'))) found.push({ id: `${cls}/${p}`, cls: num(cls), p });
  }
}
const ordered = [...overrides.map((o) => o.id), ...found.map((f) => f.id).filter((id) => !byId.has(id))];
const usedColors = new Set(overrides.map((o) => o.color).filter(Boolean));
let nextColor = 0;
for (const id of ordered) {
  const dir = join(PROB_ROOT, id);
  const f = (n) => (existsSync(join(dir, n)) ? read(join(dir, n)) : '');
  const notes = f('knowledge.md'), [cls, pn] = id.split('/');
  const auto = { id, code: `${num(cls)}-${pn}`, group: `第 ${num(cls)} 堂課`, title: pn, summary: '' };
  const t = /^#\s*P\d+\s*[-–:：]?\s*(.+?)(：知識點筆記)?\s*$/m.exec(notes);
  if (t) auto.title = t[1];
  const same = /同一題/.test(notes.split('\n').slice(0, 6).join('\n')) && /第\s*(\d+)\s*堂課[^P]*P(\d+)/.exec(notes);
  if (same) { auto.same = `${same[1]}_class/P${same[2]}`; auto.summary = `和第 ${same[1]} 堂課 P${same[2]} 是同一題。`; }
  const focus = /^>\s*本題主打：(.+)$/m.exec(notes);
  if (focus && !same) auto.summary = '本題主打：' + focus[1].replace(/\*\*|`/g, '');
  const p = Object.assign(auto, byId.get(id) || {});
  if (!p.color) {
    while (usedColors.has(PALETTE[nextColor % PALETTE.length]) && nextColor < PALETTE.length * 2) nextColor++;
    p.color = PALETTE[nextColor++ % PALETTE.length];
    usedColors.add(p.color);
  }
  if (p.same && byId.has(p.same) === false && !found.some((x) => x.id === p.same)) warn(`${id} 標成和 ${p.same} 同一題，但找不到那一題`);
  p.chapters = [];
  p.solution = f('solution.c');
  p.notes = notes;
  p.sampleInput = f('sample.in');
  if (!p.solution && !p.same) warn(`找不到 ${p.id}/solution.c`);
  problems.push(p);
}
const pById = Object.fromEntries(problems.map((p) => [p.id, p]));
for (const p of problems) if (p.same && pById[p.same] && !(byId.get(p.id) || {}).color) p.color = pById[p.same].color;   // 重複題用原題的顏色

// ---------- 練習 ----------
const practice = [];
const pdir = join(CONTENT, 'practice');
if (existsSync(pdir)) {
  for (const f of readdirSync(pdir).filter((x) => x.endsWith('.md')).sort()) {
    try { practice.push(parsePractice(read(join(pdir, f)), f)); } catch (e) { error(e.message); }
  }
}
const prById = {};
for (const p of practice) { if (prById[p.id]) error(`練習 id 重複：${p.id}`); prById[p.id] = p; }

// ---------- 動畫名稱（從 anims-*.js 裡的 defineAnim("名稱" 找出來） ----------
const animNames = new Set();
for (const f of readdirSync(APP_DIR).filter((x) => /^anims-.*\.js$/.test(x))) {
  const p = join(APP_DIR, f);
  if (!existsSync(p)) continue;
  for (const m of read(p).matchAll(/defineAnim\("([\w-]+)"/g)) animNames.add(m[1]);
}

// ---------- 掃描章節裡的引用 ----------
const CInterp = loadInterp();
for (const c of chapters) {
  c.practice = [];
  let fence = false;
  const lines = c.md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^```/.test(l)) fence = !fence;
    if (fence) continue;
    let m;
    if ((m = /^:::problem\s+(\S+)/.exec(l))) {
      const p = pById[m[1]];
      if (!p) error(`${c.file}：引用了不存在的題目 ${m[1]}`);
      else if (!p.chapters.includes(c.id)) p.chapters.push(c.id);
    } else if ((m = /^:::practice\s+(\S+)/.exec(l))) {
      const p = prById[m[1]];
      if (!p) error(`${c.file}：引用了不存在的練習 ${m[1]}`);
      else if (p.chapter) error(`練習 ${m[1]} 被引用了兩次（${p.chapter} 和 ${c.id}）`);
      else { p.chapter = c.id; c.practice.push(p.id); }
    } else if ((m = /^:::anim\s+(\S+)/.exec(l))) {
      if (!animNames.has(m[1])) error(`${c.file}：找不到動畫 ${m[1]}`);
    } else if (/^:::trace/.test(l)) {
      let j = i + 1, body = [];
      while (j < lines.length && !/^:::\s*$/.test(lines[j])) body.push(lines[j++]);
      const text = body.join('\n') + '\n';
      const code = (/```c\n([\s\S]*?)```/.exec(text) || [])[1] || '';
      const input = ((/```input\n([\s\S]*?)```/.exec(text) || [])[1]) || '';
      const r = CInterp.run(code, { input, trace: true, maxTrace: 800 });
      if (r.status !== 'ok') error(`${c.file} 第 ${i + 1} 行的 :::trace 不能正常執行：${r.error && r.error.msg}`);
      else if (r.traceCut) warn(`${c.file} 第 ${i + 1} 行的 :::trace 超過 800 步，後面不會顯示`);
    }
  }
}
for (const p of problems) if (!p.chapters.length && !p.same) warn(`${p.id} 還沒有出現在任何章節`);
for (const p of practice) {
  if (!p.chapter) warn(`練習 ${p.id} 沒有被任何章節引用`);
  p.tests.forEach((t, k) => {
    const r = CInterp.run(p.solution, { input: t.input });
    const norm = (s) => s.split('\n').map((x) => x.replace(/[ \t]+$/, '')).join('\n').replace(/\n+$/, '');
    if (r.status !== 'ok' || norm(r.out) !== norm(t.output)) error(`練習 ${p.id} 的參考解答沒有通過第 ${k + 1} 組測資`);
    else if (r.warnings.length) error(`練習 ${p.id} 的參考解答有警告：${r.warnings[0].msg}`);
    const s = CInterp.run(p.starter, { input: t.input });
    if (s.status === 'compile' && !p.broken) error(`練習 ${p.id} 的 starter 不能編譯：${s.error.msg}`);
    if (s.status !== 'compile' && p.broken) error(`練習 ${p.id} 標了 broken: yes，但 starter 可以編譯`);
  });
}
if (errors) { console.error(`\n打包失敗：${errors} 個錯誤`); process.exit(1); }

// ---------- 輸出 ----------
// 只給學 C 的學生看的內容：只寫到本機的 dist（已 gitignore），由 publish-learn-content.ts 寫進資料庫
const content = {
  chapters: chapters.map(({ file, ...c }) => c),
  problems,
  practice: practice.map(({ ...p }) => p),
};
const contentJson = JSON.stringify(content);
const contentVersion = createHash('sha256').update(contentJson).digest('hex').slice(0, 12);
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'content.json'), JSON.stringify({ version: contentVersion, content }));
for (const w of warnings) console.log('警告：' + w);
console.log(`完成：${chapters.length} 個章節、${problems.length} 道題目、${practice.length} 題練習、${animNames.size} 個動畫（內容版本 ${contentVersion}）`);
console.log(`  → ${join(OUT, 'content.json')}（${(Buffer.byteLength(contentJson) / 1024).toFixed(0)} KB）`);
