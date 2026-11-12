/* ---------- 頁面：側邊路線、路線總圖、章節、題目總覽、抽屜 ---------- */
import { inline, md } from "./markdown.js";
import { Widgets } from "./practice.js";
import { RunBox } from "./runbox.js";
import { $, $$, CHAPTERS, el, esc, hashId, highlight, P, PR, PROBLEMS, reduceMotion, store } from "./util.js";

export let Page = null;
export function setPage(p) { Page = p; }
// 內容載入之後才建立頁面（見 loader.js）
export function makePage() {
  const track = (o) => { observers.push(o); return o; };
  // 離開這一頁時（網站內換頁）要把事件監聽和 observer 都拿掉，回來時才不會重複
  const ac = new AbortController(), observers = [];
  const on = { signal: ac.signal };
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
    const io = track(new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) renderUpTo(CHAPTERS.findIndex((c) => c.id === e.target.id));
    }), { rootMargin: "1500px 0px 1500px 0px" }));
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
        `<button class="pitem" style="--line:${p.color}" data-open="${p.same || p.id}"><b>${p.code}${p.same ? "\u3000→ 同 " + esc(P[p.same].code) : ""}</b>` +
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
    const io = track(new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      Object.values(links).forEach((a) => a.classList.remove("current"));
      if (links[e.target.id]) { links[e.target.id].classList.add("current"); store.set("c-map-last", e.target.id); }
    }), { rootMargin: "-20% 0px -70% 0px" }));
    $$(".chapter[id^=ch-]").forEach((s) => io.observe(s));
  }
  function showContinue() {
    const last = store.get("c-map-last", null);
    const k = CHAPTERS.findIndex((c) => c.id === last);
    if (k <= 0) return;
    const c = CHAPTERS[k];
    const box = $("#continue");
    box.innerHTML = `<a class="btn primary" href="#${c.id}">從上次離開的地方繼續：第 ${c.num} 站\u3000${esc(c.title)}</a>`;
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
    }, on);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer().classList.contains("open")) closeDrawer(); }, on);
    window.addEventListener("popstate", () => goTo(location.hash || "#top", false), on);
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
  function destroy() {
    ac.abort();
    observers.forEach((o) => o.disconnect());
    document.body.style.overflow = "";
  }
  return { init, destroy, refreshDone, goTo, openProblem };
}
