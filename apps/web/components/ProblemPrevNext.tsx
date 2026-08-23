"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { buildProblemNavHref, filterAndSortProblems, SORT_KEYS, type SortKey } from "@/lib/problemFilter";
import { stripProblemNumber } from "@/lib/problemTitle";
import type { CollectionDetail, ProblemListResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

/**
 * Previous/Next across whatever filtered, sorted list of problems the user actually browsed here
 * from — see ProblemFilterTable's buildProblemHref, which is what puts listSource/listId/sort/
 * difficulty/tag on the link in the first place. Renders nothing when those aren't present: a
 * direct link, a Discussion/FAQ link, or a problem opened inside a running exam (ContestDetailClient
 * renders ProblemView straight from client state, never through this URL at all) has no "list" to
 * walk, so there's nothing to compute Previous/Next from — that's a feature, not a fallback to hide.
 */
export default function ProblemPrevNext({ slug }: { slug: string }) {
  const t = useT();
  const searchParams = useSearchParams();
  const plan = useAuthStore((s) => s.user?.plan);

  const listSource = searchParams.get("listSource");
  const listId = searchParams.get("listId");
  const sortParam = searchParams.get("sort");
  const sort: SortKey | null = sortParam && SORT_KEYS.includes(sortParam as SortKey) ? (sortParam as SortKey) : null;
  const difficulty = searchParams.get("difficulty") ?? "";
  const tag = searchParams.get("tag") ?? "";

  const enabled = listSource === "problems" || (listSource === "collection" && !!listId);

  // Same queryKey shapes ProblemsBrowser/CollectionDetailClient use, so navigating list → detail
  // (or detail → detail via Previous/Next) reuses whatever's already cached instead of refetching.
  const { data: allProblems } = useQuery({
    queryKey: ["problems", "all", plan],
    queryFn: () => apiFetch<ProblemListResponse>("/problems?pageSize=1000"),
    enabled: enabled && listSource === "problems",
  });
  const { data: collection } = useQuery({
    queryKey: ["collections", listId, plan],
    queryFn: () => apiFetch<CollectionDetail>(`/collections/${listId}`),
    enabled: enabled && listSource === "collection" && !!listId,
  });

  if (!enabled) return null;

  const pool = listSource === "problems" ? allProblems?.items : collection?.problems;
  if (!pool) return null; // still loading — say nothing rather than a layout-shifting skeleton

  const ordered = filterAndSortProblems(pool, { difficulty, tag, sort });
  const index = ordered.findIndex((p) => p.slug === slug);
  // The current problem fell out of the list it supposedly came from (a filter changed underneath
  // it, or it's genuinely not a member) — nothing sane to render Previous/Next against.
  if (index === -1) return null;

  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index < ordered.length - 1 ? ordered[index + 1] : null;
  const contextLabel = listSource === "collection" ? (collection?.title ?? t("collection")) : t("Problems");

  return (
    <div className="oj-card mb-4 flex items-center justify-between gap-3 px-3 py-2">
      {prev ? (
        <Link
          href={buildProblemNavHref(prev.slug, listSource as "problems" | "collection", listId, { sort, difficulty, tag })}
          className="group flex min-w-0 flex-1 items-center gap-1.5 text-sm text-ink-300 hover:text-brand"
        >
          <span aria-hidden className="shrink-0 transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          <span className="truncate">{stripProblemNumber(prev.title, prev.uvaId)}</span>
        </Link>
      ) : (
        <span className="flex-1 text-sm text-ink-500">{t("← Start of list")}</span>
      )}

      <span className="shrink-0 font-mono text-xs text-ink-500">
        {t("{n} / {total} · {context}", { n: index + 1, total: ordered.length, context: contextLabel })}
      </span>

      {next ? (
        <Link
          href={buildProblemNavHref(next.slug, listSource as "problems" | "collection", listId, { sort, difficulty, tag })}
          className="group flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right text-sm text-ink-300 hover:text-brand"
        >
          <span className="truncate">{stripProblemNumber(next.title, next.uvaId)}</span>
          <span aria-hidden className="shrink-0 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      ) : (
        <span className="flex-1 text-right text-sm text-ink-500">{t("End of list →")}</span>
      )}
    </div>
  );
}
