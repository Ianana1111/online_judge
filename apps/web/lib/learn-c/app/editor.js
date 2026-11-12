/* ---------- 程式編輯器：textarea 疊在語法上色的 pre 上面 ---------- */
// createEditor(host, { value, label, onChange }) → { get, set, focus, markLine, goToLine }
// Tab 插入 4 個空白（先按 Esc 再按 Tab 可以離開編輯器）、Enter 自動縮排、打 } 自動退一層。
import { $, el, highlight } from "./util.js";

export function createEditor(host, opts) {
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
