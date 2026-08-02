"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import StatementRenderer from "@/components/StatementRenderer";
import { Skeleton } from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import { estimateReadMinutes } from "@/lib/readTime";
import type { PostDetail } from "@/lib/types";

export default function PostDetailClient({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => apiFetch<PostDetail>(`/posts/${id}`),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <p className="text-sm text-verdict-wa">Post not found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/discussion" className="text-xs text-ink-500 hover:text-brand">
        ← back to Discussion
      </Link>

      <div>
        {data.isOfficial && (
          <span className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
            官方公告
          </span>
        )}
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink-50 sm:text-4xl">{data.title}</h1>
        <div className="mt-5 flex items-center gap-2 border-b border-ink-800 pb-6 text-sm text-ink-400">
          <Avatar avatarUrl={data.authorAvatarUrl} handle={data.authorHandle} size={32} />
          <span className="font-medium text-ink-200">{data.authorHandle}</span>
          <span className="text-ink-700">·</span>
          <span className="font-mono">{new Date(data.createdAt).toLocaleDateString()}</span>
          <span className="text-ink-700">·</span>
          <span>{estimateReadMinutes(data.bodyMd)} 分鐘閱讀</span>
        </div>
      </div>

      <StatementRenderer content={data.bodyMd} />
    </div>
  );
}
