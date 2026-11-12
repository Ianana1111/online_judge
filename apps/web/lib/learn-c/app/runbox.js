/* ---------- 執行結果的顯示（練習區和題目抽屜共用） ---------- */
import { inline } from "./markdown.js";
import { Player } from "./player.js";
import { runC } from "./runner.js";
import { $, $$, el, esc } from "./util.js";

export const STATUS_TEXT = { compile: "編譯錯誤", runtime: "執行錯誤", limit: "執行太久" };

// 把錯誤和警告畫出來；editor 有給的話，點錯誤可以跳到那一行
export function renderProblems(host, r, editor) {
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
export function outputBlock(text, title) {
  return `<div class="res-out"><div class="res-t">${title || "輸出"}</div><pre class="out">${text ? esc(text) : '<span class="muted">（沒有輸出）</span>'}</pre></div>`;
}

// RunBox：自訂輸入 + 執行 + 逐步執行。opts：{ src: () => 程式碼, input, title, editor }
export const RunBox = {
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
