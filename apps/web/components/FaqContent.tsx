"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { FAQ_SECTIONS, SUPPORT_EMAIL } from "@/lib/faq";

export default function FaqContent() {
  const { locale } = useLocale(); const zh = locale === "zh-TW";
  const [search, setSearch] = useState(""), [category, setCategory] = useState("all");
  const sections = FAQ_SECTIONS.filter((s) => category === "all" || s.id === category).map((s) => ({ ...s,
    items: s.items.filter((i) => `${i.question[locale]} ${i.answer[locale]}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())) })).filter((s) => s.items.length);
  const count = sections.reduce((sum, s) => sum + s.items.length, 0);
  return <div className="mx-auto max-w-5xl py-6 sm:py-10">
    <header className="mb-10 max-w-2xl"><p className="mb-3 font-mono text-xs tracking-widest text-brand">HERE TO HELP</p><h1 className="text-4xl font-semibold tracking-normal text-ink-100">{zh ? "把問題釐清，繼續往前。" : "Find an answer. Keep going."}</h1><p className="mt-4 leading-7 text-ink-300">{zh ? "從第一筆提交到訂閱管理，你想知道的事都在這裡。" : "From your first submission to managing a subscription, find the details here."}</p>
      <label htmlFor="faq-search" className="mt-6 block text-sm font-medium text-ink-200">{zh ? "搜尋常見問題" : "Search frequently asked questions"}</label><input id="faq-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={zh ? "例如：退款、測驗、WA、驗證信" : "Try: refund, exam, WA, verification"} className="oj-input mt-2 min-h-12 w-full rounded-xl px-4" />
    </header>
    <div className="grid gap-8 md:grid-cols-[200px_1fr]"><aside><nav className="flex flex-wrap gap-2 md:sticky md:top-24 md:flex-col" aria-label={zh ? "常見問題分類" : "FAQ categories"}>{[{ id: "all", title: { "zh-TW": "所有問題", en: "All questions" } }, ...FAQ_SECTIONS].map((s) => <button type="button" key={s.id} aria-pressed={category === s.id} onClick={() => setCategory(s.id)} className={`min-h-11 rounded-lg px-4 py-3 text-left text-sm ${category === s.id ? "bg-brand/10 font-semibold text-brand" : "text-ink-300 hover:bg-ink-800"}`}>{s.title[locale]}</button>)}</nav></aside>
      <div><p role="status" className="mb-4 text-xs text-ink-400">{zh ? `${count} 個相關問題` : `${count} matching questions`}</p>{sections.map((section) => <section key={section.id} aria-labelledby={`faq-${section.id}`} className="mb-9"><h2 id={`faq-${section.id}`} className="mb-4 text-xl font-semibold text-ink-100">{section.title[locale]}</h2><div className="divide-y divide-ink-700 overflow-hidden rounded-xl border border-ink-700 bg-ink-900">{section.items.map((i) => <details key={i.id} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-sm font-medium leading-relaxed text-ink-100 [&::-webkit-details-marker]:hidden"><span>{i.question[locale]}</span><span aria-hidden className="text-lg text-brand transition-transform group-open:rotate-45">+</span></summary><p className="px-5 pb-6 text-sm leading-8 text-ink-300">{i.answer[locale]}</p></details>)}</div></section>)}
      {count === 0 && <div className="oj-card p-8 text-center"><p className="text-ink-200">{zh ? "沒有找到相關問題，換個關鍵字試試。" : "No matching questions. Try another keyword."}</p><button type="button" onClick={() => { setSearch(""); setCategory("all"); }} className="oj-btn-secondary mt-4">{zh ? "清除篩選" : "Clear filters"}</button></div>}
      <div className="rounded-xl border border-brand/20 bg-brand/5 p-6"><h2 className="font-semibold text-ink-100">{zh ? "還沒有找到答案？" : "Still need a hand?"}</h2><p className="mt-2 text-sm leading-7 text-ink-300">{zh ? "來信時附上問題頁面與相關提交／訂單編號，能幫助我們更快釐清。" : "Include the page link and relevant submission or order ID to help us investigate."}</p><a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-block break-all text-sm text-brand hover:underline">{SUPPORT_EMAIL} ↗</a><div className="mt-4 flex gap-5 text-xs text-ink-300"><Link href="/refund" className="hover:text-brand">{zh ? "退款與訂閱政策" : "Refund policy"}</Link><Link href="/privacy" className="hover:text-brand">{zh ? "隱私權政策" : "Privacy policy"}</Link></div></div>
      </div>
    </div>
  </div>;
}
