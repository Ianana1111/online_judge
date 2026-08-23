"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SkeletonList } from "@/components/Skeleton";
import QueryBoundary from "@/components/QueryBoundary";
import Avatar from "@/components/Avatar";
import { estimateReadMinutesFromLength } from "@/lib/readTime";
import type { PostListItem } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

function Byline({ post, size = 20 }: { post: PostListItem; size?: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-500">
      <Avatar avatarUrl={post.authorAvatarUrl} handle={post.authorHandle} size={size} />
      <span className="text-ink-300">{post.authorHandle}</span>
      <span className="text-ink-700">·</span>
      <span className="font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
      <span className="text-ink-700">·</span>
      <span>{estimateReadMinutesFromLength(post.bodyLength)} 分鐘閱讀</span>
    </div>
  );
}

function OfficialBadge({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 font-semibold uppercase tracking-wide text-brand ${
        large ? "px-2 py-1 text-xs" : "px-1.5 py-0.5 text-[10px]"
      }`}
    >
      官方公告
    </span>
  );
}

export default function DiscussionListClient() {
  const t = useT();
  const query = useQuery({
    queryKey: ["posts"],
    queryFn: () => apiFetch<PostListItem[]>("/posts"),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{t("Discussion")}</h1>
        <p className="mt-1 text-sm text-ink-400">{t("News, analysis, and announcements from the judge.tw team.")}</p>
      </div>

      <QueryBoundary
        query={query}
        loading={<SkeletonList rows={4} />}
        isEmpty={(posts) => posts.length === 0}
        empty={<p className="oj-card p-6 text-center text-sm text-ink-400">{t("Nothing posted yet.")}</p>}
      >
        {(posts) => {
          const [hero, ...rest] = posts;
          return (
            <>
              <Link href={`/discussion/${hero.id}`} className="group block">
                <div className="oj-card relative overflow-hidden p-6 sm:p-8">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{ background: "radial-gradient(circle at 15% 15%, rgb(var(--brand)) 0%, transparent 60%)" }}
                  />
                  <div className="relative">
                    {hero.isOfficial && <OfficialBadge large />}
                    <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink-50 transition-colors group-hover:text-brand sm:text-3xl">
                      {hero.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm text-ink-300 sm:text-base">{hero.excerpt}</p>
                    <div className="mt-5">
                      <Byline post={hero} size={24} />
                    </div>
                  </div>
                </div>
              </Link>

              <div>
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-500">{t("More stories")}</h2>
                {rest.length === 0 ? (
                  <p className="border-t border-ink-800 py-6 text-sm text-ink-500">
                    {t("More analysis and announcements land here as they're published — check back soon.")}
                  </p>
                ) : (
                  <div className="divide-y divide-ink-800 border-t border-ink-800">
                    {rest.map((p) => (
                      <Link key={p.id} href={`/discussion/${p.id}`} className="group block py-6">
                        {p.isOfficial && (
                          <div className="mb-1.5">
                            <OfficialBadge />
                          </div>
                        )}
                        <h3 className="font-display text-xl font-semibold text-ink-50 transition-colors group-hover:text-brand">
                          {p.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-ink-400">{p.excerpt}</p>
                        <div className="mt-3">
                          <Byline post={p} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          );
        }}
      </QueryBoundary>
    </div>
  );
}
