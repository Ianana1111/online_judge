"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Discussion } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { reviewLabels, type CommunityPage } from "@/lib/community";
import CommunityMarkdown from "./CommunityMarkdown";

type Props = { problemId: string; postId?: never } | { postId: string; problemId?: never };
export default function DiscussionPanel(props: Props) {
  const user = useAuthStore((s) => s.user);
  return <Comments key={`${user?.id ?? "anonymous"}:${props.problemId ?? props.postId}`} {...props} />;
}
function Comments(props: Props) {
  const { locale } = useLocale(), zh = locale === "zh-TW", user = useAuthStore((s) => s.user), qc = useQueryClient();
  const scope = props.postId ? "post" : "problem", parentId = props.postId ?? props.problemId, path = `/discussions/${scope}/${parentId}`;
  const [body, setBody] = useState(""), [error, setError] = useState(""), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false), [mine, setMine] = useState(false), [editing, setEditing] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const query = useInfiniteQuery({ queryKey: ["discussions", scope, parentId, mine ? user?.id : "public"], initialPageParam: "",
    queryFn: ({ pageParam }) => apiFetch<CommunityPage<Discussion>>(`${path}${mine ? "/mine" : ""}${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ""}`),
    getNextPageParam: (p) => p.nextCursor ?? undefined });
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!body.trim()) return; setBusy(true); setError(""); setNotice("");
    try {
      await apiFetch(editing ? `/discussions/${editing}` : path, { method: editing ? "PATCH" : "POST", body: { body } });
      setBody(""); setEditing(null); setMine(true); setNotice(zh ? "留言已送出審核。核准後才會公開，結果會透過通知告訴你。" : "Comment submitted for review. It will be public after approval; watch your notifications for the decision.");
      await qc.invalidateQueries({ queryKey: ["discussions", scope, parentId] });
    } catch (err) { setError(err instanceof Error ? err.message : (zh ? "送出失敗，請再試一次。" : "Could not submit. Please try again.")); } finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm(zh ? "確定刪除這則留言？" : "Delete this comment?")) return;
    setBusy(true); setError("");
    try { await apiFetch(`/discussions/${id}`, { method: "DELETE" }); await qc.invalidateQueries({ queryKey: ["discussions", scope, parentId] }); if (editing === id) { setEditing(null); setBody(""); } }
    catch (err) { setError(err instanceof Error ? err.message : (zh ? "無法刪除留言。" : "Could not delete comment.")); } finally { setBusy(false); }
  }
  return <section className="space-y-5" aria-label={zh ? "留言討論" : "Comments"}>
    <h2 className="font-display text-xl font-semibold text-ink-100">{zh ? "一起討論" : "Join the discussion"}</h2>
    {user ? <form onSubmit={submit} className="oj-card space-y-3 p-4"><label htmlFor={`comment-body-${parentId}`} className="block text-sm font-medium text-ink-200">{editing ? (zh ? "修改留言" : "Edit comment") : (zh ? "你的想法" : "Your thoughts")}</label><textarea ref={inputRef} id={`comment-body-${parentId}`} className="oj-input min-h-28 w-full text-sm leading-6" placeholder={zh ? "提出具體問題，或分享有幫助的提示…" : "Ask a specific question or share a helpful hint…"} value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} required /><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-ink-400">{zh ? "留言與修改都會先經過審核。" : "Comments and edits are reviewed before publication."}</p><div className="flex gap-2">{editing && <button type="button" className="oj-btn-ghost" onClick={() => { setEditing(null); setBody(""); }}>{zh ? "取消修改" : "Cancel edit"}</button>}<button type="submit" disabled={busy || !body.trim()} className="oj-btn-primary">{busy ? (zh ? "處理中…" : "Working…") : (zh ? "送出審核" : "Submit for review")}</button></div></div></form> : <p className="oj-card p-4 text-sm text-ink-300"><Link href="/login" className="text-brand">{zh ? "登入" : "Log in"}</Link>{zh ? "後即可加入討論。" : " to join the discussion."}</p>}
    {error && <p role="alert" className="text-sm text-verdict-wa">{error}</p>}{notice && <p role="status" className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-ink-200">{notice}</p>}
    {user && <div className="flex gap-2">{[false, true].map((own) => <button type="button" key={String(own)} aria-pressed={mine === own} className={`min-h-10 rounded-lg px-4 text-sm ${mine === own ? "bg-brand/10 font-semibold text-brand" : "text-ink-300"}`} onClick={() => setMine(own)}>{own ? (zh ? "我的留言與審核進度" : "My comments and reviews") : (zh ? "公開留言" : "Public comments")}</button>)}</div>}
    {query.isPending && <p role="status" className="text-sm text-ink-400">{zh ? "載入留言…" : "Loading comments…"}</p>}
    {query.isError && <div role="alert" className="text-sm text-ink-300"><p>{zh ? "暫時無法載入留言。" : "Could not load comments."}</p><button className="oj-btn-ghost mt-2" onClick={() => query.refetch()}>{zh ? "重試" : "Retry"}</button></div>}
    {!query.isPending && !query.isError && items.length === 0 && <p className="py-8 text-center text-sm text-ink-400">{mine ? (zh ? "還沒有你的留言。" : "You have no comments here yet.") : (zh ? "還沒有公開留言，歡迎分享你的想法。" : "No published comments yet. Share your thoughts.")}</p>}
    <ul className="space-y-4">{items.map((d) => <li key={d.id} className="oj-card min-w-0 p-4 sm:p-5"><div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-400"><Link href={`/u/${d.userHandle}`} className="break-all text-sm font-semibold text-ink-200 hover:text-brand">{d.userHandle}</Link>{d.userRole === "ADMIN" && <span className="text-brand">{zh ? "管理員" : "Admin"}</span>}<time dateTime={d.createdAt}>{new Date(d.createdAt).toLocaleDateString(locale)}</time>{mine && d.status && <span className="rounded bg-brand/10 px-2 py-1 text-ink-200">{reviewLabels[d.status][zh ? 0 : 1]}</span>}</div><CommunityMarkdown content={d.body} />{mine && d.reason && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-ink-800 p-3 text-sm text-ink-300">{zh ? "審核建議：" : "Review feedback: "}{d.reason}</p>}<div className="mt-3 flex justify-end gap-4 text-xs">{mine && user?.id === d.userId && <button className="min-h-8 text-brand" onClick={() => { setEditing(d.id); setBody(d.body); inputRef.current?.focus(); }}>{zh ? "修改並重新送審" : "Edit and resubmit"}</button>}{(user?.id === d.userId || user?.role === "ADMIN") && <button disabled={busy} onClick={() => remove(d.id)} className="min-h-8 text-ink-400 hover:text-verdict-wa">{zh ? "刪除" : "Delete"}</button>}</div></li>)}</ul>
    {query.hasNextPage && <button className="oj-btn-ghost w-full" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{zh ? "載入更多留言" : "Load more comments"}</button>}
  </section>;
}
