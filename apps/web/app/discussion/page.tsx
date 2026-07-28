"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SkeletonList } from "@/components/Skeleton";
import type { PostListItem } from "@/lib/types";

export default function DiscussionPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => apiFetch<PostListItem[]>("/posts"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Discussion</h1>
        <p className="mt-1 text-sm text-ink-400">News, analysis, and announcements from the judge.tw team.</p>
      </div>

      {isLoading && <SkeletonList rows={4} />}

      {!isLoading && data?.length === 0 && <p className="oj-card p-6 text-center text-sm text-ink-400">Nothing posted yet.</p>}

      <div className="space-y-3">
        {data?.map((p) => (
          <Link key={p.id} href={`/discussion/${p.id}`} className="oj-card block p-4 transition-colors hover:border-brand">
            <div className="mb-1.5 flex items-center gap-2">
              {p.isOfficial && (
                <span className="rounded border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                  官方
                </span>
              )}
              <span className="text-xs text-ink-500">{p.authorHandle}</span>
              <span className="text-xs text-ink-600">·</span>
              <span className="font-mono text-xs text-ink-500">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className="font-medium text-ink-50 hover:text-brand">{p.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-ink-400">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
