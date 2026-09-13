"use client";
import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { categories, reviewLabels, type CommunityPage, type ReviewItem } from "@/lib/community";
import CommunityMarkdown from "./CommunityMarkdown";
export default function ModerationQueue() {
  const { locale } = useLocale(), zh = locale === "zh-TW", user = useAuthStore((s) => s.user);
  const [state, setState] = useState<"pending" | "reviewed">("pending");
  const query = useInfiniteQuery({ queryKey: ["moderation", user?.id, state], enabled: user?.role === "ADMIN", initialPageParam: "",
    queryFn: ({ pageParam }) => apiFetch<CommunityPage<ReviewItem>>(`/moderation?state=${state}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`), getNextPageParam: (p) => p.nextCursor ?? undefined });
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  return <section className="max-w-4xl space-y-6"><header><h1 className="text-2xl font-bold text-ink-100">{zh ? "內容審核" : "Content review"}</h1><p className="mt-2 text-sm leading-6 text-ink-400">{zh ? "核准你在此看到的版本。作者送出新版本後，舊版本將無法再核准。退回時請寫下具體建議，系統會通知作者。" : "Approve the exact version shown here. Replaced revisions cannot be approved. Give specific feedback when requesting changes; the author will be notified."}</p></header><div className="flex gap-2">{(["pending", "reviewed"] as const).map((s) => <button className={`min-h-10 rounded-lg px-4 text-sm ${state === s ? "bg-brand/10 text-brand" : "text-ink-300"}`} key={s} aria-pressed={state === s} onClick={() => setState(s)}>{s === "pending" ? (zh ? "待審核" : "Pending") : (zh ? "審核紀錄" : "Review history")}</button>)}<button className="oj-btn-ghost ml-auto" onClick={() => query.refetch()}>{zh ? "重新整理" : "Refresh"}</button></div>
    {query.isPending && <p role="status">{zh ? "載入審核清單…" : "Loading review queue…"}</p>}
    {query.isError && <p role="alert" className="text-sm text-verdict-wa">{zh ? "無法載入審核清單，請重新整理。" : "Could not load the queue. Please refresh."}</p>}
    {!query.isPending && !query.isError && !items.length && <p className="oj-card p-10 text-center text-ink-300">{state === "pending" ? (zh ? "目前沒有等待審核的內容。" : "No content is waiting for review.") : (zh ? "還沒有審核紀錄。" : "No review history yet.")}</p>}
    {items.map((item) => <ReviewCard key={item.id} item={item} />)}
    {query.hasNextPage && <button className="oj-btn-ghost w-full" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{zh ? "載入更多" : "Load more"}</button>}
  </section>;
}
function ReviewCard({ item }: { item: ReviewItem }) {
  const { locale } = useLocale(), zh = locale === "zh-TW", qc = useQueryClient();
  const [reason, setReason] = useState(""), [error, setError] = useState("");
  const mutation = useMutation({ mutationFn: (decision: "APPROVED" | "REJECTED") => apiFetch(`/moderation/${item.id}/review`, { method: "POST", body: { decision, ...(reason.trim() ? { reason: reason.trim() } : {}) } }),
    onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ["moderation"] }), qc.invalidateQueries({ queryKey: ["posts"] }), qc.invalidateQueries({ queryKey: ["discussions"] })]); } });
  const author = item.post?.author.handle ?? item.discussion?.user.handle, previous = item.post?.bodyMd ?? item.discussion?.body;
  const pending = item.status === "PENDING";
  function decide(decision: "APPROVED" | "REJECTED") {
    if (decision === "REJECTED" && !reason.trim()) { setError(zh ? "請先填寫需要修改的原因。" : "Please describe the changes needed."); return; }
    setError(""); mutation.mutate(decision);
  }
  return <article className="oj-card min-w-0 overflow-hidden"><div className="space-y-4 p-5 sm:p-6"><div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-ink-400"><span className="font-semibold text-brand">{item.postId ? (zh ? "文章" : "Post") : (zh ? "留言" : "Comment")}</span><span className="break-all">{author}</span><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString(locale)}</time>{item.isOfficial && <span className="text-brand">{zh ? "官方內容" : "Official"}</span>}{item.category && <span>{categories[item.category][zh ? 0 : 1]}</span>}</div>{item.title && <h2 className="break-words text-xl font-semibold text-ink-100">{item.title}</h2>}{item.discussion?.problem && <p className="text-xs text-ink-400">{zh ? "題目：" : "Problem: "}{item.discussion.problem.title}</p>}
      <div tabIndex={0} className="max-h-[32rem] overflow-y-auto rounded-lg border border-ink-700 p-4"><CommunityMarkdown content={item.body} /></div>
      <details className="text-sm"><summary className="cursor-pointer py-2 text-ink-300">{zh ? "檢視 Markdown 原文" : "View Markdown source"}</summary><pre tabIndex={0} className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-ink-800 p-4 text-xs text-ink-300">{item.body}</pre></details>
      {previous && pending && <details className="text-sm"><summary className="cursor-pointer py-2 text-ink-300">{zh ? "對照目前公開的內容" : "Compare currently published content"}</summary><div tabIndex={0} className="mt-2 max-h-72 overflow-auto rounded-md border border-ink-700 p-4"><CommunityMarkdown content={previous} /></div></details>}
      {pending ? <><label htmlFor={`review-reason-${item.id}`} className="block text-sm font-medium text-ink-200">{zh ? "審核建議（退回時必填）" : "Feedback (required when requesting changes)"}</label><textarea id={`review-reason-${item.id}`} className="oj-input min-h-24 w-full text-sm" value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} maxLength={1000} /><div className="flex flex-wrap justify-end gap-3"><button className="oj-btn-ghost" disabled={mutation.isPending} onClick={() => decide("REJECTED")}>{zh ? "退回修改" : "Request changes"}</button><button className="oj-btn-primary" disabled={mutation.isPending} onClick={() => decide("APPROVED")}>{mutation.isPending ? (zh ? "處理中…" : "Working…") : (zh ? "核准並公開此版本" : "Approve and publish this version")}</button></div></> : <div className="rounded-lg bg-ink-800 p-4 text-sm text-ink-300"><p className="font-semibold text-brand">{reviewLabels[item.status][zh ? 0 : 1]}</p>{item.reason && <p className="mt-2 whitespace-pre-wrap">{item.reason}</p>}{item.reviewedAt && <time className="mt-2 block text-xs text-ink-400" dateTime={item.reviewedAt}>{new Date(item.reviewedAt).toLocaleString(locale)}</time>}</div>}
      {(error || mutation.isError) && <p role="alert" className="text-sm text-verdict-wa">{error || (mutation.error instanceof Error ? mutation.error.message : (zh ? "審核失敗，請重新整理後再試。" : "Review failed. Refresh and retry."))}</p>}
    </div></article>;
}
