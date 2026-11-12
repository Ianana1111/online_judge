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
