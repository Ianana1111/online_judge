"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import { estimateReadMinutes } from "@/lib/readTime";
import type { PostDetail } from "@/lib/types";
import { categories } from "@/lib/community";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";
import CommunityMarkdown from "./CommunityMarkdown";
import DiscussionPanel from "./DiscussionPanel";
import AdminDeletePostButton from "./AdminDeletePostButton";
export default function PostDetailClient({ id }: { id: string }) {
  const { locale } = useLocale(), zh = locale === "zh-TW", user = useAuthStore((s) => s.user);
  const query = useQuery({ queryKey: ["posts", "detail", id], queryFn: ({ signal }) => apiFetch<PostDetail>(`/posts/${id}`, { signal }) });
  if (query.isPending) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-72 w-full" /></div>;
  const data = query.data;
  if (!data) return <div role="alert" className="oj-card mx-auto max-w-3xl space-y-4 p-8"><p>{query.error instanceof ApiError && query.error.status === 404 ? (zh ? "找不到已公開的文章。若這是你的投稿，請到「我的投稿」查看審核進度。" : "No published post was found. If this is your post, check My posts for its review status.") : (zh ? "暫時無法載入文章。" : "Could not load the post.")}</p><div className="flex flex-wrap gap-3"><button className="oj-btn-ghost" onClick={() => query.refetch()}>{zh ? "重試" : "Retry"}</button><Link href="/discussion/mine" className="oj-btn-ghost">{zh ? "我的投稿" : "My posts"}</Link><Link href="/discussion" className="oj-btn-ghost">{zh ? "返回討論区" : "Back to discussions"}</Link></div></div>;
  return <article className="mx-auto max-w-3xl space-y-8"><Link href="/discussion" className="text-sm text-brand">{zh ? "← 返回討論區" : "← Back to discussions"}</Link><header><div className="flex flex-wrap gap-3 text-xs"><span className="rounded bg-ink-800 px-2 py-1 text-ink-300">{categories[data.category]?.[zh ? 0 : 1]}</span>{data.isOfficial && <span className="py-1 font-semibold text-brand">{zh ? "官方公告" : "Official"}</span>}</div><h1 className="mt-4 break-words font-display text-3xl font-bold leading-tight text-ink-100 sm:text-4xl">{data.title}</h1><div className="mt-6 flex flex-wrap items-center gap-3 border-b border-ink-700 pb-6 text-sm text-ink-400"><Avatar avatarUrl={data.authorAvatarUrl} handle={data.authorHandle} size={32} /><Link href={`/u/${data.authorHandle}`} className="font-medium text-ink-200 hover:text-brand">{data.authorHandle}</Link><time dateTime={data.publishedAt ?? data.createdAt}>{new Date(data.publishedAt ?? data.createdAt).toLocaleDateString(locale)}</time><span>{estimateReadMinutes(data.bodyMd)} {zh ? "分鐘閱讀" : "min read"}</span><div className="flex flex-wrap items-center gap-2 sm:ml-auto">{user?.id === data.authorId && <Link href={`/discussion/write?id=${id}`} className="inline-flex min-h-11 items-center px-3 text-brand">{zh ? "修改文章" : "Edit post"}</Link>}<AdminDeletePostButton id={id} title={data.title} author={data.authorHandle} returnToList /></div></div></header><CommunityMarkdown content={data.bodyMd} /><div className="border-t border-ink-700 pt-8"><DiscussionPanel postId={id} /></div></article>;
}
