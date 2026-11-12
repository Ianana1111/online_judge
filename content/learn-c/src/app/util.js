/* ---------- 共用小工具 ---------- */
// build 會把 src/app/*.js 依序接起來，包在同一個 IIFE 裡；所以這裡的 const / function 其他檔案都看得到。
// 設定放在 index.html 的 <meta>（網站上不能用內嵌 script）
const meta = (n) => { const m = document.querySelector(`meta[name="${n}"]`); return m ? m.getAttribute("content") || "" : ""; };
const CONFIG = { base: meta("lm-base"), api: meta("lm-api") };
// 內容（章節、題目、練習）在載入後才會放進來：本機預覽來自 data.js，網站上來自 API（只給學生）
let CHAPTERS = [], PROBLEMS = [], PRACTICE = [];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const P = {}, CH = {}, PR = {};
function setData(d) {
  CHAPTERS = d.chapters; PROBLEMS = d.problems; PRACTICE = d.practice;
  PROBLEMS.forEach((p) => { P[p.id] = p; });
  CHAPTERS.forEach((c) => { CH[c.id] = c; });
  PRACTICE.forEach((p) => { PR[p.id] = p; });
}
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// localStorage 可能被關掉（無痕模式、預覽），所以每次讀寫都包 try/catch
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 存不了就算了 */ } },
  del(key) { try { localStorage.removeItem(key); } catch (e) { /* 同上 */ } },
};

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

/* ---------- C 語法上色 ---------- */
const KW = new Set("if else for while do return break continue switch case default sizeof struct typedef const static goto enum union extern".split(" "));
const TY = new Set("int char long short float double void bool unsigned signed size_t FILE true false NULL EOF".split(" "));
function highlight(src) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(^[ \t]*#[^\n]*)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[uUlLfF]*\b)|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)/gm;
  let out = "", last = 0, m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index));
    const t = m[0];
    if (m[1]) out += `<span class="tk-c">${esc(t)}</span>`;
    else if (m[2]) out += `<span class="tk-s">${esc(t)}</span>`;
    else if (m[3]) out += `<span class="tk-p">${esc(t)}</span>`;
    else if (m[4]) out += `<span class="tk-n">${esc(t)}</span>`;
    else if (m[5]) out += KW.has(t) ? `<span class="tk-k">${t}</span>` : TY.has(t) ? `<span class="tk-t">${t}</span>` : `<span class="tk-f">${t}</span>`;
    else out += KW.has(t) ? `<span class="tk-k">${t}</span>` : TY.has(t) ? `<span class="tk-t">${t}</span>` : t;
    last = m.index + t.length;
  }
  return out + esc(src.slice(last));
}
// 上色後依行切開（跨行的註解要在每一行重新開 span）
function highlightLines(src) {
  const html = highlight(src);
  const lines = [];
  let open = "";
  html.split("\n").forEach((part) => {
    const line = open + part;
    const opens = (line.match(/<span class="[^"]+">/g) || []), closes = (line.match(/<\/span>/g) || []).length;
    if (opens.length > closes) { open = opens[opens.length - 1]; lines.push(line + "</span>"); }
    else { open = ""; lines.push(line); }
  });
  return lines;
}

// 一個簡單的 hash，給標題產生固定的 id
function hashId(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
