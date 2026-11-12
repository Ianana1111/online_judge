/* ---------- 觀念動畫的共用框架 ---------- */
// defineAnim(name, { title, steps | build(param), render(state, prev), setup(api) })
//   steps：[{ text: 這一步的說明, s: 狀態 }]；render 回傳 HTML（帶 hot class 的元素會閃一下）
//   setup：互動元件（滑桿、切換按鈕）用；api.rebuild(steps) 換一組步驟，api.show(k) 跳到第 k 步
import { inline } from "./markdown.js";
import { $, esc, highlightLines } from "./util.js";

export const ANIMS = {};
export function defineAnim(name, def) { ANIMS[name] = def; }

export const Anim = {
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
export function cellRow(items, label) {
  return `<div class="an-row">${label ? `<div class="an-lab">${label}</div>` : ""}<div class="an-cells">` +
    items.map((c) => `<div class="an-cellw">${c.top !== undefined ? `<span class="an-top">${esc(c.top)}</span>` : ""}` +
      `<span class="an-cell ${c.cls || ""}">${c.v === "" || c.v === undefined ? "&nbsp;" : esc(c.v)}</span>` +
      `${c.bot !== undefined ? `<span class="an-bot">${esc(c.bot)}</span>` : ""}</div>`).join("") + "</div></div>";
}
// 程式碼片段，指定的行高亮
export function codeLines(src, hot) {
  return `<pre class="an-code">${highlightLines(src).map((l, i) => `<span class="ln${(Array.isArray(hot) ? hot.includes(i + 1) : hot === i + 1) ? " hot" : ""}">${l || " "}</span>`).join("")}</pre>`;
}
export const vis = (c) => (c === " " ? "␣" : c === "\n" ? "↵" : c === "\0" ? "\\0" : c);
