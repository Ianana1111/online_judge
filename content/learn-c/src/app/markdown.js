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
