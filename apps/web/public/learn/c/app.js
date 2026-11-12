(function () {
"use strict";
/* ===== util.js ===== */
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

/* ===== markdown.js ===== */
/* ---------- 記憶體格子（```mem） ---------- */
// 每行：「標籤 | 格 | 格 ...」；開頭 @ = 索引列，$ = 位址列，~ = 註解列，空行 = 間隔
// 格子內容開頭 * = 標亮，? = 未使用 / 垃圾值
function memory(src) {
  let h = '<div class="mem"><table>';
  src.split("\n").forEach((line) => {
    if (!line.trim()) { h += '<tr class="gap"><td></td></tr>'; return; }
    let cls = "val";
    if (line[0] === "@") { cls = "idx"; line = line.slice(1); }
    else if (line[0] === "$") { cls = "adr"; line = line.slice(1); }
    else if (line[0] === "~") { cls = "note"; line = line.slice(1); }
    const cells = line.split("|").map((s) => s.trim());
    h += `<tr class="${cls}"><td class="lab">${inline(cells.shift())}</td>`;
    cells.forEach((c) => {
      let k = "";
      if (c[0] === "*") { k = cls === "val" ? "hl" : ""; c = c.slice(1); }
      else if (cls === "val" && c[0] === "?") { k = "dim"; c = c.slice(1) || "?"; }
      h += `<td class="${k}">${esc(c)}</td>`;
    });
    h += "</tr>";
  });
  return h + "</table></div>";
}

/* ---------- 簡易 Markdown ---------- */
function fixHref(href) {
  const m = href.match(/learning_map\/index\.html(#[\w-]+)$/);
  return m ? m[1] : href;
}
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return "\u0000" + (codes.length - 1) + "\u0000"; });
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => {
    const h = fixHref(href.replace(/&amp;/g, "&"));
    return `<a href="${esc(h)}"${h[0] === "#" ? " data-inner" : ""}>${t}</a>`;
  });
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
}
function splitRow(line) {
  // 表格欄位：允許 `a \| b` 與程式碼內的 |
  const cells = [];
  let cur = "", inCode = false;
  line = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "|") { cur += "|"; i++; continue; }
    if (ch === "`") inCode = !inCode;
    if (ch === "|" && !inCode) { cells.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

// ctx：{ id: 章節 id }，用來產生標題的 id（搜尋會跳到這裡）
function md(src, ctx) {
  ctx = ctx || {};
  const lines = src.replace(/\r/g, "").split("\n");
  let i = 0, html = "";
  const isBlockStart = (l) => /^(#{1,4} |```|:::|> |\s*[-*] |\s*\d+\. |\||---\s*$)/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = line.match(/^```(\w*)/))) {
      const lang = m[1], buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++;
      const code = buf.join("\n");
      if (lang === "mem") html += memory(code);
      else if (lang === "c") html += `<pre class="code"><code>${highlight(code)}</code></pre>`;
      else html += `<pre class="code plain"><code>${esc(code)}</code></pre>`;
      continue;
    }
    if ((m = line.match(/^:::(\w+)\s*(.*)$/))) {
      const kind = m[1], arg = m[2].trim(), buf = [];
      let depth = 0, inFence = false;
      i++;
      while (i < lines.length) {
        const l = lines[i];
        if (/^```/.test(l)) inFence = !inFence;
        if (!inFence && /^:::\w/.test(l)) depth++;
        if (!inFence && /^:::\s*$/.test(l)) { if (depth === 0) break; depth--; }
        buf.push(l); i++;
      }
      i++;
      html += container(kind, arg, buf.join("\n"), ctx);
      continue;
    }
    if ((m = line.match(/^(#{1,4}) (.*)$/))) {
      const n = m[1].length;
      const id = ctx.id && (n === 2 || n === 3) ? ` id="${ctx.id}-${hashId(m[2])}"` : "";
      html += `<h${n}${id}>${inline(m[2])}</h${n}>`;
      i++; continue;
    }
    if (/^---\s*$/.test(line)) { html += "<hr>"; i++; continue; }
    if (/^> ?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^> ?/.test(lines[i])) buf.push(lines[i++].replace(/^> ?/, ""));
      html += `<blockquote>${md(buf.join("\n"))}</blockquote>`;
      continue;
    }
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*:?-+/.test(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      let t = "<table><thead><tr>" + head.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>";
      while (i < lines.length && /^\|/.test(lines[i])) t += "<tr>" + splitRow(lines[i++]).map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
      html += t + "</tbody></table>";
      continue;
    }
    if (/^\s*([-*]|\d+\.) /.test(line)) {
      const ordered = /^\s*\d+\./.test(line), items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i])) {
        const item = lines[i++].replace(/^\s*([-*]|\d+\.) /, "");
        const sub = [];
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.) /.test(lines[i])) sub.push(lines[i++].replace(/^\s{2,3}/, ""));
        items.push(inline(item) + (sub.length ? md(sub.join("\n")) : ""));
      }
      const tag = ordered ? "ol" : "ul";
      html += `<${tag}>` + items.map((x) => `<li>${x}</li>`).join("") + `</${tag}>`;
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++]);
    if (!buf.length) buf.push(lines[i++]);
    html += `<p>${inline(buf.join("\n")).replace(/\n/g, "<br>")}</p>`;
  }
  return html;
}

// :::trace 的程式碼和輸入先放在這裡，等學生按下按鈕才執行
const TRACES = [];
function fences(body) {
  const out = {};
  const re = /^```(\w*)\n([\s\S]*?)^```\s*$/gm;
  let m;
  while ((m = re.exec(body))) out[m[1] || "text"] = m[2].replace(/\n$/, "");
  return out;
}

function container(kind, arg, body, ctx) {
  if (kind === "problem") {
    const [id, ...rest] = arg.split(/\s+/), p = P[id];
    if (!p) return `<div class="box warn">找不到題目 ${esc(id)}</div>`;
    return `<div class="pcard" style="--line:${p.color}"><div class="pcard-h"><b>${p.code}</b><strong>${esc(p.title)}</strong>` +
      `<span class="pcard-sub">${inline(rest.join(" "))}</span><button data-open="${p.id}">完整解答與筆記</button></div>` +
      `<div class="pcard-b">${md(body)}</div></div>`;
  }
  if (kind === "quiz") return `<details class="quiz"><summary>${inline(arg)}</summary><div class="ans md">${md(body)}</div></details>`;
  if (kind === "practice") {
    const p = PR[arg];
    if (!p) return `<div class="box warn">找不到練習 ${esc(arg)}</div>`;
    return `<div class="practice" id="pr-${esc(arg)}" data-practice="${esc(arg)}"><div class="pr-head"><span class="pr-tag">練習</span><strong>${esc(p.title)}</strong></div></div>`;
  }
  if (kind === "trace") {
    const f = fences(body);
    const k = TRACES.push({ title: arg, code: f.c || "", input: f.input || "" }) - 1;
    return `<div class="trace" data-trace="${k}"><div class="tr-head"><span class="tr-tag">逐步執行</span><strong>${inline(arg || "看程式一步一步怎麼跑")}</strong></div>` +
      `<pre class="code"><code>${highlight(f.c || "")}</code></pre><button class="btn primary" data-trace-start="${k}">開始逐步執行</button></div>`;
  }
  if (kind === "anim") {
    const name = arg.split(/\s+/)[0];
    return `<div class="anim" data-anim="${esc(name)}">${body.trim() ? `<div class="anim-cap md">${md(body)}</div>` : ""}</div>`;
  }
  const titles = { tip: "小技巧", warn: "常見錯誤", note: "補充" };
  return `<div class="box ${kind}"><div class="box-t">${inline(arg || titles[kind] || "")}</div>${md(body, ctx)}</div>`;
}

/* ===== runner.js ===== */
/* ---------- 執行 C 程式（在 Web Worker 裡跑，不會卡住頁面） ---------- */
// runC(src, opts) → Promise<結果>；一次只跑一個，其他的排隊。
// 超過 6 秒（牆鐘時間）就把 Worker 關掉重開；不能建立 Worker（例如直接用 file:// 開啟）時改在頁面上執行。
const Runner = (function () {
  const LIMIT_MS = 6000;
  let worker = null, usable = true, busy = null, seq = 0;
  const queue = [];
  let interpLoading = null;

  function makeWorker() {
    try {
      const w = new Worker(CONFIG.base + "worker.js");
      w.onmessage = (e) => {
        if (!busy || e.data.id !== busy.id) return;
        clearTimeout(busy.timer);
        finish(busy, e.data.r);
      };
      w.onerror = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        w.terminate();
        worker = null;
        usable = false;                       // Worker 不能用，之後都在頁面上執行
        if (busy) { const job = busy; busy = null; clearTimeout(job.timer); queue.unshift(job); pump(); }
      };
      return w;
    } catch (e) {
      usable = false;
      return null;
    }
  }
  function loadInterp() {
    if (window.CInterp) return Promise.resolve();
    if (!interpLoading) {
      interpLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = CONFIG.base + "interp.js";
        s.onload = resolve;
        s.onerror = () => reject(new Error("無法載入解譯器"));
        document.head.appendChild(s);
      });
    }
    return interpLoading;
  }
  function internal(err) {
    return { status: "runtime", out: "", exitCode: 0, warnings: [], steps: 0, trace: null,
      error: { line: 0, msg: "練習環境內部發生錯誤（不是你的程式的問題）：" + (err && err.message) } };
  }
  function finish(job, r) {
    busy = null;
    job.resolve(r);
    pump();
  }
  function pump() {
    if (busy || !queue.length) return;
    const job = queue.shift();
    busy = job;
    job.id = ++seq;
    if (usable && !worker) worker = makeWorker();
    if (!usable || !worker) {
      loadInterp().then(() => {
        let r;
        try { r = window.CInterp.run(job.src, job.opts); } catch (e) { r = internal(e); }
        finish(job, r);
      }, (e) => finish(job, internal(e)));
      return;
    }
    job.timer = setTimeout(() => {
      worker.terminate();
      worker = null;
      finish(job, { status: "limit", out: "", exitCode: 0, warnings: [], steps: 0, trace: null,
        error: { line: 0, msg: "程式執行超過 6 秒還沒結束，可能是無窮迴圈，或是計算量太大" } });
    }, LIMIT_MS);
    worker.postMessage({ id: job.id, src: job.src, opts: job.opts });
  }
  function run(src, opts) {
    return new Promise((resolve) => { queue.push({ src, opts: opts || {}, resolve }); pump(); });
  }
  return { run };
})();
const runC = Runner.run;

/* ===== editor.js ===== */
/* ---------- 程式編輯器：textarea 疊在語法上色的 pre 上面 ---------- */
// createEditor(host, { value, label, onChange }) → { get, set, focus, markLine, goToLine }
// Tab 插入 4 個空白（先按 Esc 再按 Tab 可以離開編輯器）、Enter 自動縮排、打 } 自動退一層。
function createEditor(host, opts) {
  const wrap = el("div", "ed");
  wrap.innerHTML = '<div class="ed-gutter" aria-hidden="true"></div><div class="ed-area"><div class="ed-mark" hidden></div>' +
    '<pre class="ed-hl" aria-hidden="true"><code></code></pre>' +
    '<textarea class="ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off"></textarea></div>' +
    '<p class="ed-help" hidden>按 Esc 之後再按 Tab，就可以離開編輯器</p>';
  host.appendChild(wrap);
  const ta = $(".ed-ta", wrap), code = $(".ed-hl code", wrap), gutter = $(".ed-gutter", wrap), mark = $(".ed-mark", wrap);
  ta.setAttribute("aria-label", opts.label || "程式碼編輯器");
  ta.value = opts.value || "";
  let escaped = false, markedLine = 0;

  function paint() {
    code.innerHTML = highlight(ta.value) + "\n";
    const n = ta.value.split("\n").length;
    let g = "";
    for (let i = 1; i <= n; i++) g += `<span${i === markedLine ? ' class="bad"' : ""}>${i}</span>`;
    gutter.innerHTML = g;
  }
  function changed() {
    if (markedLine) markLine(0);
    paint();
    if (opts.onChange) opts.onChange(ta.value);
  }
  // 用 execCommand 插入文字，瀏覽器的「復原」才能正常運作；不支援時直接改 value
  function insert(text) {
    ta.focus();
    if (!document.execCommand || !document.execCommand("insertText", false, text)) {
      const s = ta.selectionStart, e = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
      ta.selectionStart = ta.selectionEnd = s + text.length;
      changed();
    }
  }
  const lineStart = (pos) => ta.value.lastIndexOf("\n", pos - 1) + 1;

  ta.addEventListener("input", changed);
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { escaped = true; $(".ed-help", wrap).hidden = false; return; }
    const wasEscaped = escaped;
    escaped = false;
    $(".ed-help", wrap).hidden = true;
    if (e.key === "Tab" && !wasEscaped && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const s = ta.selectionStart, ls = lineStart(s);
      if (e.shiftKey) {                       // Shift+Tab：這一行退一層
        const m = /^ {1,4}/.exec(ta.value.slice(ls));
        if (m) {
          ta.setSelectionRange(ls, ls + m[0].length);
          insert("");
          ta.setSelectionRange(Math.max(ls, s - m[0].length), Math.max(ls, s - m[0].length));
        }
      } else insert("    ");
      return;
    }
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const s = ta.selectionStart, ls = lineStart(s);
      const before = ta.value.slice(ls, s);
      const base = /^[ \t]*/.exec(before)[0];
      const open = /\{\s*$/.test(before);
      const indent = open ? base + "    " : base;
      if (open && ta.selectionEnd === s && ta.value[s] === "}") {   // 在 {} 中間按 Enter：把 } 推到下一行
        insert("\n" + indent + "\n" + base);
        const p = s + 1 + indent.length;
        ta.setSelectionRange(p, p);
        return;
      }
      insert("\n" + indent);
      return;
    }
    if (e.key === "}" && !e.ctrlKey && !e.metaKey) {
      const s = ta.selectionStart, ls = lineStart(s);
      const before = ta.value.slice(ls, s);
      if (/^ {4,}$/.test(before)) {           // 這一行目前只有空白：先退一層再打 }
        e.preventDefault();
        ta.setSelectionRange(s - 4, s);
        insert("}");
      }
    }
  });

  function markLine(n) {
    markedLine = n;
    if (n > 0) {
      mark.hidden = false;
      mark.style.top = `calc(var(--ed-pad) + ${(n - 1)} * var(--ed-lh))`;
    } else mark.hidden = true;
    const spans = gutter.children;
    for (let i = 0; i < spans.length; i++) spans[i].classList.toggle("bad", i + 1 === n);
  }
  function goToLine(n) {
    const lines = ta.value.split("\n");
    let pos = 0;
    for (let i = 0; i < n - 1 && i < lines.length; i++) pos += lines[i].length + 1;
    ta.focus();
    ta.setSelectionRange(pos, pos + (lines[n - 1] || "").length);
    const area = $(".ed-area", wrap);
    area.scrollLeft = 0;
  }
  paint();
  return {
    get: () => ta.value,
    set: (v) => { ta.value = v; changed(); },
    focus: () => ta.focus(),
    markLine,
    goToLine,
    el: wrap,
  };
}

/* ===== diff.js ===== */
/* ---------- 比對輸出：練習用的規則比 OJ 寬鬆（忽略行尾空白、結尾多的空行），但要說清楚差在哪 ---------- */
const normOut = (s) => s.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, "")).join("\n").replace(/\n+$/, "");
const charName = (c) => (c === undefined ? "（這一行已經結束）" : c === " " ? "空白" : c === "\t" ? "Tab" : `「${c}」`);
const showWs = (s) => esc(s).replace(/ /g, '<span class="ws">·</span>').replace(/\t/g, '<span class="ws">→</span>');

function compareOut(got, want) {
  const pass = normOut(got) === normOut(want);
  const exact = got === want;
  if (pass) {
    let note = "";
    if (!exact) {
      const gl = got.split("\n"), wl = want.split("\n");
      if (gl.some((l, i) => /[ \t]$/.test(l) && l.trimEnd() === (wl[i] || "").trimEnd())) note = "你的輸出有些行的結尾多了空白";
      else if (!got.endsWith("\n") && want.endsWith("\n")) note = "你的輸出最後少了換行 \\n";
      else note = "你的輸出結尾多了空行";
      note += "。這裡的練習會放過，但正式的 OJ（例如 judge.tw）會逐字比對，可能會判錯。";
    }
    return { pass, exact, note };
  }
  const g = normOut(got).split("\n"), w = normOut(want).split("\n");
  let i = 0;
  while (i < g.length && i < w.length && g[i] === w[i]) i++;
  let msg, col = -1;
  if (normOut(got) === "") msg = "你的程式沒有印出任何東西";
  else if (i >= g.length) msg = `你的輸出少了東西：正確答案還有 ${w.length - g.length} 行（從第 ${i + 1} 行開始）`;
  else if (i >= w.length) msg = `你多印了 ${g.length - w.length} 行（從第 ${i + 1} 行開始）`;
  else {
    const a = g[i], b = w[i];
    col = 0;
    while (col < a.length && col < b.length && a[col] === b[col]) col++;
    if (col >= a.length) msg = `第 ${i + 1} 行少了後面的「${b.slice(col)}」`;
    else if (col >= b.length) msg = `第 ${i + 1} 行多印了「${a.slice(col)}」`;
    else msg = `第 ${i + 1} 行第 ${col + 1} 個字元不一樣：你印的是${charName(a[col])}，正確的是${charName(b[col])}`;
    if (a.replace(/\s+/g, " ") === b.replace(/\s+/g, " ")) msg += "（只差在空白的數量）";
    else if (a.toLowerCase() === b.toLowerCase()) msg += "（只差在大小寫）";
  }
  return { pass, exact, msg, line: i, col, got: g, want: w };
}

// 並排顯示「你的輸出」和「正確輸出」，標出第一個不同的行和字元
function renderDiff(d) {
  const side = (lines, other, title) => {
    const rows = lines.map((l, k) => {
      let body = showWs(l);
      if (k === d.line && d.col >= 0) body = showWs(l.slice(0, d.col)) + `<mark>${showWs(l.slice(d.col, d.col + 1)) || "&nbsp;"}</mark>` + showWs(l.slice(d.col + 1));
      return `<div class="dl${k === d.line ? " bad" : ""}"><span class="dn">${k + 1}</span><span>${body || "&nbsp;"}</span></div>`;
    }).join("");
    return `<div class="dside"><div class="dtitle">${title}</div><div class="dbody">${rows || '<div class="dl empty">（沒有輸出）</div>'}</div></div>`;
  };
  return `<div class="diff">${side(d.got, d.want, "你的輸出")}${side(d.want, d.got, "正確輸出")}</div>`;
}

/* ===== runbox.js ===== */
/* ---------- 執行結果的顯示（練習區和題目抽屜共用） ---------- */
const STATUS_TEXT = { compile: "編譯錯誤", runtime: "執行錯誤", limit: "執行太久" };

// 把錯誤和警告畫出來；editor 有給的話，點錯誤可以跳到那一行
function renderProblems(host, r, editor) {
  let h = "";
  if (r.error) {
    const line = r.error.line > 0 ? `<button class="lnk" data-line="${r.error.line}">第 ${r.error.line} 行</button>：` : "";
    h += `<div class="res-err"><strong>${STATUS_TEXT[r.status] || "錯誤"}</strong>${r.status === "compile" ? "（程式沒有執行）" : ""}<p>${line}${inline(r.error.msg)}</p></div>`;
  }
  if (r.warnings && r.warnings.length) {
    h += '<div class="res-warn"><strong>警告</strong>（程式還是會執行，但很可能有問題）<ul>' +
      r.warnings.map((w) => `<li><button class="lnk" data-line="${w.line}">第 ${w.line} 行</button>：${inline(w.msg)}</li>`).join("") + "</ul></div>";
  }
  host.innerHTML = h;
  $$("[data-line]", host).forEach((b) => b.addEventListener("click", () => { if (editor) editor.goToLine(+b.dataset.line); }));
  if (editor) editor.markLine(r.error && r.error.line > 0 ? r.error.line : 0);
}
function outputBlock(text, title) {
  return `<div class="res-out"><div class="res-t">${title || "輸出"}</div><pre class="out">${text ? esc(text) : '<span class="muted">（沒有輸出）</span>'}</pre></div>`;
}

// RunBox：自訂輸入 + 執行 + 逐步執行。opts：{ src: () => 程式碼, input, title, editor }
const RunBox = {
  mount(host, opts) {
    host.innerHTML = `<div class="rb-head"><strong>${esc(opts.title || "執行")}</strong></div>` +
      '<label class="rb-in"><span>輸入（stdin）</span><textarea rows="3" spellcheck="false"></textarea></label>' +
      '<div class="btns"><button class="btn primary" data-act="run">執行</button><button class="btn" data-act="trace">逐步執行</button></div>' +
      '<div class="rb-res" aria-live="polite"></div><div class="rb-player"></div>';
    const input = $("textarea", host), res = $(".rb-res", host);
    input.value = opts.input || "";
    input.rows = Math.min(10, Math.max(3, input.value.split("\n").length));
    $('[data-act="run"]', host).addEventListener("click", async () => {
      res.innerHTML = '<p class="muted">執行中…</p>';
      const r = await runC(opts.src(), { input: input.value });
      const probs = el("div");
      renderProblems(probs, r, opts.editor);
      res.innerHTML = "";
      res.appendChild(probs);
      if (r.status !== "compile") res.insertAdjacentHTML("beforeend", outputBlock(r.out));
      if (r.status === "ok" && r.exitCode) res.insertAdjacentHTML("beforeend", `<p class="muted">main 回傳了 ${r.exitCode}（正常結束應該回傳 0）</p>`);
    });
    $('[data-act="trace"]', host).addEventListener("click", () => {
      Player.mount($(".rb-player", host), { code: opts.src(), input: input.value, editor: opts.editor });
    });
    return { setInput: (v) => { input.value = v; }, getInput: () => input.value };
  },
};

/* ===== player.js ===== */
/* ---------- 逐步執行播放器 ---------- */
// Player.mount(host, { code, input, editor }) 會用 trace 模式執行程式，再一步一步播放：
// 左邊是程式碼（目前這一行高亮），右邊是呼叫堆疊和變數，下方是輸出和這一步的說明。
const Player = {
  async mount(host, opts) {
    host.innerHTML = '<p class="muted">執行中，正在記錄每一步…</p>';
    const r = await runC(opts.code, { input: opts.input || "", trace: true, maxTrace: 800 });
    if (!r.trace || !r.trace.length) {
      host.innerHTML = "";
      const probs = el("div");
      renderProblems(probs, r, opts.editor);
      host.appendChild(probs);
      return;
    }
    if (opts.editor) opts.editor.markLine(0);
    buildPlayer(host, opts.code, r);
  },
};

function buildPlayer(host, code, r) {
  const steps = r.trace, N = steps.length;
  const lines = highlightLines(code);
  host.innerHTML = `<div class="pl" tabindex="0" aria-label="逐步執行播放器：左右鍵切換步驟，空白鍵播放或暫停">
    <div class="pl-main">
      <div class="pl-code">${lines.map((l, i) => `<div class="pl-l" data-l="${i + 1}"><span class="pl-n">${i + 1}</span><code>${l || " "}</code></div>`).join("")}</div>
      <div class="pl-state" aria-live="off"></div>
    </div>
    <div class="pl-note" aria-live="polite"></div>
    <div class="pl-out"><div class="res-t">輸出</div><pre class="out"></pre></div>
    <div class="pl-ctrl">
      <button class="pbtn" data-p="first" title="回到開頭" aria-label="回到開頭">⏮</button>
      <button class="pbtn" data-p="prev" title="上一步（←）" aria-label="上一步">◀</button>
      <button class="pbtn play" data-p="play" title="自動播放（空白鍵）" aria-label="自動播放">▶</button>
      <button class="pbtn" data-p="next" title="下一步（→）" aria-label="下一步">▶|</button>
      <button class="pbtn" data-p="last" title="跳到最後" aria-label="跳到最後">⏭</button>
      <input type="range" min="0" max="${N - 1}" value="0" aria-label="目前在第幾步">
      <span class="pl-pos"></span>
      <select aria-label="播放速度"><option value="1200">慢</option><option value="600" selected>中</option><option value="250">快</option></select>
    </div>
    <div class="pl-end"></div>
  </div>`;
  const root = $(".pl", host), codeBox = $(".pl-code", root), state = $(".pl-state", root);
  const note = $(".pl-note", root), out = $(".pl-out pre", root), range = $("input", root), pos = $(".pl-pos", root);
  const playBtn = $('[data-p="play"]', root), speed = $("select", root);
  let k = 0, timer = null;

  const endMsg = [];
  if (r.traceCut) endMsg.push(`<p class="muted">只記錄了前 ${N} 步，後面的步驟沒有顯示。</p>`);
  if (r.error) endMsg.push(`<div class="res-err"><strong>${STATUS_TEXT[r.status]}</strong><p>第 ${r.error.line} 行：${inline(r.error.msg)}</p></div>`);

  function varHtml(v, prev) {
    const changed = prev && (prev.val !== v.val || (prev.cells && prev.cells.join("\u0001") !== v.cells.join("\u0001")));
    if (!v.cells) {
      return `<div class="pv${changed ? " chg" : ""}"><span class="pv-n">${esc(v.name)}</span><span class="pv-t">${esc(v.type)}</span><span class="pv-v">${esc(v.val)}</span></div>`;
    }
    const cell = (c, i) => {
      const was = prev && prev.cells && prev.cells[i] !== c;
      return `<td class="${c === "?" ? "dim" : ""}${was ? " chg" : ""}">${esc(c)}</td>`;
    };
    let grid;
    if (v.dims.length === 2) {
      const cols = v.dims[1];
      let rows = "";
      for (let i = 0; i * cols < v.cells.length; i++) {
        rows += `<tr><th>[${i}]</th>${v.cells.slice(i * cols, (i + 1) * cols).map((c, j) => cell(c, i * cols + j)).join("")}</tr>`;
      }
      grid = `<table class="pa"><thead><tr><th></th>${Array.from({ length: cols }, (_, j) => `<th>[${j}]</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
    } else {
      grid = `<table class="pa"><thead><tr>${v.cells.map((_, i) => `<th>${i}</th>`).join("")}</tr></thead><tbody><tr>${v.cells.map(cell).join("")}</tr></tbody></table>`;
    }
    const extra = (v.str !== undefined ? `<span class="pv-s">字串 "${esc(v.str)}"</span>` : "") +
      (v.total ? `<span class="muted">（共 ${v.total} 格，只顯示前 ${v.cells.length} 格）</span>` : "");
    return `<div class="pv arr"><div><span class="pv-n">${esc(v.name)}</span><span class="pv-t">${esc(v.type)}</span>${extra}</div>${grid}</div>`;
  }

  function show(i) {
    k = Math.max(0, Math.min(N - 1, i));
    const s = steps[k], p = k > 0 ? steps[k - 1] : null;
    $$(".pl-l", codeBox).forEach((d) => d.classList.remove("cur", "prev", "err"));
    const cur = $(`.pl-l[data-l="${s.line}"]`, codeBox);
    if (p && p.line !== s.line) { const pl = $(`.pl-l[data-l="${p.line}"]`, codeBox); if (pl) pl.classList.add("prev"); }
    if (cur) {
      cur.classList.add("cur");
      const top = cur.offsetTop - codeBox.offsetTop, h = codeBox.clientHeight;
      if (top < codeBox.scrollTop || top > codeBox.scrollTop + h - 40) codeBox.scrollTop = top - h / 3;
    }
    const last = k === N - 1;
    if (last && r.error) { const bad = $(`.pl-l[data-l="${r.error.line}"]`, codeBox); if (bad) bad.classList.add("err"); }
    // 呼叫堆疊：最內層（正在執行的函式）放最上面
    const frames = s.frames.map((f, fi) => ({ f, fi })).reverse();
    state.innerHTML = frames.map(({ f, fi }) => {
      const pf = p && p.frames[fi] && p.frames[fi].name === f.name ? p.frames[fi] : null;
      const vars = f.vars.map((v) => varHtml(v, pf && pf.vars.find((x) => x.name === v.name))).join("");
      return `<div class="pf${fi === s.frames.length - 1 && f.name !== "全域變數" ? " top" : ""}"><div class="pf-h">${esc(f.name)}</div>${vars || '<p class="muted">（還沒有變數）</p>'}</div>`;
    }).join("");
    note.innerHTML = `<span class="pl-ln">第 ${s.line} 行</span>${s.note ? esc(s.note) : "即將執行這一行"}`;
    const before = p ? p.out : "";
    out.innerHTML = s.out.startsWith(before) && s.out.length > before.length
      ? esc(before) + `<mark class="new">${esc(s.out.slice(before.length))}</mark>` : (s.out ? esc(s.out) : '<span class="muted">（還沒有輸出）</span>');
    range.value = k;
    pos.textContent = `第 ${k + 1} / ${N} 步`;
    $(".pl-end", root).innerHTML = last ? endMsg.join("") : "";
    if (last) stop();
  }
  function stop() { clearInterval(timer); timer = null; playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "自動播放"); }
  function play() {
    if (timer) { stop(); return; }
    if (k >= N - 1) show(0);
    playBtn.textContent = "❚❚";
    playBtn.setAttribute("aria-label", "暫停");
    timer = setInterval(() => show(k + 1), +speed.value);
  }
  speed.addEventListener("change", () => { if (timer) { stop(); play(); } });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]");
    if (!b) return;
    const act = b.dataset.p;
    if (act === "play") return play();
    stop();
    show({ first: 0, prev: k - 1, next: k + 1, last: N - 1 }[act]);
  });
  range.addEventListener("input", () => { stop(); show(+range.value); });
  root.addEventListener("keydown", (e) => {
    if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return;
    if (e.key === "ArrowRight") { e.preventDefault(); stop(); show(k + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); stop(); show(k - 1); }
    else if (e.key === " ") { e.preventDefault(); play(); }
    else if (e.key === "Home") { e.preventDefault(); stop(); show(0); }
    else if (e.key === "End") { e.preventDefault(); stop(); show(N - 1); }
  });
  show(0);
  root.focus({ preventScroll: true });
}

/* ===== anim-core.js ===== */
/* ---------- 觀念動畫的共用框架 ---------- */
// defineAnim(name, { title, steps | build(param), render(state, prev), setup(api) })
//   steps：[{ text: 這一步的說明, s: 狀態 }]；render 回傳 HTML（帶 hot class 的元素會閃一下）
//   setup：互動元件（滑桿、切換按鈕）用；api.rebuild(steps) 換一組步驟，api.show(k) 跳到第 k 步
const ANIMS = {};
function defineAnim(name, def) { ANIMS[name] = def; }

const Anim = {
  mount(host) {
    const def = ANIMS[host.dataset.anim];
    host.classList.add("ready");
    if (!def) { host.insertAdjacentHTML("afterbegin", `<div class="box warn">找不到動畫 ${esc(host.dataset.anim)}</div>`); return; }
    const cap = $(".anim-cap", host);
    host.innerHTML = `<div class="an-head"><span class="an-tag">動畫</span><strong>${esc(def.title)}</strong></div>` +
      '<div class="an-extra"></div><div class="an-stage"></div><div class="an-text" aria-live="polite"></div>' +
      `<div class="pl-ctrl"><button class="pbtn" data-p="first" aria-label="回到開頭" title="回到開頭">⏮</button>` +
      '<button class="pbtn" data-p="prev" aria-label="上一步" title="上一步">◀</button>' +
      '<button class="pbtn play" data-p="play" aria-label="自動播放" title="自動播放">▶</button>' +
      '<button class="pbtn" data-p="next" aria-label="下一步" title="下一步">▶|</button>' +
      '<button class="pbtn" data-p="last" aria-label="跳到最後" title="跳到最後">⏭</button>' +
      '<span class="pl-pos"></span></div>';
    if (cap) host.appendChild(cap);
    const stage = $(".an-stage", host), text = $(".an-text", host), pos = $(".pl-pos", host), playBtn = $('[data-p="play"]', host);
    let steps = def.steps || def.build(), k = 0, timer = null;
    function show(i) {
      k = Math.max(0, Math.min(steps.length - 1, i));
      const s = steps[k];
      stage.innerHTML = def.render(s.s, k > 0 ? steps[k - 1].s : null, k);
      text.innerHTML = inline(s.text);
      pos.textContent = `${k + 1} / ${steps.length}`;
      if (k === steps.length - 1) stop();
    }
    function stop() { clearInterval(timer); timer = null; playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "自動播放"); }
    function play() {
      if (timer) { stop(); return; }
      if (k >= steps.length - 1) show(0);
      playBtn.textContent = "❚❚";
      playBtn.setAttribute("aria-label", "暫停");
      timer = setInterval(() => show(k + 1), def.speed || 1500);
    }
    host.addEventListener("click", (e) => {
      const b = e.target.closest("[data-p]");
      if (!b || !host.contains(b)) return;
      const a = b.dataset.p;
      if (a === "play") return play();
      stop();
      show({ first: 0, prev: k - 1, next: k + 1, last: steps.length - 1 }[a]);
    });
    host.tabIndex = 0;
    host.addEventListener("keydown", (e) => {
      if (e.target !== host) return;
      if (e.key === "ArrowRight") { e.preventDefault(); stop(); show(k + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stop(); show(k - 1); }
      else if (e.key === " ") { e.preventDefault(); play(); }
    });
    if (def.setup) {
      def.setup({
        extra: $(".an-extra", host), stage,
        rebuild(ns, at) { stop(); steps = ns; show(at || 0); },
        show(i) { stop(); show(i); },
        current: () => k,
      });
    }
    show(0);
  },
};

// 畫一排格子：items = [{ v: 內容, cls, top: 上方小字, bot: 下方小字 }]
function cellRow(items, label) {
  return `<div class="an-row">${label ? `<div class="an-lab">${label}</div>` : ""}<div class="an-cells">` +
    items.map((c) => `<div class="an-cellw">${c.top !== undefined ? `<span class="an-top">${esc(c.top)}</span>` : ""}` +
      `<span class="an-cell ${c.cls || ""}">${c.v === "" || c.v === undefined ? "&nbsp;" : esc(c.v)}</span>` +
      `${c.bot !== undefined ? `<span class="an-bot">${esc(c.bot)}</span>` : ""}</div>`).join("") + "</div></div>";
}
// 程式碼片段，指定的行高亮
function codeLines(src, hot) {
  return `<pre class="an-code">${highlightLines(src).map((l, i) => `<span class="ln${(Array.isArray(hot) ? hot.includes(i + 1) : hot === i + 1) ? " hot" : ""}">${l || " "}</span>`).join("")}</pre>`;
}
const vis = (c) => (c === " " ? "␣" : c === "\n" ? "↵" : c === "\0" ? "\\0" : c);

/* ===== anims-a.js ===== */
/* ---------- 觀念動畫（第 1～4 章） ---------- */

// 第 1 章：.c → gcc → 執行檔 → 輸出；可以切換成「少了分號」的版本
(function () {
  const good = 'int main() {\n    printf("Hi\\n");\n    return 0;\n}';
  const bad = 'int main() {\n    printf("Hi\\n")\n    return 0;\n}';
  const steps = (isBad) => (isBad ? [
    { text: "這是少了分號的 hello.c。程式碼只是一個文字檔，電腦還不能直接執行它。", s: { bad: true, at: 0 } },
    { text: "gcc 一行一行檢查語法，發現**第 2 行結尾少了分號**，回報編譯錯誤。", s: { bad: true, at: 1 } },
    { text: "編譯失敗就**不會產生執行檔**，程式根本沒有執行，所以也不會有任何輸出。先把錯誤修好再編譯一次。", s: { bad: true, at: 2 } },
  ] : [
    { text: "這是你寫的 hello.c。程式碼只是一個文字檔，電腦還不能直接執行它。", s: { bad: false, at: 0 } },
    { text: "gcc（編譯器）把 C 程式翻譯成電腦看得懂的機器指令，這一步叫做**編譯**。", s: { bad: false, at: 1 } },
    { text: "編譯成功，產生**執行檔**（例如 a.out）。", s: { bad: false, at: 2 } },
    { text: "執行 a.out：程式從 main 開始跑，printf 把文字印到螢幕上。", s: { bad: false, at: 3 } },
  ]);
  defineAnim("compile-pipeline", {
    title: "從程式碼到執行：編譯",
    build: () => steps(false),
    setup(api) {
      let isBad = false;
      const b = el("button", "btn", "切換成：少了分號的版本");
      b.addEventListener("click", () => {
        isBad = !isBad;
        b.textContent = isBad ? "切換成：正確的版本" : "切換成：少了分號的版本";
        api.rebuild(steps(isBad));
      });
      api.extra.appendChild(b);
    },
    render(s) {
      const cls = (k) => (s.at === k ? "hot" : s.at < k ? "dim" : "");
      const gccCls = s.bad && s.at >= 1 ? "bad" : cls(1);
      const after = (k) => (s.bad ? "dim" : cls(k));
      return '<div class="an-flex">' +
        `<div class="an-box ${cls(0)}"><small>hello.c（程式碼）</small>${codeLines(s.bad ? bad : good, s.bad && s.at >= 1 ? 2 : 0)}</div>` +
        `<div class="an-arrow${s.at >= 1 ? " on" : ""}">→</div>` +
        `<div class="an-box ${gccCls}"><small>gcc 編譯器</small><b>${s.bad && s.at >= 1 ? "第 2 行：少了 ;" : "翻譯成機器指令"}</b></div>` +
        `<div class="an-arrow${s.at >= 2 && !s.bad ? " on" : ""}">→</div>` +
        `<div class="an-box ${after(2)}"><small>執行檔</small><b>${s.bad && s.at >= 2 ? "沒有產生" : "a.out"}</b></div>` +
        `<div class="an-arrow${s.at >= 3 ? " on" : ""}">→</div>` +
        `<div class="an-box ${after(3)}"><small>螢幕（輸出）</small><b>${s.at >= 3 ? "Hi" : "&nbsp;"}</b></div></div>`;
    },
  });
})();

// 第 2 章：宣告變數 = 在記憶體裡占幾格；x = x + 1 是「讀 → 算 → 寫回」
(function () {
  const C = { name: "c", type: "char", size: 1, addr: 100 };
  const X = { name: "x", type: "int", size: 4, addr: 104 };
  const Y = { name: "y", type: "long long", size: 8, addr: 112 };
  const st = (vars, hot, cpu, vals) => ({ vars, hot, cpu, vals: vals || {} });
  defineAnim("memory-boxes", {
    title: "變數在記憶體裡占幾格",
    steps: [
      { text: "記憶體就像一排置物櫃，每一格是 1 個 byte，每格都有編號（位址）。", s: st([], "", "") },
      { text: "`char c;`：char 占 **1** 格。", s: st([C], "c", "") },
      { text: "`int x;`：int 占 **4** 格，可以放大約 ±21 億。", s: st([C, X], "x", "") },
      { text: "`long long y;`：long long 占 **8** 格，可以放大約 ±9.2 × 10¹⁸。", s: st([C, X, Y], "y", "") },
      { text: "`x = 5;`：把 5 放進 x 的格子。", s: st([C, X, Y], "x", "", { x: 5 }) },
      { text: "`x = x + 1;` 第一步：**先讀**出 x 現在的值 5，拿到計算區。", s: st([C, X, Y], "x", "讀出 x → 5", { x: 5 }) },
      { text: "第二步：在計算區**算出** 5 + 1 = 6。這時候 x 的格子還是 5。", s: st([C, X, Y], "", "5 + 1 = 6", { x: 5 }) },
      { text: "第三步：把 6 **寫回** x 的格子。所以 `=` 是「把右邊算好的值放進左邊」，不是數學的等於。", s: st([C, X, Y], "x", "寫回 x ← 6", { x: 6 }) },
    ],
    render(s) {
      const boxes = s.vars.map((v) => {
        const cells = Array.from({ length: v.size }, (_, i) => ({ v: i === 0 && s.vals[v.name] !== undefined ? s.vals[v.name] : "", top: v.addr + i,
          cls: s.vals[v.name] === undefined ? "dim" : "" }));
        return `<div class="an-box ${s.hot === v.name ? "hot" : ""}"><small>${v.type} ${v.name}（${v.size} byte${v.size > 1 ? "s" : ""}）</small>${cellRow(cells)}</div>`;
      }).join("");
      return `<div class="an-flex">${boxes || '<div class="an-note">（還沒有宣告任何變數）</div>'}</div>` +
        (s.cpu ? `<div class="an-flex"><div class="an-box hot"><small>計算區（CPU）</small><b>${esc(s.cpu)}</b></div></div>` : "");
    },
  });
})();

// 第 2 章：int 溢位像里程表；32 個 bit 一起看
(function () {
  const bits = (v, prev) => {
    const b = (v >>> 0).toString(2).padStart(32, "0"), p = prev === undefined ? b : (prev >>> 0).toString(2).padStart(32, "0");
    return '<div class="an-bits">' + b.split("").map((c, i) => `<span class="${i === 0 ? "sign" : ""}${c !== p[i] ? " flip" : ""}">${c}</span>`).join("") + "</div>";
  };
  defineAnim("int-overflow", {
    title: "int 溢位：超過最大值會繞回最小值",
    steps: [
      { text: "int 有 32 個 bit。最左邊那一個（藍色）是**正負號**：0 代表正數。", s: { v: 2147483646 } },
      { text: "再加 1，變成 int 能放的**最大值** 2147483647（INT_MAX）：後面 31 個 bit 全是 1。", s: { v: 2147483647 } },
      { text: "再加 1：每一位都進位，正負號那一位變成 1，結果繞回**最小值** −2147483648。電腦不會警告你！", s: { v: -2147483648 } },
      { text: "常見的情況：`int k = 50000;` 再算 `k * k`。正確答案 25 億超過 INT_MAX，兩個 int 相乘的結果還是 int，所以溢位了。", s: { mul: true, show: 1 } },
      { text: "解法：先把其中一個轉成 long long：`(long long)k * k`，整個乘法就用 64 位元計算，答案正確。", s: { mul: true, show: 2 } },
    ],
    render(s, prev) {
      if (s.mul) {
        return '<div class="an-flex">' +
          `<div class="an-box bad"><small>int * int（還是 int）</small><b>k * k = ${Math.imul(50000, 50000)}</b></div>` +
          `<div class="an-box ${s.show === 2 ? "ok hot" : "dim"}"><small>(long long)k * k</small><b>${s.show === 2 ? "2500000000" : "?"}</b></div></div>`;
      }
      return `<div class="an-big">${s.v}</div>${bits(s.v, prev && !prev.mul ? prev.v : undefined)}` +
        `<p class="an-note">INT_MAX = 2147483647、INT_MIN = −2147483648</p>`;
    },
  });
})();

// 第 3 章：scanf 怎麼從輸入緩衝區拿資料；%c 會讀到換行的陷阱
(function () {
  const A = 'int a, b, r;\nr = scanf("%d %d", &a, &b);\nr = scanf("%d", &a);';
  const B = 'int n;\nchar c;\nscanf("%d", &n);\nscanf("%c", &c);';
  const s = (inp, pos, vars, code, hot, extra) => Object.assign({ inp, pos, vars, code, hot }, extra || {});
  defineAnim("scanf-buffer", {
    title: "scanf 怎麼讀輸入",
    speed: 1800,
    steps: [
      { text: "你打的輸入會先放在**輸入緩衝區**，scanf 從游標的位置開始拿。␣ 是空白，↵ 是換行。", s: s("12 7\n", 0, {}, A, 2) },
      { text: "`%d`：讀數字 1、2，遇到空白就停下來，把 12 放進 a。", s: s("12 7\n", 2, { a: 12 }, A, 2) },
      { text: "格式裡的空白：跳過輸入裡所有的空白。", s: s("12 7\n", 3, { a: 12 }, A, 2) },
      { text: "第二個 `%d` 讀到 7，放進 b。", s: s("12 7\n", 4, { a: 12, b: 7 }, A, 2) },
      { text: "成功讀了 2 個值，所以 scanf **回傳 2**。", s: s("12 7\n", 4, { a: 12, b: 7, r: 2 }, A, 2) },
      { text: "下一次 scanf：`%d` 會先跳過空白（包含換行 ↵）……然後就沒有東西了。", s: s("12 7\n", 5, { a: 12, b: 7, r: 2 }, A, 3) },
      { text: "一個值都沒讀到就遇到結尾，scanf **回傳 EOF（−1）**。`while (scanf(…) != EOF)` 就是靠這個停下來的。", s: s("12 7\n", 5, { a: 12, b: 7, r: -1 }, A, 3) },
      { text: "陷阱：輸入是 5↵A↵。先用 `%d` 讀 n。", s: s("5\nA\n", 0, {}, B, 3) },
      { text: "`%d` 讀走 5，但後面的換行 ↵ 還留在緩衝區裡。", s: s("5\nA\n", 1, { n: 5 }, B, 3) },
      { text: "`%c` **不會跳過空白**：它讀到的是換行 ↵（ASCII 10），不是 A！", s: s("5\nA\n", 2, { n: 5, c: "'\\n'" }, B, 4, { bad: true }) },
      { text: "解法：寫成 `scanf(\" %c\", &c)`，%c 前面加一個空白，就會先跳過換行，讀到 A。", s: s("5\nA\n", 3, { n: 5, c: "'A'" }, 'int n;\nchar c;\nscanf("%d", &n);\nscanf(" %c", &c);', 4) },
    ],
    render(st) {
      const cells = st.inp.split("").map((ch, i) => ({ v: vis(ch), top: i === st.pos ? "▼" : "", cls: i < st.pos ? "dim" : i === st.pos ? "hot" : "" }));
      cells.push({ v: "結尾", top: st.pos >= st.inp.length ? "▼" : "", cls: "blank" });
      const vars = Object.entries(st.vars).map(([k, v]) => `<div class="an-box ${st.bad && k === "c" ? "bad" : ""}"><small>${k === "r" ? "回傳值 r" : k}</small><b>${esc(v)}</b></div>`).join("");
      return codeLines(st.code, st.hot) + cellRow(cells, "輸入緩衝區") + `<div class="an-flex">${vars}</div>`;
    },
  });
})();

// 第 3 章：printf 由左往右，遇到 % 就拿下一個參數來填
(function () {
  const toks = [{ t: "x = " }, { t: "%d", arg: 0 }, { t: ", y = " }, { t: "%5d", arg: 1 }, { t: "\\n" }];
  const outs = ["", "x = ", "x = 3", "x = 3, y = ", "x = 3, y =    42", "x = 3, y =    42"];
  const texts = [
    "`printf(\"x = %d, y = %5d\\n\", x, y);`，x 是 3、y 是 42。printf 從格式字串的最左邊開始處理。",
    "一般的文字照抄到輸出。",
    "遇到 `%d`：拿**第一個參數** x，用十進位整數印出 3。",
    "繼續照抄文字 `, y = `。",
    "`%5d`：拿**下一個參數** y，而且至少占 **5 格**寬；42 只有 2 位，所以前面補 3 個空白（靠右對齊）。",
    "`\\n` 是換行，這一行印完了。% 的個數要和後面參數的個數一樣，型態也要對上。",
  ];
  defineAnim("printf-format", {
    title: "printf 的格式字串",
    steps: texts.map((text, k) => ({ text, s: { k } })),
    render(s) {
      const fmt = toks.map((x, i) => `<span class="an-cell ${i === s.k - 1 ? "hot" : i < s.k - 1 ? "dim" : ""}">${esc(x.t)}</span>`).join("");
      const used = (a) => toks.findIndex((x) => x.arg === a) < s.k - 1;
      const args = [["x", 3], ["y", 42]].map(([n, v], a) => `<div class="an-box ${toks[s.k - 1] && toks[s.k - 1].arg === a ? "hot" : used(a) ? "dim" : ""}"><small>第 ${a + 2} 個參數</small><b>${n} = ${v}</b></div>`).join("");
      const out = outs[s.k].split("").map((c, i) => ({ v: vis(c), cls: s.k === 4 && i >= 11 && i < 14 ? "hot" : "" }));
      return `<div class="an-row"><div class="an-lab">格式</div><div class="an-cells">${fmt}</div></div><div class="an-flex">${args}</div>` +
        (out.length ? cellRow(out, "輸出") : '<div class="an-note">輸出：（還沒有）</div>');
    },
  });
})();

// 第 4 章：/ 是「分成幾組」、% 是「剩下幾個」
(function () {
  const st = (n, k, grouped, hl) => ({ n, k, grouped, hl });
  defineAnim("div-mod", {
    title: "整數除法 / 和取餘數 %",
    steps: [
      { text: "有 17 個點。", s: st(17, 5, false, "") },
      { text: "每 5 個分成一組。", s: st(17, 5, true, "") },
      { text: "`17 / 5` 問的是「**可以分成幾組**」：3 組（小數部分直接丟掉）。", s: st(17, 5, true, "div") },
      { text: "`17 % 5` 問的是「**分完之後剩下幾個**」：2 個。永遠會有 `17 == 17 / 5 * 5 + 17 % 5`。", s: st(17, 5, true, "mod") },
      { text: "0-P5 Cola：手上 8 個空瓶，3 個空瓶換 1 瓶。", s: st(8, 3, true, "") },
      { text: "`8 / 3 = 2`：可以換 2 瓶；`8 % 3 = 2`：換完還剩 2 個空瓶。", s: st(8, 3, true, "both") },
    ],
    render(s) {
      const full = s.grouped ? Math.floor(s.n / s.k) : 0, rest = s.grouped ? s.n % s.k : s.n;
      const dots = (m) => '<span class="an-dot"></span>'.repeat(m);
      let h = '<div class="an-dots">';
      for (let g = 0; g < full; g++) h += `<div class="an-group full">${dots(s.k)}</div>`;
      if (rest) h += `<div class="an-group ${s.grouped ? "rest" : ""}">${dots(rest)}</div>`;
      h += "</div>";
      if (s.grouped) {
        h += '<div class="an-flex">' +
          `<div class="an-box ${s.hl === "div" || s.hl === "both" ? "hot" : ""}"><small>${s.n} / ${s.k}（幾組）</small><b>${full}</b></div>` +
          `<div class="an-box ${s.hl === "mod" || s.hl === "both" ? "hot" : ""}"><small>${s.n} % ${s.k}（剩幾個）</small><b>${s.n % s.k}</b></div></div>`;
      }
      return h;
    },
  });
})();

// 第 4 章：%10 拿到個位數、/10 把個位數丟掉
(function () {
  const steps = [{ text: "要把 4096 的每一位拆出來。重複做兩件事：`d = n % 10` 拿到個位數，`n = n / 10` 把個位數丟掉。", s: { n: 4096, digits: [], d: null } }];
  let n = 4096;
  const digits = [];
  while (n > 0) {
    const d = n % 10;
    steps.push({ text: `\`${n} % 10 = ${d}\`：拿到個位數 ${d}。`, s: { n, digits: digits.slice(), d } });
    digits.push(d);
    steps.push({ text: `\`${n} / 10 = ${Math.floor(n / 10)}\`：把個位數丟掉。${Math.floor(n / 10) === 0 ? "n 變成 0，迴圈 `while (n > 0)` 停下來。" : ""}`, s: { n: Math.floor(n / 10), digits: digits.slice(), d: null } });
    n = Math.floor(n / 10);
  }
  steps.push({ text: "拆出來的順序是 **6、9、0、4**：從個位數開始。要正著印，就先存進陣列再倒著印（1-P3 Parity、1-P7 也是這樣）。", s: { n: 0, digits: digits.slice(), d: null, done: true } });
  defineAnim("digit-split", {
    title: "拆出每一位數",
    steps,
    render(s) {
      const num = String(s.n).split("").map((c, i, a) => ({ v: c, cls: s.d !== null && i === a.length - 1 ? "hot" : "" }));
      return '<div class="an-flex">' +
        `<div class="an-box"><small>n</small>${cellRow(num)}</div>` +
        `<div class="an-box ${s.d !== null ? "hot" : ""}"><small>d = n % 10</small><b>${s.d === null ? "&nbsp;" : s.d}</b></div></div>` +
        cellRow(s.digits.map((d, i) => ({ v: d, top: `第 ${i + 1} 個`, cls: s.done ? "ok" : "" })), "拆出來的");
    },
  });
})();

// 第 4 章：&& 左邊是假，右邊就不算（短路求值）
(function () {
  const st = (x, left, right, result) => ({ x, left, right, result });
  defineAnim("short-circuit", {
    title: "短路求值：&& 左邊是假就不看右邊",
    steps: [
      { text: "`if (x > 0 && 10 / x > 2)`，先看 x = 0 的情況。", s: st(0, "", "", "") },
      { text: "先算左邊 `x > 0`：0 > 0 是**假**。", s: st(0, "false", "", "") },
      { text: "&& 只要有一邊是假，整個就是假，所以**右邊整個不算**。也因為這樣，`10 / x` 不會執行，不會除以 0 出錯。", s: st(0, "false", "skip", "false") },
      { text: "換成 x = 4。左邊 `4 > 0` 是**真**，這時候才需要看右邊。", s: st(4, "true", "", "") },
      { text: "右邊 `10 / 4 > 2`：整數除法 10 / 4 = 2，2 > 2 是**假**。", s: st(4, "true", "false", "") },
      { text: "左真、右假，&& 的結果是假。所以把「保護條件」寫在 && 的**左邊**，就能避免右邊出錯。|| 也一樣：左邊是真就不看右邊。", s: st(4, "true", "false", "false") },
    ],
    render(s) {
      const cls = (v) => (v === "true" ? "ok" : v === "false" ? "bad" : v === "skip" ? "dim" : "");
      const word = (v) => (v === "true" ? "真" : v === "false" ? "假" : v === "skip" ? "不計算" : "?");
      return `<div class="an-note">x = ${s.x}</div><div class="an-flex">` +
        `<div class="an-box ${cls(s.left)}"><small>左邊：x > 0</small><b>${word(s.left)}</b></div><div class="an-arrow">&&</div>` +
        `<div class="an-box ${cls(s.right)}"><small>右邊：10 / x > 2</small><b>${word(s.right)}</b></div><div class="an-arrow">=</div>` +
        `<div class="an-box ${cls(s.result)}"><small>整個條件</small><b>${word(s.result)}</b></div></div>`;
    },
  });
})();

/* ===== anims-b.js ===== */
/* ---------- 觀念動畫（第 5～8 章） ---------- */

// 第 5 章：else if 由上往下檢查；可以拖動分數、切換「順序放錯」
(function () {
  const RIGHT = [[90, "A"], [80, "B"], [70, "C"], [60, "D"]], WRONG = [[60, "D"], [70, "C"], [80, "B"], [90, "A"]];
  function build(score, wrong) {
    const conds = wrong ? WRONG : RIGHT, steps = [];
    steps.push({ text: `score = ${score}。從**第一個**條件開始，由上往下檢查。`, s: { score, conds, at: -1, hit: -1 } });
    for (let i = 0; i < conds.length; i++) {
      const ok = score >= conds[i][0];
      steps.push({ text: ok ? `${score} >= ${conds[i][0]} 成立，印出 ${conds[i][1]}，**後面的條件全部跳過**。` +
        (wrong && conds[i][1] !== (RIGHT.find((c) => score >= c[0]) || [0, "F"])[1] ? "結果錯了！大範圍的條件放在前面，會把後面的情況吃掉。" : "")
        : `${score} >= ${conds[i][0]} 不成立，往下一個 else if。`, s: { score, conds, at: i, hit: ok ? i : -1 } });
      if (ok) return steps;
    }
    steps.push({ text: "上面全部不成立，執行最後的 else，印出 F。", s: { score, conds, at: conds.length, hit: conds.length } });
    return steps;
  }
  defineAnim("else-if-flow", {
    title: "else if：第一個成立的就停",
    build: () => build(85, false),
    setup(api) {
      let score = 85, wrong = false;
      api.extra.innerHTML = '<label>score = <b>85</b> <input type="range" min="0" max="100" value="85" aria-label="分數"></label>' +
        '<button class="btn">切換成：順序放錯的版本</button>';
      const r = $("input", api.extra), b = $("button", api.extra), lab = $("b", api.extra);
      r.addEventListener("input", () => { score = +r.value; lab.textContent = score; api.rebuild(build(score, wrong)); });
      b.addEventListener("click", () => {
        wrong = !wrong;
        b.textContent = wrong ? "切換成：正確的順序" : "切換成：順序放錯的版本";
        api.rebuild(build(score, wrong));
      });
    },
    render(s) {
      const rows = s.conds.map((c, i) => `<div class="an-box ${s.hit === i ? "ok hot" : i === s.at ? "bad" : i < s.at ? "dim" : ""}">` +
        `<small>${i === 0 ? "if" : "else if"} (score >= ${c[0]})</small><b>印出 ${c[1]}</b></div>`);
      rows.push(`<div class="an-box ${s.hit === s.conds.length ? "ok hot" : ""}"><small>else</small><b>印出 F</b></div>`);
      return `<div class="an-flex">${rows.join('<div class="an-arrow">→</div>')}</div>`;
    },
  });
})();

// 第 6 章：for 的四個部分，依 ①②③④②③④… 的順序執行
(function () {
  const steps = [];
  let k = 0, out = "";
  const push = (part, text) => steps.push({ text, s: { part, k, out } });
  push(1, "① **初始化**：`int k = 0`，整個迴圈只做這一次。");
  for (;;) {
    if (k < 3) push(2, `② **檢查條件**：${k} < 3 成立，進入本體。`);
    else { push(2, `② **檢查條件**：${k} < 3 不成立，離開迴圈。本體一共跑了 3 次。`); break; }
    out += k + " ";
    push(3, `③ **本體**：印出 ${k}。`);
    k++;
    push(4, `④ **更新**：\`k++\`，k 變成 ${k}。然後回到 ②。`);
  }
  defineAnim("for-order", {
    title: "for 迴圈的執行順序",
    speed: 1300,
    steps,
    render(s) {
      const parts = ["① int k = 0", "② k < 3", "③ printf(\"%d \", k)", "④ k++"];
      return `<div class="an-flex">${parts.map((t, i) => `<div class="an-box ${s.part === i + 1 ? "hot" : ""}"><b>${esc(t)}</b></div>`).join("")}</div>` +
        `<div class="an-flex"><div class="an-box"><small>k</small><b>${s.k}</b></div><div class="an-box"><small>輸出</small><b>${esc(s.out) || "&nbsp;"}</b></div></div>`;
    },
  });
})();

// 第 6 章：外層像時針、內層像分針；第 i 列印 i 顆星
(function () {
  const n = 4, steps = [{ text: "外層 i 決定「第幾列」，內層 j 決定「這一列的第幾顆」。外層走一格，內層要從頭走完一輪。", s: { i: 0, j: 0, rows: [] } }];
  const rows = [];
  for (let i = 1; i <= n; i++) {
    rows.push("");
    for (let j = 1; j <= i; j++) {
      rows[i - 1] += "*";
      steps.push({ text: `i = ${i}，j = ${j}：印一顆星。${j === i ? `j 已經到 i 了，內層結束。` : ""}`, s: { i, j, rows: rows.slice() } });
    }
    steps.push({ text: `第 ${i} 列印完 ${i} 顆，換行，外層 i 前進到 ${i + 1}。${i === n ? "i 超過 n，全部結束。" : ""}`, s: { i, j: 0, rows: rows.slice(), nl: true } });
  }
  defineAnim("nested-clock", {
    title: "巢狀迴圈：外層一圈，內層一整輪",
    speed: 900,
    steps,
    render(s) {
      const grid = s.rows.map((r, k) => cellRow(r.split("").map((c, j) => ({ v: c, cls: k === s.i - 1 && j === s.j - 1 ? "hot" : "" })), `第 ${k + 1} 列`)).join("");
      return `<div class="an-flex"><div class="an-box ${s.nl ? "hot" : ""}"><small>外層 i（時針）</small><b>${s.i || "-"}</b></div>` +
        `<div class="an-box ${s.j && !s.nl ? "hot" : ""}"><small>內層 j（分針）</small><b>${s.j || "-"}</b></div></div>${grid}`;
    },
  });
})();

// 第 7 章：a[i] 的位址 = 開頭位址 + i × 4；i 超出範圍就指到別人的資料
(function () {
  const steps = [];
  for (let i = 0; i <= 6; i++) {
    const addr = 200 + i * 4;
    steps.push({
      text: i < 5 ? `\`&a[${i}]\` = 200 + ${i} × 4 = ${addr}：電腦直接用乘法算出位置，所以存取任何一格都一樣快。`
        : `i = ${i}：200 + ${i} × 4 = ${addr} 已經超出陣列（a 只有 a[0] ~ a[4]）。C **不會**幫你檢查，會直接讀寫到別的資料！`,
      s: { i, addr },
    });
  }
  defineAnim("array-address", {
    title: "陣列的位址怎麼算",
    steps,
    setup(api) {
      api.extra.innerHTML = '<label>i = <b>0</b> <input type="range" min="0" max="6" value="0" aria-label="索引 i"></label>';
      const r = $("input", api.extra), lab = $("b", api.extra);
      r.addEventListener("input", () => { lab.textContent = r.value; api.show(+r.value); });
    },
    render(s) {
      const vals = [10, 20, 30, 40, 50, "別的資料", "別的資料"];
      const cells = vals.map((v, k) => ({ v, top: k === s.i ? "▼" : k < 5 ? `a[${k}]` : "", bot: 200 + k * 4,
        cls: k === s.i ? (k < 5 ? "hot" : "bad") : k >= 5 ? "dim" : "" }));
      return cellRow(cells, "int a[5]") + `<div class="an-flex"><div class="an-box ${s.i >= 5 ? "bad" : "hot"}"><small>&a[${s.i}]</small><b>200 + ${s.i} × 4 = ${s.addr}</b></div></div>`;
    },
  });
})();

// 第 7 章：1-P5 Jolly Jumper 的打勾表
(function () {
  function run(seq, steps) {
    const n = seq.length, seen = Array(n).fill(false);
    steps.push({ text: `序列 ${seq.join(" ")}（n = ${n}）。相鄰差的絕對值要剛好是 1 ~ ${n - 1} 各一次。seen[] 一開始全部是 false。`, s: { seq, seen: seen.slice(), i: 0, d: null } });
    for (let i = 1; i < n; i++) {
      const d = Math.abs(seq[i] - seq[i - 1]);
      if (d < 1 || d > n - 1 || seen[d]) {
        steps.push({ text: `|${seq[i]} − ${seq[i - 1]}| = ${d}：${seen[d] ? `seen[${d}] 已經打過勾，**重複了**` : "超出 1 ~ n−1 的範圍"} → Not jolly。`, s: { seq, seen: seen.slice(), i, d, bad: true } });
        return;
      }
      seen[d] = true;
      steps.push({ text: `|${seq[i]} − ${seq[i - 1]}| = ${d}：在 seen[${d}] 打勾。`, s: { seq, seen: seen.slice(), i, d } });
    }
    steps.push({ text: "每個差都沒有重複、也都在範圍內 → Jolly！", s: { seq, seen: seen.slice(), i: n, d: null, ok: true } });
  }
  const steps = [];
  run([1, 4, 2, 3], steps);
  run([1, 4, 2, -1, 6], steps);
  defineAnim("tally-table", {
    title: "打勾表：把「值」當成「索引」",
    steps,
    render(s) {
      const seq = s.seq.map((v, k) => ({ v, cls: s.i > 0 && s.i < s.seq.length && (k === s.i || k === s.i - 1) ? "hot" : "" }));
      const seen = s.seen.map((v, k) => ({ v: k === 0 ? "" : v ? "✓" : "", top: `[${k}]`, cls: k === 0 ? "dim" : k === s.d ? (s.bad ? "bad" : "hot") : v ? "ok" : "" }));
      return cellRow(seq, "序列") + (s.d !== null ? `<div class="an-flex"><div class="an-box ${s.bad ? "bad" : "hot"}"><small>相鄰差 d</small><b>${s.d}</b></div></div>` : "") +
        cellRow(seen, "seen[]") + (s.ok ? '<div class="an-flex"><div class="an-box ok"><b>Jolly</b></div></div>' : s.bad ? '<div class="an-flex"><div class="an-box bad"><b>Not jolly</b></div></div>' : "");
    },
  });
})();

// 第 8 章：二維陣列在記憶體裡一列接一列；點表格的格子看它在第幾格
(function () {
  const steps = [{ text: "`int a[3][3]` 看起來是表格，但記憶體只有一條直線：先放第 0 列，再放第 1 列、第 2 列。點表格裡的格子試試看。", s: { i: -1, j: -1 } }];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) steps.push({ text: `\`a[${i}][${j}]\` 在攤平後的第 **${i} × 3 + ${j} = ${i * 3 + j}** 格（每列 3 格，前面有 ${i} 整列）。`, s: { i, j } });
  }
  defineAnim("row-major", {
    title: "二維陣列：一列接著一列（row-major）",
    steps,
    setup(api) {
      api.stage.addEventListener("click", (e) => {
        const b = e.target.closest("[data-ij]");
        if (b) api.show(+b.dataset.ij + 1);
      });
    },
    render(s) {
      let t = '<table class="pa"><thead><tr><th></th><th>[0]</th><th>[1]</th><th>[2]</th></tr></thead><tbody>';
      for (let i = 0; i < 3; i++) {
        t += `<tr><th>[${i}]</th>`;
        for (let j = 0; j < 3; j++) {
          t += `<td class="${i === s.i && j === s.j ? "chg" : ""}"><button class="lnk" data-ij="${i * 3 + j}" aria-label="a[${i}][${j}]">${i * 3 + j + 1}</button></td>`;
        }
        t += "</tr>";
      }
      t += "</tbody></table>";
      const k = s.i * 3 + s.j;
      const flat = Array.from({ length: 9 }, (_, x) => ({ v: x + 1, top: `[${Math.floor(x / 3)}][${x % 3}]`, bot: x, cls: x === k ? "hot" : "" }));
      return `<div class="an-flex"><div><div class="an-note">程式裡看到的樣子</div>${t}</div></div>` + cellRow(flat, "記憶體");
    },
  });
})();

// 第 8 章：1-P1 魔方陣，往左上填，撞到就往下，超出邊界就繞到另一邊
(function () {
  const n = 3, sq = Array.from({ length: n }, () => Array(n).fill(0)), steps = [];
  let row = 0, col = Math.floor(n / 2), why = "1 放在第一列的正中間。";
  for (let k = 1; k <= n * n; k++) {
    sq[row][col] = k;
    steps.push({ text: `放 ${k}：${why}`, s: { sq: sq.map((r) => r.slice()), row, col } });
    let r = row - 1, c = col - 1;
    const wraps = [];
    if (r < 0) { r = n - 1; wraps.push("超出上邊界，繞到最下面一列"); }
    if (c < 0) { c = n - 1; wraps.push("超出左邊界，繞到最右邊一行"); }
    if (sq[r][c] !== 0) {
      why = `左上（第 ${r} 列第 ${c} 行）已經有 ${sq[r][c]} 了，改放在原本位置的**正下方**。`;
      r = row + 1; c = col;
      if (r === n) { r = 0; why += "下面超出邊界，繞到第一列。"; }
    } else why = "往**左上**一格" + (wraps.length ? `（${wraps.join("、")}）` : "") + "。";
    row = r; col = c;
  }
  steps.push({ text: "填完了！每一列、每一行、兩條對角線的總和都是 n(n² + 1) / 2 = 15。", s: { sq: sq.map((r) => r.slice()), row: -1, col: -1 } });
  defineAnim("magic-square", {
    title: "魔方陣的填法（1-P1）",
    steps,
    render(s) {
      return s.sq.map((r, i) => cellRow(r.map((v, j) => ({ v: v || "", cls: i === s.row && j === s.col ? "hot" : v ? "" : "blank" })), `第 ${i} 列`)).join("");
    },
  });
})();

/* ===== anims-c.js ===== */
/* ---------- 觀念動畫（第 9～13 章） ---------- */

// 第 9 章：字元就是整數；'7' - '0' 是 ASCII 表上的距離
(function () {
  const row = (from, to, hot) => cellRow(Array.from({ length: to - from + 1 }, (_, k) => {
    const c = from + k;
    return { v: String.fromCharCode(c), bot: c, cls: hot.includes(c) ? "hot" : "" };
  }));
  defineAnim("ascii-shift", {
    title: "字元的運算就是 ASCII 碼的運算",
    steps: [
      { text: "每個字元在電腦裡都是一個整數（ASCII 碼）。數字字元 '0' ~ '9' 是 48 ~ 57，而且**連續排在一起**。", s: { part: 0, hot: [] } },
      { text: "`'7' - '0'` 就是 55 − 48 = **7**：兩個字元在表上的距離，剛好就是那個數字的值。", s: { part: 0, hot: [48, 55] } },
      { text: "大寫字母 'A' ~ 'Z' 是 65 ~ 90，小寫 'a' ~ 'z' 是 97 ~ 122。", s: { part: 1, hot: [] } },
      { text: "同一個字母，小寫比大寫多 **32**：'a' − 'A' = 97 − 65 = 32。", s: { part: 1, hot: [65, 97] } },
      { text: "所以小寫轉大寫可以寫 `c - 32`，或更清楚的 `c - 'a' + 'A'`。'g' − 'a' + 'A' = 103 − 97 + 65 = 71 = 'G'。", s: { part: 1, hot: [71, 103] } },
    ],
    render(s) {
      if (s.part === 0) return row(48, 57, s.hot);
      return row(65, 77, s.hot) + row(97, 109, s.hot);
    },
  });
})();

// 第 10 章：strlen 從第 0 格走到 '\0'；strcmp 逐字比較
(function () {
  const cells = ["c", "a", "t", "\\0", "?", "?"];
  const steps = [{ text: "`char s[6] = \"cat\";`：字串後面會自動放一個 '\\0' 當結束記號，再後面的格子沒有用到。", s: { part: 0, i: -1, len: 0 } }];
  for (let i = 0; i <= 3; i++) {
    steps.push({ text: i < 3 ? `s[${i}] 是 '${cells[i]}'，不是 '\\0'，長度 +1 → ${i + 1}。` : "s[3] 是 '\\0'：停下來。長度是 3（'\\0' 不算）。",
      s: { part: 0, i, len: Math.min(i + 1, 3) } });
  }
  const a = "cat", b = "car";
  for (let i = 0; i < 3; i++) {
    const same = a[i] === b[i];
    steps.push({ text: same ? `第 ${i} 個字元都是 '${a[i]}'，一樣，繼續比下一個。`
      : `第 ${i} 個字元不一樣：'${a[i]}'(${a.charCodeAt(i)}) 和 '${b[i]}'(${b.charCodeAt(i)})。't' 比較大，所以 \`strcmp("cat", "car")\` 回傳**正數**。只有完全一樣才回傳 0。`,
    s: { part: 1, i, diff: !same } });
    if (!same) break;
  }
  defineAnim("strlen-scan", {
    title: "strlen 和 strcmp 怎麼走過字串",
    steps,
    render(s) {
      if (s.part === 0) {
        const row = cells.map((c, k) => ({ v: c, top: k === s.i ? "▼" : `[${k}]`, cls: k === s.i ? (k === 3 ? "ok" : "hot") : k > 3 ? "dim" : "" }));
        return cellRow(row, "s") + `<div class="an-flex"><div class="an-box"><small>len</small><b>${s.len}</b></div></div>`;
      }
      const mk = (str) => str.split("").map((c, k) => ({ v: c, cls: k === s.i ? (s.diff ? "bad" : "hot") : k < s.i ? "ok" : "" }));
      return cellRow(mk(a), '"cat"') + cellRow(mk(b), '"car"');
    },
  });
})();

// 第 11 章：呼叫函式時 frame 疊上去、參數是「複製」過去的、return 後 frame 拿掉
(function () {
  const st = (frames, hot, text) => ({ text, s: { frames, hot } });
  const main = (g) => ({ name: "main", vars: `x = 48, y = 18, g = ${g}` });
  defineAnim("call-stack", {
    title: "函式呼叫：call stack",
    steps: [
      st([main("?")], 0, "main 執行到 `int g = gcd(x, y);`。main 的變數放在自己的 frame（一塊記憶體）裡。"),
      st([main("?"), { name: "gcd", vars: "a = 48, b = 18" }], 1, "呼叫 gcd：在 stack 上**疊一個新的 frame**。參數 a、b 是 x、y 的**複本**（傳值呼叫）。"),
      st([main("?"), { name: "gcd", vars: "a = 18, b = 12" }], 1, "gcd 的迴圈改的是自己的 a、b。main 的 x、y 完全沒有變。"),
      st([main("?"), { name: "gcd", vars: "a = 12, b = 6" }], 1, "繼續輾轉相除……"),
      st([main("?"), { name: "gcd", vars: "a = 6, b = 0" }], 1, "b 變成 0，迴圈結束，準備 `return a;`。"),
      st([main(6), { name: "gcd", vars: "回傳 6", gone: true }], 0, "return 之後 gcd 的 frame 就**拿掉**了（裡面的變數也消失），回傳值 6 放進 main 的 g。x、y 還是 48、18。"),
    ],
    render(s) {
      return '<div class="an-stack">' + s.frames.map((f, i) =>
        `<div class="an-frame ${f.gone ? "gone" : i === s.hot ? "hot" : ""}"><b>${f.name}()</b>　${esc(f.vars)}</div>`).join("") +
        '</div><p class="an-note">stack 由下往上疊：最上面是正在執行的函式。</p>';
    },
  });
})();

// 第 11 章：遞迴 gcd 一層層疊上去再回傳；fib 遞迴樹有很多重複計算
(function () {
  const steps = [];
  const calls = [[48, 18], [18, 12], [12, 6], [6, 0]];
  for (let k = 1; k <= calls.length; k++) {
    steps.push({ text: k < calls.length ? `gcd(${calls[k - 1].join(", ")})：b 不是 0，呼叫 gcd(${calls[k].join(", ")})，**再疊一層**。`
      : "gcd(6, 0)：b 是 0，這是**終止條件**，直接回傳 6。", s: { part: 0, n: k, ret: k === calls.length ? 1 : 0 } });
  }
  for (let r = 2; r <= calls.length; r++) steps.push({ text: `回傳 6 給上一層，這一層也就結束了。`, s: { part: 0, n: calls.length, ret: r } });
  const tree = [];
  const walk = (n, d) => { tree.push({ n, d }); if (n >= 2) { walk(n - 1, d + 1); walk(n - 2, d + 1); } };
  walk(4, 0);
  steps.push({ text: "另一個例子：`fib(n) = fib(n-1) + fib(n-2)`。來看 fib(4) 會呼叫哪些函式。", s: { part: 1, shown: 1 } });
  steps.push({ text: "照呼叫的順序展開……", s: { part: 1, shown: 5 } });
  steps.push({ text: `全部展開一共呼叫了 ${tree.length} 次。紅色的是**重複算的**：fib(2) 算了 2 次、fib(1) 算了 3 次。n 越大重複越多，所以這種寫法很慢，要改用陣列預先建表（第 13 章技巧 5）。`, s: { part: 1, shown: tree.length, dup: true } });
  defineAnim("recursion", {
    title: "遞迴：自己呼叫自己",
    steps,
    render(s) {
      if (s.part === 0) {
        // ret = 已經有幾層回傳了（從最上層算）；正在回傳的那一層高亮，更上面的已經拿掉
        const now = s.ret ? calls.length - s.ret : s.n - 1;
        return '<div class="an-stack">' + calls.slice(0, s.n).map((c, i) => {
          const cls = i === now ? "hot" : i > now ? "gone" : "";
          return `<div class="an-frame ${cls}">gcd(${c.join(", ")})${s.ret && i >= now ? "　→ 回傳 6" : ""}</div>`;
        }).join("") + "</div>";
      }
      const count = {};
      tree.forEach((t) => { count[t.n] = (count[t.n] || 0) + 1; });
      const seen = {};
      return '<div class="an-tree">' + tree.slice(0, s.shown).map((t) => {
        seen[t.n] = (seen[t.n] || 0) + 1;
        return `<div style="--d:${t.d}"><span class="${s.dup && count[t.n] > 1 && t.n < 3 ? "dup" : ""}">fib(${t.n})</span></div>`;
      }).join("") + "</div>";
    },
  });
})();

// 第 12 章：p = &n 畫出箭頭；*p 沿著箭頭改到 n；用指標寫的 swap
(function () {
  const box = (name, addr, val, cls) => `<div class="an-box ${cls || ""}"><small>${name}（位址 ${addr}）</small><b>${esc(val)}</b></div>`;
  const P0 = (n, p, arrow, hot) => ({ part: 0, n, p, arrow, hot });
  const P1 = (a, b, t, hot, done) => ({ part: 1, a, b, t, hot, done });
  defineAnim("pointer-arrow", {
    title: "指標：存位址的變數",
    steps: [
      { text: "`int n = 5;`：n 住在位址 0x100 的格子裡。", s: P0("5", null, false, "n") },
      { text: "`int *p;`：p 是指標變數，它的格子裡要放的是「位址」。現在還沒給值。", s: P0("5", "?", false, "p") },
      { text: "`p = &n;`：&n 是 n 的位址 0x100，把它放進 p。我們說「**p 指向 n**」。", s: P0("5", "0x100", true, "p") },
      { text: "`*p = 100;`：*p 的意思是「沿著箭頭走到 p 指的地方」，所以改到的是 **n**。", s: P0("100", "0x100", true, "n") },
      { text: "用指標寫 swap：`swap(&a, &b);` 傳進去的是 a、b 的**位址**，x 指向 a、y 指向 b。", s: P1("3", "5", "", "xy") },
      { text: "`int t = *x;`：沿著 x 走到 a，拿到 3。", s: P1("3", "5", "3", "a") },
      { text: "`*x = *y;`：把 b 的值 5 寫到 x 指的地方，也就是 a。", s: P1("5", "5", "3", "a") },
      { text: "`*y = t;`：把 3 寫到 y 指的地方，也就是 b。回到 main，a、b 真的交換了。這就是 scanf 要寫 & 的原因：它也需要知道變數的位址才能改到它。", s: P1("5", "3", "3", "b", true) },
    ],
    render(s) {
      if (s.part === 0) {
        return '<div class="an-flex">' + box("int *p", "0x200", s.p === null ? "（還沒宣告）" : s.p, s.hot === "p" ? "hot" : s.p === null ? "dim" : "") +
          `<div class="an-arrow${s.arrow ? " on" : ""}">${s.arrow ? "──指向──→" : "　"}</div>` + box("int n", "0x100", s.n, s.hot === "n" ? "hot" : "") + "</div>";
      }
      return '<div class="an-note">swap 的 frame</div><div class="an-flex">' + box("int *x", "0x300", "0x110 → a", s.hot === "xy" ? "hot" : "") +
        box("int *y", "0x308", "0x114 → b", s.hot === "xy" ? "hot" : "") + box("int t", "0x310", s.t || "?", "") + "</div>" +
        '<div class="an-note">main 的 frame</div><div class="an-flex">' + box("int a", "0x110", s.a, s.hot === "a" ? "hot" : s.done ? "ok" : "") +
        box("int b", "0x114", s.b, s.hot === "b" ? "hot" : s.done ? "ok" : "") + "</div>";
    },
  });
})();

// 第 13 章：一直除以 2，餘數由下往上讀就是二進位
(function () {
  const rows = [];
  let n = 21;
  while (n > 0) { rows.push([n, Math.floor(n / 2), n % 2]); n = Math.floor(n / 2); }
  const steps = [{ text: "把 21 轉成二進位：不斷除以 2，記下餘數。", s: { k: 0 } }];
  rows.forEach((r, i) => steps.push({ text: `${r[0]} ÷ 2 = ${r[1]} 餘 **${r[2]}**${r[1] === 0 ? "。商變成 0，停下來。" : "。"}`, s: { k: i + 1 } }));
  steps.push({ text: "餘數要**由下往上**讀：10101。第一個算出來的餘數是最低位（個位），所以 1-P3 Parity 要先存進陣列再倒著印。", s: { k: rows.length, read: true } });
  defineAnim("to-binary", {
    title: "十進位轉二進位",
    steps,
    render(s) {
      let t = '<table class="pa"><thead><tr><th>被除數</th><th>÷ 2 =</th><th>餘數</th></tr></thead><tbody>';
      rows.slice(0, s.k).forEach((r, i) => { t += `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="${s.read || i === s.k - 1 ? "chg" : ""}">${r[2]}</td></tr>`; });
      t += "</tbody></table>";
      const bin = s.read ? `<div class="an-flex"><div class="an-arrow on">↑ 由下往上讀</div><div class="an-box ok"><small>21 的二進位</small><b>${rows.map((r) => r[2]).reverse().join("")}</b></div></div>` : "";
      return `<div class="an-flex"><div>${t}</div>${bin}</div>`;
    },
  });
})();

// 第 13 章：1-P9 貪婪法：從最大的費氏數開始拿
(function () {
  const fib = [1, 2, 3, 5, 8, 13];
  const steps = [{ text: "把 17 寫成費氏進位。可以用的費氏數：1、2、3、5、8、13（21 已經超過 17）。從**最大的**開始試。", s: { k: fib.length, x: 17, bits: [] } }];
  let x = 17;
  const bits = [];
  for (let i = fib.length - 1; i >= 0; i--) {
    const take = fib[i] <= x;
    bits.push(take ? 1 : 0);
    steps.push({ text: take ? `${fib[i]} ≤ ${x}：拿！這一位寫 1，剩下 ${x} − ${fib[i]} = ${x - fib[i]}。` : `${fib[i]} > ${x}：拿不了，這一位寫 0。`,
      s: { k: i, x: take ? x - fib[i] : x, bits: bits.slice(), take } });
    if (take) x -= fib[i];
  }
  steps.push({ text: "17 = 13 + 3 + 1 → **100101 (fib)**。每次都拿「能拿的最大的」，結果自然不會有兩個連續的 1。", s: { k: -1, x: 0, bits: bits.slice(), done: true } });
  defineAnim("greedy-fib", {
    title: "貪婪法：費氏進位（1-P9）",
    steps,
    render(s) {
      const row = fib.slice().reverse().map((f, j) => {
        const i = fib.length - 1 - j;
        return { v: f, bot: j < s.bits.length ? s.bits[j] : "", cls: i === s.k ? (s.take ? "ok hot" : "hot") : j < s.bits.length && s.bits[j] ? "ok" : j < s.bits.length ? "dim" : "" };
      });
      return cellRow(row, "費氏數") + `<div class="an-flex"><div class="an-box"><small>還剩</small><b>${s.x}</b></div>` +
        `<div class="an-box ${s.done ? "ok" : ""}"><small>寫下來的位數</small><b>${s.bits.join("") || "&nbsp;"}</b></div></div>`;
    },
  });
})();

// 第 13 章：0-P5 Cola 的模擬：3 個空瓶換 1 瓶，最後借 1 個
(function () {
  const st = (full, empty, drunk, borrow, text) => ({ text, s: { full, empty, drunk, borrow } });
  defineAnim("cola-sim", {
    title: "模擬：空瓶換可樂（0-P5）",
    steps: [
      st(8, 0, 0, 0, "買了 8 瓶可樂。"),
      st(0, 8, 8, 0, "全部喝完：喝了 8 瓶，手上有 8 個空瓶。"),
      st(2, 2, 8, 0, "8 個空瓶換可樂：`8 / 3 = 2` 瓶，剩下 `8 % 3 = 2` 個空瓶。"),
      st(0, 4, 10, 0, "喝完這 2 瓶：一共喝了 10 瓶，空瓶變成 2 + 2 = 4 個。"),
      st(1, 1, 10, 0, "4 個空瓶換 1 瓶，剩 1 個空瓶。"),
      st(0, 2, 11, 0, "喝完：一共 11 瓶，手上 2 個空瓶，不夠換了……"),
      st(1, 0, 11, 1, "向朋友**借 1 個空瓶**（虛線），湊成 3 個，換 1 瓶。"),
      st(0, 0, 12, 0, "喝完之後，把這個空瓶還給朋友。一共喝了 **12** 瓶。"),
      st(0, 0, 12, 0, "多試幾個 N 會發現答案就是 ⌊3N / 2⌋（8 × 3 / 2 = 12）：先模擬，再從結果找規律。"),
    ],
    render(s) {
      const b = (k, cls) => `<span class="bt ${cls}"></span>`.repeat(k);
      return `<div class="an-flex"><div class="an-box"><small>沒喝的</small>${b(s.full, "") || "&nbsp;"}</div>` +
        `<div class="an-box"><small>空瓶</small>${b(s.empty, "empty") + b(s.borrow, "borrow") || "&nbsp;"}</div>` +
        `<div class="an-box hot"><small>一共喝了</small><b>${s.drunk}</b></div></div>`;
    },
  });
})();

/* ===== practice.js ===== */
/* ---------- 練習區 ---------- */
// 每題：說明 → 編輯器 → 執行／檢查答案／逐步執行／提示／參考解答／重設。
// 學生的程式存在 c-map-code:<id>，通過紀錄存在 c-map-pass:<id>。
const LEVELS = { 1: "基礎", 2: "進階", 3: "挑戰" };

const Practice = {
  mount(host) {
    const p = PR[host.dataset.practice];
    if (!p) return;
    host.classList.add("ready");
    const sample = p.tests[0];
    host.innerHTML = `<div class="pr-head"><span class="pr-tag">練習</span><strong>${esc(p.title)}</strong>` +
      `<span class="pr-level l${p.level}">${LEVELS[p.level] || ""}</span><span class="pr-status"></span></div>` +
      `<div class="pr-desc md">${md(p.desc)}</div>` +
      `<div class="pr-sample"><div><div class="res-t">範例輸入</div><pre class="out">${sample.input ? esc(sample.input) : '<span class="muted">（這題沒有輸入）</span>'}</pre></div>` +
      `<div><div class="res-t">範例輸出</div><pre class="out">${esc(sample.output)}</pre></div></div>` +
      '<div class="pr-ed"></div>' +
      '<div class="btns"><button class="btn primary" data-a="check">檢查答案</button><button class="btn" data-a="run">執行</button>' +
      '<button class="btn" data-a="trace">逐步執行</button><button class="btn ghost" data-a="hint">提示</button>' +
      '<button class="btn ghost" data-a="sol">參考解答</button><button class="btn ghost" data-a="reset">重設</button></div>' +
      '<details class="pr-custom"><summary>自訂輸入（「執行」和「逐步執行」會用這裡的輸入）</summary><textarea rows="3" spellcheck="false" aria-label="自訂輸入"></textarea></details>' +
      '<div class="pr-msg" aria-live="polite"></div><div class="pr-hint md" hidden></div><div class="pr-res" aria-live="polite"></div>' +
      '<div class="pr-sol" hidden></div><div class="pr-player"></div>';
    const key = "c-map-code:" + p.id;
    let saveTimer = null, fails = 0, solAsked = false, resetAsked = 0;
    const editor = createEditor($(".pr-ed", host), {
      value: store.get(key, null) || p.starter,
      label: `練習「${p.title}」的程式碼`,
      onChange: (v) => { clearTimeout(saveTimer); saveTimer = setTimeout(() => store.set(key, v), 400); },
    });
    const custom = $(".pr-custom textarea", host), msg = $(".pr-msg", host), res = $(".pr-res", host);
    custom.value = sample.input;
    const status = () => {
      const ok = !!store.get("c-map-pass:" + p.id, false);
      $(".pr-status", host).innerHTML = ok ? '<span class="ok">✓ 已通過</span>' : "";
    };
    status();
    const say = (t) => { msg.innerHTML = t ? `<p>${t}</p>` : ""; };

    async function run() {
      say("");
      res.innerHTML = '<p class="muted">執行中…</p>';
      const r = await runC(editor.get(), { input: custom.value });
      const probs = el("div");
      renderProblems(probs, r, editor);
      res.innerHTML = "";
      res.appendChild(probs);
      if (r.status !== "compile") res.insertAdjacentHTML("beforeend", outputBlock(r.out));
    }

    async function check() {
      say("");
      res.innerHTML = '<p class="muted">檢查中…</p>';
      const code = editor.get();
      const rows = [];
      let allPass = true, notes = [], warned = null;
      for (let i = 0; i < p.tests.length; i++) {
        const t = p.tests[i];
        const r = await runC(code, { input: t.input });
        if (r.status === "compile") {
          res.innerHTML = "";
          const probs = el("div");
          renderProblems(probs, r, editor);
          res.appendChild(probs);
          fails++;
          return;
        }
        if (!warned && r.warnings.length) warned = r;
        const label = i === 0 ? "範例" : `隱藏測資 #${i}`;
        if (r.status !== "ok") {
          allPass = false;
          rows.push({ ok: false, label, html: `<p>第 ${r.error.line} 行：${inline(r.error.msg)}</p>`, input: t.input, hidden: i > 0 });
          continue;
        }
        const d = compareOut(r.out, t.output);
        if (d.pass) { rows.push({ ok: true, label }); if (d.note) notes.push(d.note); continue; }
        allPass = false;
        rows.push({ ok: false, label, html: `<p>${esc(d.msg)}</p>${renderDiff(d)}`, input: t.input, hidden: i > 0 });
      }
      editor.markLine(0);
      const passed = rows.filter((x) => x.ok).length;
      let h = allPass
        ? `<div class="res-pass"><strong>全部通過！</strong>（${passed} / ${rows.length} 組測資）${notes.length ? `<p>${esc(notes[0])}</p>` : ""}</div>`
        : `<div class="res-fail"><strong>通過 ${passed} / ${rows.length} 組測資</strong>，再檢查看看。</div>`;
      h += '<ul class="tests">' + rows.map((x, i) => `<li class="${x.ok ? "ok" : "bad"}"><span class="mark">${x.ok ? "✓" : "✗"}</span>${x.label}` +
        (x.ok ? "" : x.hidden ? `<button class="lnk" data-reveal="${i}">顯示這組測資和差異</button><div class="reveal" hidden>` +
          `<div class="res-t">輸入</div><pre class="out">${esc(x.input) || '<span class="muted">（沒有輸入）</span>'}</pre>${x.html}</div>` : x.html) + "</li>").join("") + "</ul>";
      res.innerHTML = h;
      if (warned) {
        const w = el("div");
        renderProblems(w, { warnings: warned.warnings }, editor);
        res.appendChild(w);
      }
      $$("[data-reveal]", res).forEach((b) => b.addEventListener("click", () => { b.nextElementSibling.hidden = false; b.remove(); }));
      if (allPass) {
        store.set("c-map-pass:" + p.id, true);
        status();
        Page.refreshDone();
      } else fails++;
    }

    host.addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]");
      if (!b) return;
      const a = b.dataset.a;
      if (a !== "reset") resetAsked = 0;
      if (a === "run") run();
      else if (a === "check") check();
      else if (a === "trace") Player.mount($(".pr-player", host), { code: editor.get(), input: custom.value, editor });
      else if (a === "hint") {
        const h = $(".pr-hint", host);
        h.hidden = !h.hidden;
        if (!h.hidden) h.innerHTML = `<div class="box tip"><div class="box-t">提示</div>${md(p.hint || "這題沒有提示，試著把題目拆成小步驟。")}</div>`;
      } else if (a === "sol") {
        const s = $(".pr-sol", host);
        if (!s.hidden) { s.hidden = true; return; }
        if (!fails && !solAsked) {
          solAsked = true;
          say("還沒試過就要看答案嗎？自己想過再看，會記得比較牢。確定要看的話，再按一次「參考解答」。");
          return;
        }
        say("");
        s.hidden = false;
        s.innerHTML = `<div class="res-t">參考解答</div><pre class="code"><code>${highlight(p.solution)}</code></pre>`;
      } else if (a === "reset") {
        if (Date.now() - resetAsked > 5000) {
          resetAsked = Date.now();
          say("再按一次「重設」會清掉你寫的程式，回到一開始的樣子。");
          return;
        }
        resetAsked = 0;
        editor.set(p.starter);
        store.del(key);
        say("已經重設。");
        res.innerHTML = "";
      }
    });
  },
};

/* ---------- 章節裡的互動元件：快捲到時才初始化 ---------- */
const Widgets = (function () {
  let io = null;
  function mount(node) {
    if (node.classList.contains("ready")) return;
    if (node.matches("[data-practice]")) Practice.mount(node);
    else if (node.matches("[data-anim]")) Anim.mount(node);
  }
  // 備援：快速捲動時 IntersectionObserver 可能漏掉某些元件，所以瀏覽器閒下來時也會一個一個初始化
  const idle = [];
  const later = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  function safeMount(n) {
    try { mount(n); } catch (err) { /* 單一元件壞掉不影響其他的 */ }
  }
  function drain() {
    const n = idle.shift();
    if (!n) return;
    if (!n.classList.contains("ready")) { io.unobserve(n); safeMount(n); }
    later(drain);
  }
  function observe(root) {
    if (!io) {
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        safeMount(e.target);
      }), { rootMargin: "600px 0px" });
    }
    const nodes = $$("[data-practice], [data-anim]", root);
    nodes.forEach((n) => io.observe(n));
    const start = !idle.length;
    idle.push(...nodes);
    if (start) later(drain);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-trace-start]");
    if (!b) return;
    const t = TRACES[+b.dataset.traceStart], box = b.closest(".trace");
    $("pre.code", box).hidden = true;
    b.hidden = true;
    const host = el("div", "tr-player");
    box.appendChild(host);
    Player.mount(host, { code: t.code, input: t.input });
  });
  return { observe };
})();

/* ===== page.js ===== */
/* ---------- 頁面：側邊路線、路線總圖、章節、題目總覽、抽屜 ---------- */
let Page = null;
// 內容載入之後才建立頁面（見 loader.js）
function makePage() {
  const usedBy = {};
  CHAPTERS.forEach((c) => { usedBy[c.id] = []; });
  const LINES = PROBLEMS.filter((p) => !p.same && p.chapters.length);   // 重複的題目、還沒放進章節的題目不畫路線
  LINES.forEach((p) => p.chapters.forEach((c) => usedBy[c] && usedBy[c].push(p)));
  let done = store.get("c-map-done", {}) || {};

  const passed = (id) => !!store.get("c-map-pass:" + id, false);
  function practiceCount(c) {
    const ids = c.practice || [];
    return { n: ids.filter(passed).length, total: ids.length };
  }

  function buildRoute() {
    $("#route").innerHTML = CHAPTERS.map((c) =>
      `<li><a href="#${c.id}" data-ch="${c.id}"><span class="dot"></span><span class="num">${c.num}</span>` +
      `<span class="rt">${esc(c.title)}${(c.practice || []).length ? `<small class="pcount" data-pcount="${c.id}"></small>` : ""}</span></a></li>`
    ).join("") + '<li class="terminal"><a href="#problems"><span class="dot dark"></span><span class="num"></span><span>題目總覽</span></a></li>';
  }

  function buildMetro() {
    let mt = "<thead><tr><th></th>" + CHAPTERS.map((c) => `<th class="ch"><a href="#${c.id}">${esc(c.short || c.title)}</a><small>${c.num}</small></th>`).join("") + "</tr></thead><tbody>";
    LINES.forEach((p) => {
      const idx = CHAPTERS.map((c, k) => (p.chapters.includes(c.id) ? k : -1)).filter((k) => k >= 0);
      const first = Math.min(...idx), lastI = Math.max(...idx);
      mt += `<tr style="--line:${p.color}"><td class="pname"><button data-open="${p.id}"><b style="background:${p.color}">${p.code}</b><span>${esc(p.title)}</span></button></td>`;
      CHAPTERS.forEach((c, k) => {
        if (k < first || k > lastI) { mt += "<td></td>"; return; }
        const cls = ["seg", k === first ? "start" : "", k === lastI ? "end" : ""].join(" ");
        mt += `<td class="${cls}">${p.chapters.includes(c.id) ? `<a class="stop" href="#${c.id}" title="${esc(p.code + " → " + c.title)}" aria-label="${esc(p.code + " 用到 " + c.title)}"></a>` : ""}</td>`;
      });
      mt += "</tr>";
    });
    $("#metro").innerHTML = mt + "</tbody>";
  }

  // 章節先放外框，Markdown 等快捲到時才渲染（由上往下依序，避免畫面跳動）
  let rendered = 0;
  function buildChapters() {
    const host = $("#chapters");
    CHAPTERS.forEach((c, k) => {
      const sec = el("section", "chapter");
      sec.id = c.id;
      const chips = usedBy[c.id].map((p) => `<button class="pchip" style="background:${p.color}" data-open="${p.id}" title="${esc(p.title)}">${p.code}</button>`).join("");
      const next = CHAPTERS[k + 1];
      sec.innerHTML = `<div class="ch-head"><div class="ch-badge">${c.num}</div><h2>${esc(c.title)}</h2><div class="lines">${chips}</div></div>` +
        (c.lead ? `<p class="ch-lead">${inline(c.lead)}</p>` : "") +
        `<div class="md ch-body"><p class="loading">載入中…</p></div>` +
        `<div class="ch-foot"><button class="donebtn" data-done="${c.id}" aria-pressed="false">這站我讀完了</button>` +
        (next ? `<a href="#${next.id}">下一站：${esc(next.title)}</a>` : '<a href="#problems">終點：題目總覽</a>') + "</div>";
      host.appendChild(sec);
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) renderUpTo(CHAPTERS.findIndex((c) => c.id === e.target.id));
    }), { rootMargin: "1500px 0px 1500px 0px" });
    $$(".chapter[id^=ch-]").forEach((s) => io.observe(s));
  }
  function renderUpTo(k) {
    while (rendered <= k && rendered < CHAPTERS.length) {
      const c = CHAPTERS[rendered];
      const body = $(`#${c.id} .ch-body`);
      body.innerHTML = md(c.md, { id: c.id });
      Widgets.observe(body);
      rendered++;
    }
  }
  // 跳到某個位置之前，先把前面的章節都渲染好，位置才會準
  function goTo(hash, smooth) {
    const id = hash.replace(/^#/, "");
    let chId = (id.match(/^ch-[a-z0-9]+/) || [])[0];
    if (!chId && id.startsWith("pr-") && PR[id.slice(3)]) chId = PR[id.slice(3)].chapter;
    if (chId) renderUpTo(CHAPTERS.findIndex((c) => c.id === chId));
    else if (id === "problems") renderUpTo(CHAPTERS.length - 1);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: smooth && !reduceMotion ? "smooth" : "auto" });
  }

  function buildProblemList() {
    const groups = {};
    PROBLEMS.forEach((p) => (groups[p.group] = groups[p.group] || []).push(p));
    $("#plistWrap").innerHTML = Object.keys(groups).map((g) =>
      `<h3 class="pgroup">${esc(g)}</h3><div class="plist">` + groups[g].map((p) =>
        `<button class="pitem" style="--line:${p.color}" data-open="${p.same || p.id}"><b>${p.code}${p.same ? "　→ 同 " + esc(P[p.same].code) : ""}</b>` +
        `<strong>${esc(p.title)}</strong><p>${esc(p.summary)}</p></button>`).join("") + "</div>").join("");
  }

  function refreshDone() {
    let n = 0;
    CHAPTERS.forEach((c) => {
      const on = !!done[c.id];
      if (on) n++;
      const a = $(`.route a[data-ch="${c.id}"]`);
      if (a) a.classList.toggle("done", on);
      const b = $(`[data-done="${c.id}"]`);
      if (b) { b.setAttribute("aria-pressed", on); b.textContent = on ? "已讀完 ✓" : "這站我讀完了"; }
      const pc = $(`[data-pcount="${c.id}"]`);
      if (pc) {
        const { n: k, total } = practiceCount(c);
        pc.textContent = `練習 ${k}/${total}`;
        pc.classList.toggle("all", k === total);
      }
    });
    $("#progText").textContent = `已讀 ${n} / ${CHAPTERS.length} 站`;
    $("#progBar").style.width = (n / CHAPTERS.length * 100) + "%";
  }

  // 目前所在章節（也記下來，下次可以從這裡繼續）
  function trackCurrent() {
    const links = {};
    $$(".route a[data-ch]").forEach((a) => { links[a.dataset.ch] = a; });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      Object.values(links).forEach((a) => a.classList.remove("current"));
      if (links[e.target.id]) { links[e.target.id].classList.add("current"); store.set("c-map-last", e.target.id); }
    }), { rootMargin: "-20% 0px -70% 0px" });
    $$(".chapter[id^=ch-]").forEach((s) => io.observe(s));
  }
  function showContinue() {
    const last = store.get("c-map-last", null);
    const k = CHAPTERS.findIndex((c) => c.id === last);
    if (k <= 0) return;
    const c = CHAPTERS[k];
    const box = $("#continue");
    box.innerHTML = `<a class="btn primary" href="#${c.id}">從上次離開的地方繼續：第 ${c.num} 站　${esc(c.title)}</a>`;
    box.hidden = false;
  }

  /* ---------- 搜尋：章節標題、小節標題、練習題名 ---------- */
  const index = [];
  function buildIndex() {
    CHAPTERS.forEach((c) => {
      index.push({ text: c.title, sub: `第 ${c.num} 站`, href: "#" + c.id, kind: "章" });
      let fence = false;
      c.md.split("\n").forEach((line) => {
        if (/^```/.test(line)) fence = !fence;
        const m = !fence && line.match(/^(#{2,3}) (.*)$/);
        if (m && !/^(在題目中出現|自我檢查)$/.test(m[2])) {
          index.push({ text: m[2].replace(/[`*]/g, ""), sub: `第 ${c.num} 站 ${c.title}`, href: `#${c.id}-${hashId(m[2])}`, kind: "節" });
        }
      });
      (c.practice || []).forEach((id) => index.push({ text: PR[id].title, sub: `第 ${c.num} 站的練習`, href: "#pr-" + id, kind: "練習" }));
    });
  }
  function search(q) {
    const box = $("#searchResults");
    q = q.trim().toLowerCase();
    if (!q) { box.innerHTML = ""; box.hidden = true; return; }
    const hits = index.filter((x) => x.text.toLowerCase().includes(q)).slice(0, 12);
    box.hidden = false;
    box.innerHTML = hits.length ? hits.map((h) => `<li><a href="${h.href}" data-goto><span class="sk">${h.kind}</span>${esc(h.text)}<small>${esc(h.sub)}</small></a></li>`).join("")
      : '<li class="none">找不到符合的內容</li>';
  }

  /* ---------- 題目抽屜 ---------- */
  const drawer = () => $("#drawer");
  let curP = null, lastFocus = null;
  function openProblem(id, tab) {
    const p = P[id];
    if (!p) return;
    curP = p;
    lastFocus = document.activeElement;
    $("#dPanel").style.setProperty("--line", p.color);
    $("#dTitle").textContent = `${p.code}  ${p.title}`;
    $("#dStations").innerHTML = "經過的站：" + CHAPTERS.filter((c) => p.chapters.includes(c.id)).map((c) => `<a href="#${c.id}" data-inner>${c.num} ${esc(c.title)}</a>`).join("");
    drawer().classList.add("open");
    document.body.style.overflow = "hidden";
    showTab(tab || "notes");
    $("#dPanel .close").focus();
  }
  function showTab(t) {
    $("#tabNotes").setAttribute("aria-selected", t === "notes");
    $("#tabCode").setAttribute("aria-selected", t === "code");
    const body = $("#dBody");
    if (t === "notes") body.innerHTML = `<div class="md">${curP.notes ? md(curP.notes) : "<p>這題還沒有筆記。</p>"}</div>`;
    else {
      body.innerHTML = `<div class="md"><div class="code-bar"><h3>${esc(curP.code)} / solution.c</h3><button class="btn" id="copyBtn">複製程式碼</button></div>` +
        `<pre class="code"><code>${highlight(curP.solution || "// 尚未提供")}</code></pre></div>` +
        (curP.solution ? '<div class="runbox" id="dRun"></div>' : "");
      if (curP.solution) RunBox.mount($("#dRun"), { src: () => curP.solution, input: curP.sampleInput || "", title: "在這裡執行（用範例輸入）" });
    }
    body.scrollTop = 0;
  }
  function closeDrawer() {
    drawer().classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function bindEvents() {
    $("#tabNotes").addEventListener("click", () => showTab("notes"));
    $("#tabCode").addEventListener("click", () => showTab("code"));
    document.addEventListener("click", (e) => {
      const o = e.target.closest("[data-open]");
      if (o) { e.preventDefault(); openProblem(o.dataset.open); return; }
      if (e.target.closest("[data-close]")) { closeDrawer(); return; }
      const a = e.target.closest('a[href^="#"]');
      if (a && !e.defaultPrevented) {
        e.preventDefault();
        if (drawer().classList.contains("open")) closeDrawer();
        history.pushState(null, "", a.getAttribute("href"));
        goTo(a.getAttribute("href"), true);
        if (a.closest(".side")) closeSide();
        if (a.hasAttribute("data-goto")) { $("#search").value = ""; search(""); }
        return;
      }
      const d = e.target.closest("[data-done]");
      if (d) { const id = d.dataset.done; done[id] = !done[id]; store.set("c-map-done", done); refreshDone(); }
      if (e.target.id === "copyBtn") {
        const btn = e.target;
        try {
          navigator.clipboard.writeText(curP.solution).then(() => { btn.textContent = "已複製"; }, () => { btn.textContent = "無法複製，請手動選取"; });
        } catch (err) { btn.textContent = "無法複製，請手動選取"; }
      }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer().classList.contains("open")) closeDrawer(); });
    window.addEventListener("popstate", () => goTo(location.hash || "#top", false));
    $("#search").addEventListener("input", (e) => search(e.target.value));
    $("#search").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { const first = $("#searchResults a"); if (first) first.click(); }
      if (e.key === "Escape") { e.target.value = ""; search(""); }
    });
    const side = $("#side"), menuBtn = $("#menuBtn");
    menuBtn.addEventListener("click", () => { const s = side.classList.toggle("show"); menuBtn.setAttribute("aria-expanded", s); });
  }
  function closeSide() { $("#side").classList.remove("show"); $("#menuBtn").setAttribute("aria-expanded", "false"); }

  function init() {
    buildRoute();
    buildMetro();
    buildChapters();
    buildProblemList();
    buildIndex();
    refreshDone();
    trackCurrent();
    showContinue();
    bindEvents();
    if (location.hash) goTo(location.hash, false);
  }
  return { init, refreshDone, goTo, openProblem };
}

/* ===== loader.js ===== */
/* ---------- 載入內容：只開放給家教學生 ---------- */
// 本機預覽：dist 的 data.js 已經把內容放在 window.LM_DATA。
// 網站上：向 API 拿 /learn/c/content（需要登入，而且帳號要是家教學生）。登入憑證過期（401）時先 refresh 再試一次。
const Loader = (function () {
  const GATES = {
    loading: { title: "載入中…", body: "" },
    login: { title: "請先登入", body: '這個學習地圖只開放給家教學生。請先<a href="/login">登入 judge.tw</a>，登入後再回到這個網址（judge.tw/learn/c）。' },
    student: { title: "這個帳號還沒有開通", body: "這個學習地圖只開放給家教學生。如果你是學生，請把你的 judge.tw 帳號告訴老師，開通之後重新整理這一頁就可以看了。" },
    notyet: { title: "內容還沒發布", body: "老師還沒有把學習地圖的內容發布到網站上，請晚一點再來看。" },
    error: { title: "載入失敗", body: '暫時拿不到內容，請<a href="">重新整理</a>再試一次。' },
  };
  function gate(kind) {
    const g = $("#gate");
    g.innerHTML = `<h3>${GATES[kind].title}</h3>${GATES[kind].body ? `<p>${GATES[kind].body}</p>` : ""}`;
    g.hidden = false;
  }
  const get = () => fetch(CONFIG.api + "/learn/c/content", { credentials: "include" });
  const refresh = () => fetch(CONFIG.api + "/auth/refresh", { method: "POST", credentials: "include" }).then((r) => r.ok, () => false);
  function boot(data) {
    setData(data);
    $("#gate").hidden = true;
    document.body.classList.remove("locked");
    Page = makePage();
    Page.init();
  }
  async function start() {
    if (window.LM_DATA) { boot(window.LM_DATA); return; }
    gate("loading");
    try {
      let res = await get();
      if (res.status === 401 && await refresh()) res = await get();
      if (res.status === 401) return gate("login");
      if (res.status === 403) return gate("student");
      if (res.status === 404) return gate("notyet");
      if (!res.ok) return gate("error");
      const body = await res.json();
      boot(body.content);
    } catch (e) {
      gate("error");
    }
  }
  return { start };
})();

/* ===== main.js ===== */
/* ---------- 啟動 ---------- */
Loader.start();

})();
