/* ---------- 共用小工具 ---------- */
// 內容（章節、題目、練習）在載入後才放進來（setData），由網站向 API 取得（只給學好 C 的學生）。
export let CHAPTERS = [], PROBLEMS = [], PRACTICE = [];
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const P = {}, CH = {}, PR = {};
export function setData(d) {
  CHAPTERS = d.chapters; PROBLEMS = d.problems; PRACTICE = d.practice;
  PROBLEMS.forEach((p) => { P[p.id] = p; });
  CHAPTERS.forEach((c) => { CH[c.id] = c; });
  PRACTICE.forEach((p) => { PR[p.id] = p; });
}
export const reduceMotion = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// localStorage 可能被關掉（無痕模式、預覽），所以每次讀寫都包 try/catch
export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 存不了就算了 */ } },
  del(key) { try { localStorage.removeItem(key); } catch (e) { /* 同上 */ } },
};

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

/* ---------- C 語法上色 ---------- */
export const KW = new Set("if else for while do return break continue switch case default sizeof struct typedef const static goto enum union extern".split(" "));
export const TY = new Set("int char long short float double void bool unsigned signed size_t FILE true false NULL EOF".split(" "));
export function highlight(src) {
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
export function highlightLines(src) {
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
export function hashId(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
