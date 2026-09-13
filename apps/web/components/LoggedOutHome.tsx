"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useLocale } from "@/lib/i18n/LocaleContext";

const CASES = [{ values: [2, 4, 6], target: 6, expected: 2 }, { values: [2], target: 2, expected: 0 }, { values: [2, 4, 6], target: 5, expected: -1 }];
function search(values: number[], target: number, inclusive: boolean) {
  let left = 0, right = values.length - 1;
  while (inclusive ? left <= right : left < right) {
    const mid = Math.floor((left + right) / 2);
    if (values[mid] === target) return mid;
    if (values[mid] < target) left = mid + 1; else right = mid - 1;
  }
  return -1;
}

function FirstChallenge({ zh }: { zh: boolean }) {
  const [inclusive, setInclusive] = useState(false), [ran, setRan] = useState(false);
  const results = CASES.map((c) => search(c.values, c.target, inclusive));
  const passed = results.filter((r, i) => r === CASES[i].expected).length;
  return <div className="relative min-w-0 rounded-2xl border border-ink-600/70 bg-ink-900 shadow-2xl shadow-black/10">
    <div className="flex items-center justify-between gap-3 border-b border-ink-700 px-5 py-4">
      <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand" aria-hidden /><span className="font-mono text-xs text-ink-300">first_accepted.cpp</span></div>
      <span className="rounded-full border border-ink-600 px-2.5 py-1 text-[10px] font-medium text-ink-300">{zh ? "互動練習 · 約 1 分鐘" : "1-minute challenge"}</span>
    </div>
    <div className="px-5 pt-5 sm:px-6"><h2 className="text-lg font-semibold text-ink-100">{zh ? "最後一個數字，為什麼找不到？" : "Why can't it find the last number?"}</h2><p className="mt-2 text-sm leading-relaxed text-ink-300">{zh ? "陣列 [2, 4, 6] 中找 6。試著修改迴圈條件，再執行測試。" : "Find 6 in [2, 4, 6]. Change the loop condition, then run the tests."}</p></div>
    <div className="m-4 overflow-x-auto rounded-xl bg-ink-950 py-4 font-mono text-[12px] leading-7 sm:m-5 sm:text-sm" aria-label={zh ? "二分搜尋程式範例" : "Binary search example"}>
      <div className="px-4 text-ink-300"><span className="mr-5 select-none text-ink-400" aria-hidden>01</span>int l = 0, r = n - 1;</div>
      <div className="flex items-center whitespace-nowrap border-l-2 border-brand bg-brand/10 pl-[14px] pr-4"><span className="mr-5 select-none text-brand" aria-hidden>02</span><span className="text-brand">while</span><span className="ml-2 text-ink-100">(l</span>
        <select aria-label={zh ? "修改搜尋邊界條件" : "Change the search boundary"} value={inclusive ? "inclusive" : "exclusive"} onChange={(e) => { setInclusive(e.target.value === "inclusive"); setRan(false); }} className="mx-2 min-h-9 rounded-md border border-brand bg-ink-900 px-2 font-bold text-brand"><option value="exclusive">&lt;</option><option value="inclusive">&lt;=</option></select>
        <span className="text-ink-100">r) {"{"}</span><span className="ml-auto pl-4 font-body text-[10px] text-brand">{zh ? "← 試著改這裡" : "← edit me"}</span>
      </div>
      {["  int m = (l + r) / 2;", "  if (a[m] == target) return m;", "  if (a[m] < target) l = m + 1;", "  else r = m - 1;", "}", "return -1;"].map((line, i) => <div key={line} className="whitespace-pre px-4 text-ink-200"><span className="mr-5 select-none text-ink-400" aria-hidden>{String(i + 3).padStart(2, "0")}</span>{line}</div>)}
    </div>
    <div className="px-5 pb-5 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-ink-400">{zh ? "3 個邊界案例 · 在瀏覽器中示範" : "3 edge cases · browser demo"}</p><button type="button" onClick={() => setRan(true)} className="oj-btn-primary min-h-11 rounded-lg px-5"><span aria-hidden>▷</span> {zh ? "執行測試" : "Run tests"}</button></div>
      <div className="mt-4 min-h-[105px] rounded-xl border border-ink-700 p-4" role="status" aria-live="polite" aria-atomic="true">
        {ran ? <><div className="flex items-center justify-between"><p className={`font-mono text-sm font-semibold ${passed === 3 ? "text-verdict-ac" : "text-verdict-wa"}`}>{passed === 3 ? "✓ Accepted" : "× Wrong Answer"}</p><span className="font-mono text-xs text-ink-300">{passed} / 3</span></div><p className="mt-2 text-xs leading-relaxed text-ink-300">{passed === 3 ? (zh ? "答對了！只剩一個候選值時，也需要檢查。把這次發現，帶進下一道題。" : "Accepted! The last remaining candidate still needs checking. Take that insight to your next problem.") : (zh ? "當 l 與 r 相等，還有一個數字沒檢查。試試把 < 換成 <=。" : "When l equals r, one candidate remains. Try changing < to <=.")}</p></> : <><p className="text-sm text-ink-200">{zh ? "從一個小小的邊界，找到解題的手感。" : "Small edge cases. Real progress."}</p><p className="mt-2 text-xs text-ink-400">{zh ? "不用註冊，先試一次。這是教學示範，不會建立提交紀錄。" : "Try it without signing up. This demo does not create a submission."}</p></>}
      </div>
    </div>
  </div>;
}

export default function LoggedOutHome({ total }: { total: number | null }) {
  const { locale } = useLocale(); const zh = locale === "zh-TW";
  const { user, status } = useAuthStore(); const [path, setPath] = useState(0);
  const paths = [
    { title: zh ? "從第一題開始" : "Build your foundation", tag: "01 / PRACTICE", body: zh ? "先練基本輸入輸出，再走向排序、搜尋與資料結構。每次提交的結果，都幫你找到下一個需要釐清的地方。" : "Start with input and output, then explore sorting, search and data structures. Learn from every submission.", href: "/problems", action: zh ? "探索題庫" : "Explore problems", notes: zh ? ["依難度與主題找題", "程式編輯與自訂測試", "保留自己的作答紀錄"] : ["Browse by difficulty and topic", "Editor and custom tests", "Review your submission history"] },
    { title: zh ? "為下一場考試準備" : "Practice under pressure", tag: "02 / SIMULATE", body: zh ? "挑一份 CPE／GPE 歷屆試題，進入自己的限時測驗。練習分配時間，也練習在卡住時做選擇。" : "Choose a past CPE or GPE exam and start your own timed attempt. Practice pacing and deciding when to move on.", href: "/contests", action: zh ? "選一場虛擬測驗" : "Find a virtual exam", notes: zh ? ["每人獨立的作答時段", "伺服器校準倒數計時", "題目、成績與罰時紀錄"] : ["Your own exam window", "Server-synchronized timer", "Results and penalty history"] },
    { title: zh ? "把解法練得更紮實" : "Go beyond accepted", tag: "03 / REFLECT", body: zh ? "用主題題目集整理觀念，回看做過的題目與作答紀錄。把一次答對，變成下次也能解出來的能力。" : "Explore curated collections and revisit your solutions. Turn a one-time success into a skill you can use again.", href: "/collections", action: zh ? "看看題目集" : "Browse collections", notes: zh ? ["主題式練習路徑", "個人學習與解題紀錄", "社群中的不同解題觀點"] : ["Curated practice paths", "Personal progress history", "Different perspectives from the community"] },
  ];
  if (status === "ready" && user) return null;
  const selected = paths[path];
  return <div className="mx-auto max-w-6xl space-y-20 pb-10 sm:space-y-28">
    <section className="grid items-center gap-10 pb-5 pt-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:pt-12">
      <div><p className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-brand"><span className="h-px w-8 bg-brand" aria-hidden /> YOUR NEXT ACCEPTED STARTS HERE</p>
        <h1 className="text-[2.65rem] font-semibold leading-[1.22] tracking-normal text-ink-50 sm:text-6xl">{zh ? <>把每一次練習，<br />寫成<span className="text-brand">你的實力。</span></> : <>Make every<br />practice<br /><span className="text-brand">count.</span></>}</h1>
        <p className="mt-6 max-w-md text-base leading-8 text-ink-300">{zh ? "從第一個 Accepted，到從容面對整場考試。題庫練習、限時模擬、解題紀錄，在 judge. 一步步累積。" : "From your first Accepted to your next exam. Practice problems, take timed exams and see how far you've come."}</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="oj-btn-primary min-h-12 rounded-xl px-6">{zh ? "開始免費練習" : "Start practicing free"}<span aria-hidden>↗</span></Link><Link href="/problems" className="oj-btn-secondary min-h-12 rounded-xl px-6">{zh ? "先逛逛題庫" : "Explore problems"}</Link></div>
        <p className="mt-4 text-xs text-ink-400">{zh ? "免費開始，不需要信用卡。依自己的步調進步。" : "No credit card needed. Learn at your own pace."}</p>
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ink-700 pt-6"><div><p className="font-mono text-xl font-semibold text-ink-100">{total === null ? "CPE / GPE" : total.toLocaleString()}</p><p className="mt-1 text-xs text-ink-400">{zh ? "歷屆與程式練習題" : "Past exams & problems"}</p></div><div><p className="font-mono text-xl font-semibold text-ink-100">4</p><p className="mt-1 text-xs text-ink-400">{zh ? "程式語言" : "Languages"}</p></div><div><p className="font-mono text-xl font-semibold text-ink-100">1 → AC</p><p className="mt-1 text-xs text-ink-400">{zh ? "從今天這一題開始" : "One problem at a time"}</p></div></div>
      </div>
      <FirstChallenge zh={zh} />
    </section>
    <section aria-labelledby="practice-path-heading"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-3 font-mono text-xs tracking-widest text-brand">A LITTLE BETTER, EVERY DAY</p><h2 id="practice-path-heading" className="text-3xl font-semibold tracking-normal text-ink-100">{zh ? "現在的你，想挑戰什麼？" : "What would you like to work on?"}</h2></div><p className="text-sm text-ink-400">{zh ? "沒有唯一的起點，只有適合你的下一步。" : "Find the next step that works for you."}</p></div>
      <div className="grid overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 md:grid-cols-[0.8fr_1.2fr]"><div className="flex flex-col border-b border-ink-700 md:border-b-0 md:border-r" role="tablist" aria-label={zh ? "練習方向" : "Practice paths"} aria-orientation="vertical">
        {paths.map((p, i) => <button key={p.tag} type="button" id={`path-tab-${i}`} role="tab" aria-selected={path === i} aria-controls="path-panel" tabIndex={path === i ? 0 : -1} onClick={() => setPath(i)} onKeyDown={(e) => { if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) { e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? 2 : (i + (e.key === "ArrowDown" ? 1 : 2)) % 3; setPath(next); document.getElementById(`path-tab-${next}`)?.focus(); } }} className={`border-l-2 p-6 text-left transition-colors ${path === i ? "border-brand bg-brand/5" : "border-transparent hover:bg-ink-800"}`}><span className={`font-mono text-[10px] tracking-widest ${path === i ? "text-brand" : "text-ink-400"}`}>{p.tag}</span><span className="mt-2 flex items-center justify-between text-lg font-medium text-ink-100">{p.title}<span aria-hidden className={path === i ? "text-brand" : "text-ink-500"}>↗</span></span></button>)}
      </div><div id="path-panel" role="tabpanel" aria-labelledby={`path-tab-${path}`} tabIndex={0} className="flex flex-col justify-center p-7 sm:p-10"><p className="text-base leading-8 text-ink-200">{selected.body}</p><ul className="my-6 space-y-3">{selected.notes.map((n) => <li key={n} className="flex gap-3 text-sm text-ink-300"><span aria-hidden className="text-brand">✓</span>{n}</li>)}</ul><Link href={selected.href} className="inline-flex min-h-11 items-center gap-3 font-medium text-brand hover:underline">{selected.action}<span aria-hidden>→</span></Link></div></div>
    </section>
    <section className="relative overflow-hidden rounded-2xl border border-brand/30 bg-brand/[0.04] px-6 py-12 text-center sm:py-16"><p className="font-mono text-xs tracking-widest text-brand">ONE MORE TRY.</p><h2 className="mt-4 text-3xl font-semibold tracking-normal text-ink-100 sm:text-4xl">{zh ? "下一個 Accepted，從這裡開始。" : "Your next Accepted is waiting."}</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-ink-300">{zh ? "今天不用解完所有題目。先選一題，寫下你的想法，再往前走一步。" : "You don't have to solve everything today. Pick one problem, try an idea and take the next step."}</p><Link href="/problems" className="oj-btn-primary mt-7 min-h-12 rounded-xl px-7">{zh ? "找到我的第一題 →" : "Find my first problem →"}</Link><div className="mt-5 flex justify-center gap-6 text-xs text-ink-400"><Link href="/faq" className="hover:text-brand">{zh ? "有問題？看看 FAQ" : "Questions? Read the FAQ"}</Link><Link href="/upgrade" className="hover:text-brand">{zh ? "了解 Free 與 Pro" : "Compare Free & Pro"}</Link></div></section>
  </div>;
}
