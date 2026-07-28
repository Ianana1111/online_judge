"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import StatementRenderer from "@/components/StatementRenderer";
import { Skeleton } from "@/components/Skeleton";
import type { PostDetail } from "@/lib/types";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => apiFetch<PostDetail>(`/posts/${id}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <p className="text-sm text-verdict-wa">Post not found.</p>;

  return (
    <div className="space-y-4">
      <Link href="/discussion" className="text-xs text-ink-500 hover:text-brand">
        ← back to Discussion
      </Link>

      <div>
        <div className="mb-2 flex items-center gap-2">
          {data.isOfficial && (
            <span className="rounded border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              官方
            </span>
          )}
          <span className="text-xs text-ink-500">{data.authorHandle}</span>
          <span className="text-xs text-ink-600">·</span>
          <span className="font-mono text-xs text-ink-500">{new Date(data.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{data.title}</h1>
      </div>

      <div className="oj-card p-5">
        <StatementRenderer content={data.bodyMd} />
      </div>
    </div>
  );
}
