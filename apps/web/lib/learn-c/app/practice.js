/* ---------- 練習區 ---------- */
// 每題：說明 → 編輯器 → 執行／檢查答案／逐步執行／提示／參考解答／重設。
// 學生的程式存在 c-map-code:<id>，通過紀錄存在 c-map-pass:<id>。
import { Anim } from "./anim-core.js";
import { compareOut, renderDiff } from "./diff.js";
import { createEditor } from "./editor.js";
import { inline, md, TRACES } from "./markdown.js";
import { Page } from "./page.js";
import { Player } from "./player.js";
import { outputBlock, renderProblems } from "./runbox.js";
import { runC } from "./runner.js";
import { $, $$, el, esc, highlight, PR, store } from "./util.js";

export const LEVELS = { 1: "基礎", 2: "進階", 3: "挑戰" };

export const Practice = {
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
export const Widgets = (function () {
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
