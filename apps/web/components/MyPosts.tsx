"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { reviewLabels, type CommunityPage, type OwnPost } from "@/lib/community";
export default function MyPosts() {
  const { locale } = useLocale(), zh = locale === "zh-TW", user = useAuthStore((s) => s.user), qc = useQueryClient(), params = useSearchParams();
  const query = useInfiniteQuery({ queryKey: ["posts", "mine", user?.id], enabled: !!user, initialPageParam: "",
    queryFn: ({ pageParam }) => apiFetch<CommunityPage<OwnPost>>(`/posts/mine${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ""}`), getNextPageParam: (p) => p.nextCursor ?? undefined });
  const remove = useMutation({ mutationFn: (id: string) => apiFetch(`/posts/${id}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }) });
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  return <section className="mx-auto max-w-3xl space-y-6"><Link href="/discussion" className="text-sm text-brand">{zh ? "← 返回討論區" : "← Back to discussions"}</Link><div className="flex items-center justify-between gap-4"><h1 className="text-3xl font-bold text-ink-100">{zh ? "我的投稿" : "My posts"}</h1><Link href="/discussion/write" className="oj-btn-primary">{zh ? "撰寫文章" : "Write a post"}</Link></div>
    {params.get("submitted") === "1" && <p role="status" className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-ink-200">{zh ? "投稿已收到。審核結果會出現在通知中心。" : "Your post was received. The review decision will appear in notifications."}</p>}
    {!user ? <Link href="/login" className="text-brand">{zh ? "登入後查看投稿" : "Log in to see your posts"}</Link> : query.isPending ? <p role="status">{zh ? "載入中…" : "Loading…"}</p> : query.isError ? <div role="alert"><p>{zh ? "無法取得投稿。" : "Could not load your posts."}</p><button className="oj-btn-ghost mt-2" onClick={() => query.refetch()}>{zh ? "重試" : "Retry"}</button></div> : items.length === 0 ? <p className="oj-card p-8 text-center text-ink-400">{zh ? "還沒有投稿。把你的第一個思路寫下來吧。" : "No posts yet. Write down your first idea."}</p> : <ul className="space-y-4">{items.map((p) => <li key={p.id} className="oj-card p-5"><p className="text-xs font-semibold text-brand">{reviewLabels[p.status][zh ? 0 : 1]}</p><h2 className="mt-2 break-words text-lg font-semibold text-ink-100">{p.title}</h2>{p.reason && <p className="mt-3 whitespace-pre-wrap rounded-md bg-ink-800 p-3 text-sm text-ink-300">{p.reason}</p>}<div className="mt-4 flex flex-wrap gap-4 text-sm"><Link href={`/discussion/write?id=${p.id}`} className="text-brand">{zh ? "查看與修改" : "View and edit"}</Link>{p.publishedAt && <Link href={`/discussion/${p.id}`} className="text-ink-300">{zh ? "查看公開版本" : "View published version"}</Link>}<button className="ml-auto text-ink-400 hover:text-verdict-wa" disabled={remove.isPending} onClick={() => { if (confirm(zh ? "確定刪除這篇投稿？公開內容也會一併下架。" : "Delete this post? Its published version will also be removed.")) remove.mutate(p.id); }}>{zh ? "刪除" : "Delete"}</button></div></li>)}</ul>}
    {remove.isError && <p role="alert" className="text-sm text-verdict-wa">{zh ? "刪除失敗，請再試一次。" : "Could not delete. Please try again."}</p>}
    {query.hasNextPage && <button className="oj-btn-ghost w-full" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{zh ? "載入更多" : "Load more"}</button>}
  </section>;
}
