"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { CollectionDetail } from "@/lib/types";
import ProblemFilterTable from "@/components/ProblemFilterTable";
import { useAuthStore } from "@/store/auth";
import { Skeleton, SkeletonList } from "@/components/Skeleton";
import { useLocale, useT } from "@/lib/i18n/LocaleContext";

export default function CollectionDetailClient({ slug }: { slug: string }) {
  const t = useT();
  const { locale } = useLocale(), zh = locale === "zh-TW";
  // See ProblemsBrowser: this response's cpeAppearances field depends on the requester's Pro
  // status, so `plan` must be part of the query key or a user who just upgraded keeps seeing the
  // FREE-tier snapshot cached from before their purchase.
  const user = useAuthStore((s) => s.user);
  const plan = user?.plan;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["collections", slug, user?.id, plan],
    queryFn: () => apiFetch<CollectionDetail>(`/collections/${slug}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-full max-w-96" />
        </div>
        <Skeleton className="h-16 w-full" />
        <SkeletonList rows={8} />
      </div>
    );
  }
  if (!data) return <div role="alert" className="oj-card p-8 text-center"><p className="text-ink-300">{error instanceof ApiError && error.status === 404 ? t("Collection not found.") : zh ? "暫時無法載入題目集。" : "Could not load this collection."}</p><div className="mt-4 flex flex-wrap justify-center gap-3"><Link href="/collections" className="oj-btn-secondary">{zh ? "返回題目集" : "Back to collections"}</Link><button className="oj-btn-primary" onClick={() => refetch()}>{zh ? "重新載入" : "Retry"}</button></div></div>;

  const total = data.problems.length;
  const solved = data.problems.filter((p) => p.solvedByMe).length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link href="/collections" className="inline-flex min-h-11 items-center text-sm text-brand">{zh ? "← 返回題目集" : "← Back to collections"}</Link>
      <header className="rounded-2xl border border-ink-700 bg-ink-900 p-6 sm:p-8">
        {data.category && <p className="mb-3 text-xs font-semibold tracking-wider text-brand">{data.category}</p>}
        <h1 className="font-display text-3xl font-bold text-ink-50 [overflow-wrap:anywhere]">{data.title}</h1>
        {data.description && <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-300">{data.description}</p>}
      </header>

      <div className="rounded-xl border border-ink-700 p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-ink-300">{t("Progress")}</span>
          <span className="font-mono text-ink-200">{t("{solved} / {total} solved", { solved, total })}</span>
        </div>
        {!user && <p className="mb-3 text-xs text-ink-300"><Link href="/login" className="text-brand underline underline-offset-4">{zh ? "登入" : "Log in"}</Link>{zh ? "後記錄你的解題進度。" : " to track your progress."}</p>}
        <div role="progressbar" aria-label={t("Progress")} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-ink-800">
          <div className="h-full rounded-full bg-verdict-ac transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ProblemFilterTable problems={data.problems} listContext={{ type: "collection", slug }} />
    </div>
  );
}
