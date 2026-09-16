"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CollectionListItem } from "@/lib/types";
import { SkeletonCard } from "@/components/Skeleton";
import { useLocale } from "@/lib/i18n/LocaleContext";

const categoryName = (value: string) => value === "考試歷屆" ? "考試專區" : value === "演算法主題" ? "主題專區" : value || "其他";
const topicMarks: Record<string, string> = { math: "∑", array: "[ ]", string: "Aa", "sorting-searching": "↗", datastructure: "{ }", simulation: "↻", greedy: "✓", "recursion-backtracking": "↳", dp: "ƒ", graph: "◇", geometry: "△", adhoc: "?!" };

function CollectionCard({ item, index, zh }: { item: CollectionListItem; index: number; zh: boolean }) {
  const topic = item.slug.replace(/^algo-/, "");
  // Native navigation avoids the observed App Router stall after a filtered card remounts.
  // The link keeps browser history, keyboard activation and opening in a new tab intact.
  return <a href={`/collections/${item.slug}`} className="group flex h-full min-w-0 flex-col rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-brand/60 hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
    <div className="mb-5 flex items-center justify-between"><span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-700 bg-ink-800 font-mono text-xl text-brand">{topicMarks[topic] ?? "≡"}</span><span aria-hidden className="font-mono text-xs text-ink-400">{String(index + 1).padStart(2, "0")}</span></div>
    <h3 className="font-display text-lg font-semibold text-ink-50 [overflow-wrap:anywhere]">{item.title}</h3>
    <p className="mt-2 flex-1 text-sm leading-6 text-ink-300">{item.description}</p>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-ink-700 pt-4 text-xs text-ink-300"><span><strong className="font-mono text-base font-medium text-ink-100">{item.problemCount}</strong> {zh ? "道題目" : "problems"}</span><span className="text-brand">{zh ? "開始練習" : "Explore"} <span aria-hidden>↗</span></span></div>
  </a>;
}

export default function CollectionsListClient() {
  const { locale } = useLocale(), zh = locale === "zh-TW";
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["collections"], queryFn: () => apiFetch<CollectionListItem[]>("/collections") });
  const collections = query.data ?? [];
  const feature = collections.find((c) => c.slug === "cpe-before-exam");
  const exams = collections.filter((c) => categoryName(c.category) === "考試專區" && c !== feature);
  const topics = collections.filter((c) => categoryName(c.category) === "主題專區");
  const other = collections.filter((c) => !["考試專區", "主題專區"].includes(categoryName(c.category)));
  const needle = search.trim().toLocaleLowerCase();
  const visibleTopics = topics.filter((c) => [c.title, c.description, c.slug, ...(c.tags ?? [])].join(" ").toLocaleLowerCase().includes(needle));

  return <div className="mx-auto max-w-6xl space-y-12 pb-6 sm:space-y-16">
    <header className="relative grid gap-8 border-b border-ink-700 pb-10 pt-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div><p className="font-mono text-xs font-semibold tracking-[0.18em] text-brand">THE PRACTICE LIBRARY</p><h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink-50 sm:text-4xl">{zh ? "每一次練習，都有方向。" : "Give every practice a purpose."}</h1><p className="mt-4 max-w-xl text-sm leading-7 text-ink-300">{zh ? "為下一場考試準備，也為下一次突破累積。從歷屆經典到演算法主題，找到適合現在的你的題目集。" : "Prepare for your next exam or your next breakthrough. Find a collection of past exam problems or focus on one algorithm at a time."}</p></div>
      <nav aria-label={zh ? "題目集專區" : "Collection sections"} className="flex flex-wrap gap-3"><a href="#exam-collections" className="oj-btn-primary min-h-11">{zh ? "考試專區" : "Exam practice"} <span aria-hidden>↓</span></a><a href="#topic-collections" className="oj-btn-secondary min-h-11">{zh ? "主題專區" : "By topic"} <span aria-hidden>↓</span></a></nav>
    </header>

    {query.isPending && <div role="status" aria-label={zh ? "載入題目集" : "Loading collections"} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}
    {query.isError && <div role="alert" className="oj-card p-8 text-center"><p className="text-ink-200">{zh ? "暫時無法載入題目集，請再試一次。" : "Could not load collections. Please try again."}</p><button className="oj-btn-secondary mt-4" onClick={() => query.refetch()}>{zh ? "重新載入" : "Retry"}</button></div>}
    {query.isSuccess && collections.length === 0 && <p className="oj-card p-10 text-center text-ink-300">{zh ? "題目集整理中，先到題庫挑戰一道題吧。" : "Collections are being prepared. Explore the problem library in the meantime."}<Link href="/problems" className="mt-4 block text-brand">{zh ? "前往題庫 →" : "Browse problems →"}</Link></p>}

    {query.isSuccess && (feature || exams.length > 0) && <section id="exam-collections" className="scroll-mt-24" aria-labelledby="exam-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-xs text-ink-400">01 / EXAM PREP</p><h2 id="exam-title" className="mt-2 font-display text-2xl font-bold text-ink-50">{zh ? "考試專區" : "Exam practice"}</h2></div><p className="text-sm text-ink-300">{zh ? "從熟悉題型，到穩定得分。" : "Build familiarity. Find your rhythm."}</p></div>
      {feature && <a href={`/collections/${feature.slug}`} className="group relative mb-5 grid overflow-hidden rounded-2xl border border-brand/40 bg-brand/5 p-6 transition-colors hover:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:p-8 md:grid-cols-[minmax(0,1fr)_200px] md:gap-10">
        <div className="relative"><span className="inline-flex rounded-full border border-brand/40 px-3 py-1 text-xs font-semibold text-brand">{zh ? "CPE 歷屆前 3 題" : "CPE · first three problems"}</span><h3 className="mt-5 font-display text-3xl font-bold text-ink-50 sm:text-4xl">{feature.title}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-ink-300">{feature.description}</p><span className="mt-6 inline-flex min-h-11 items-center gap-3 font-semibold text-brand">{zh ? "開始我的考前練習" : "Start exam preparation"}<span aria-hidden>→</span></span></div>
        <div className="relative mt-6 flex items-center gap-4 border-t border-brand/20 pt-5 md:mt-0 md:flex-col md:justify-center md:border-l md:border-t-0 md:pt-0"><div className="font-mono text-5xl font-medium tracking-tight text-ink-50 sm:text-6xl">{feature.problemCount}</div><div className="text-sm leading-6 text-ink-300">{zh ? "道歷屆題目" : "past exam problems"}<br /><span className="text-xs">{zh ? "去除重複・保留原始星等" : "Deduplicated · original ratings"}</span></div></div>
      </a>}
      <div className="grid gap-5 sm:grid-cols-2">{exams.map((item, i) => <CollectionCard key={item.id} item={item} index={i} zh={zh} />)}</div>
    </section>}

    {query.isSuccess && topics.length > 0 && <section id="topic-collections" className="scroll-mt-24" aria-labelledby="topic-title">
      <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-xs text-ink-400">02 / BUILD YOUR SKILLS</p><h2 id="topic-title" className="mt-2 font-display text-2xl font-bold text-ink-50">{zh ? "主題專區" : "Practice by topic"}</h2><p className="mt-2 text-sm text-ink-300">{zh ? "一次專注一個觀念，把理解練成直覺。" : "Focus on one concept. Turn understanding into intuition."}</p></div><div className="w-full sm:w-72"><label htmlFor="collection-search" className="sr-only">{zh ? "搜尋主題題庫" : "Search topic collections"}</label><input id="collection-search" type="search" maxLength={100} className="oj-input min-h-11" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={zh ? "搜尋主題，例如 DP、圖論…" : "Search topics, e.g. DP, graph…"} /></div></div>
      <p role="status" className="mb-4 text-xs text-ink-400">{zh ? `${visibleTopics.length} 個主題題庫` : `${visibleTopics.length} topic collections`}</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleTopics.map((item, i) => <CollectionCard key={item.id} item={item} index={i} zh={zh} />)}</div>
      {visibleTopics.length === 0 && <div className="rounded-2xl border border-dashed border-ink-700 p-10 text-center"><p className="text-ink-300">{zh ? "沒有符合的主題，試試其他關鍵字。" : "No matching topics. Try another keyword."}</p><button className="oj-btn-secondary mt-4" onClick={() => setSearch("")}>{zh ? "顯示所有主題" : "Show all topics"}</button></div>}
    </section>}
    {query.isSuccess && other.length > 0 && <section aria-labelledby="other-title"><h2 id="other-title" className="mb-6 text-2xl font-bold text-ink-50">{zh ? "更多題目集" : "More collections"}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{other.map((item, i) => <CollectionCard key={item.id} item={item} index={i} zh={zh} />)}</div></section>}
  </div>;
}
