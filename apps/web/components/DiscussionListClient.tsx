"use client";
import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SkeletonList } from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import { estimateReadMinutesFromLength } from "@/lib/readTime";
import type { PostListItem } from "@/lib/types";
import { categories, type CommunityPage, type PostCategory } from "@/lib/community";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";

export default function DiscussionListClient({ initialPage }: { initialPage: CommunityPage<PostListItem> | null }) {
  const { locale } = useLocale(), zh = locale === "zh-TW", user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState<PostCategory | "">(""), [input, setInput] = useState(""), [search, setSearch] = useState("");
  const query = useInfiniteQuery({ queryKey: ["posts", "list", category, search], initialPageParam: "",
    queryFn: ({ pageParam }) => { const p = new URLSearchParams(); if (category) p.set("category", category); if (search) p.set("q", search); if (pageParam) p.set("cursor", pageParam); return apiFetch<CommunityPage<PostListItem>>(`/posts?${p}`); },
    getNextPageParam: (p) => p.nextCursor ?? undefined,
    initialData: !category && !search && initialPage ? { pages: [initialPage], pageParams: [""] } : undefined });
  const posts = query.data?.pages.flatMap((p) => p.items) ?? [];
  return <div className="mx-auto max-w-6xl space-y-8">
    <header className="relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 p-6 sm:p-9">
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <p className="relative font-mono text-xs font-semibold tracking-widest text-brand">JUDGE. COMMUNITY</p>
      <h1 className="relative mt-3 font-display text-3xl font-bold text-ink-50 sm:text-4xl">{zh ? "好思路，值得一起討論。" : "Good ideas grow through discussion."}</h1>
      <p className="relative mt-3 max-w-2xl text-sm leading-7 text-ink-300">{zh ? "分享解題的突破、提出卡住的問題，或寫下你的練習心得。每一篇投稿與留言，都經過審核後公開。" : "Share a breakthrough, ask about a tricky problem, or reflect on your practice. Every post and comment is reviewed before publication."}</p>
      <div className="relative mt-6 flex flex-wrap items-center gap-3"><Link href={user ? "/discussion/write" : "/login?next=/discussion/write"} className="oj-btn-primary min-h-11">{zh ? "＋ 發起討論" : "+ Start a discussion"}</Link>{user && <Link href="/discussion/mine" className="oj-btn-secondary min-h-11">{zh ? "我的投稿" : "My posts"}</Link>}</div>
    </header>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
      <section className="min-w-0" aria-label={zh ? "社群文章" : "Community posts"}>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(input.trim()); }} className="mb-5 flex gap-2"><label htmlFor="community-search" className="sr-only">{zh ? "搜尋討論" : "Search discussions"}</label><input id="community-search" className="oj-input min-w-0 flex-1" type="search" maxLength={100} value={input} onChange={(e) => setInput(e.target.value)} placeholder={zh ? "搜尋題目、觀念或關鍵字" : "Search titles, concepts or keywords"} /><button className="oj-btn-secondary" type="submit">{zh ? "搜尋" : "Search"}</button></form>
        <div className="mb-5 flex flex-wrap gap-2" aria-label={zh ? "文章分類" : "Post categories"}>
          {(["", ...Object.keys(categories)] as (PostCategory | "")[]).map((c) => <button type="button" key={c} aria-pressed={category === c} onClick={() => setCategory(c)} className={`min-h-10 rounded-full border px-4 text-sm transition-colors ${category === c ? "border-brand/50 bg-brand/10 font-semibold text-brand" : "border-ink-700 text-ink-300 hover:border-ink-500"}`}>{c ? categories[c][zh ? 0 : 1] : zh ? "全部" : "All"}</button>)}
        </div>
        {query.isPending && <SkeletonList rows={4} />}
        {query.isError && <div role="alert" className="oj-card p-6"><p>{zh ? "暫時無法載入討論。" : "Could not load discussions."}</p><button className="oj-btn-secondary mt-3" onClick={() => query.refetch()}>{zh ? "重新載入" : "Retry"}</button></div>}
        {!query.isPending && !query.isError && posts.length === 0 && <div className="oj-card py-14 text-center"><p className="font-semibold text-ink-100">{search || category ? (zh ? "還沒有符合的討論" : "No matching discussions") : (zh ? "第一個好問題，從你開始" : "Start with a good question")}</p><p className="mt-2 text-sm text-ink-400">{zh ? "試試其他關鍵字，或分享你的想法。" : "Try another search or share your thoughts."}</p></div>}
        <ul className="divide-y divide-ink-700 rounded-xl border border-ink-700 bg-ink-900">
          {posts.map((p) => <li key={p.id} className="p-5 sm:p-6"><div className="mb-3 flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-ink-800 px-2 py-1 text-ink-300">{categories[p.category]?.[zh ? 0 : 1] ?? p.category}</span>{p.isOfficial && <span className="font-semibold text-brand">{zh ? "官方" : "Official"}</span>}</div><Link href={`/discussion/${p.id}`} className="group block"><h2 className="break-words font-display text-xl font-semibold leading-snug text-ink-100 group-hover:text-brand">{p.title}</h2><p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-ink-400">{p.excerpt}</p></Link><div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-400"><Link href={`/u/${p.authorHandle}`} className="inline-flex items-center gap-2 text-ink-300 hover:text-brand"><Avatar avatarUrl={p.authorAvatarUrl} handle={p.authorHandle} size={20} />{p.authorHandle}</Link><time dateTime={p.publishedAt ?? p.createdAt}>{new Date(p.publishedAt ?? p.createdAt).toLocaleDateString(locale)}</time><span>{estimateReadMinutesFromLength(p.bodyLength)} {zh ? "分鐘閱讀" : "min read"}</span><span className="sm:ml-auto">{p.commentCount} {zh ? "則留言" : "comments"}</span></div></li>)}
        </ul>
        {query.hasNextPage && <button className="oj-btn-secondary mt-5 w-full" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{zh ? "載入更多討論" : "Load more discussions"}</button>}
      </section>
      <aside className="space-y-4"><div className="oj-card p-5"><h2 className="font-semibold text-ink-100">{zh ? "一起打造有幫助的社群" : "Make this a helpful space"}</h2><ul className="mt-4 space-y-4 text-sm leading-6 text-ink-400"><li>{zh ? "說明你試過的方法，讓大家更容易理解問題。" : "Explain what you tried so others can understand the problem."}</li><li>{zh ? "程式碼請使用 Markdown 程式碼區塊，並標明語言。" : "Use Markdown code blocks and name the language."}</li><li>{zh ? "尊重不同的解法，請勿張貼個資、廣告或進行中的測驗答案。" : "Respect other approaches. Keep personal data, spam and active exam answers out."}</li></ul></div><Link href="/faq" className="block rounded-xl border border-ink-700 p-5 text-sm text-brand">{zh ? "使用平台遇到問題？查看常見問題 →" : "Need platform help? Read the FAQ →"}</Link></aside>
    </div>
  </div>;
}
