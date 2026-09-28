"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { buildProblemNavHref, filterAndSortProblems, SORT_KEYS, type ExamKind, type SortKey } from "@/lib/problemFilter";
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
  const difficulties = searchParams.getAll("difficulty").filter((value) => /^[1-4]$/.test(value));
  const tags = searchParams.getAll("tag").filter(Boolean);
  const examKind: ExamKind = searchParams.get("examKind") === "GPE" ? "GPE" : "CPE";

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

  if (!enabled) return <Link href="/problems" className="inline-flex min-h-10 items-center gap-2 px-1 text-sm font-medium text-ink-200 hover:text-brand"><span aria-hidden>☰</span>{t("Problems")}</Link>;

  const pool = listSource === "problems" ? allProblems?.items : collection?.problems;
  if (!pool) return null; // still loading — say nothing rather than a layout-shifting skeleton

  const ordered = filterAndSortProblems(pool, { difficulties, tags, sort, examKind });
  const index = ordered.findIndex((p) => p.slug === slug);
  // The current problem fell out of the list it supposedly came from (a filter changed underneath
  // it, or it's genuinely not a member) — nothing sane to render Previous/Next against.
  if (index === -1) return null;

  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index < ordered.length - 1 ? ordered[index + 1] : null;
  const contextLabel = listSource === "collection" ? (collection?.title ?? t("collection")) : t("Problems");

  return (
    <nav aria-label={t("Problems")} className="flex min-h-10 min-w-0 items-center gap-1">
      <span className="mr-2 truncate px-1 text-sm font-medium text-ink-200" title={contextLabel}>{contextLabel}</span>
      {prev ? (
        <Link href={buildProblemNavHref(prev.slug, listSource as "problems" | "collection", listId, { sort, difficulties, tags, examKind })}
          aria-label={stripProblemNumber(prev.title, prev.uvaId)} title={stripProblemNumber(prev.title, prev.uvaId)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-ink-300 hover:bg-ink-800 hover:text-brand"><span aria-hidden>‹</span></Link>
      ) : <span title={t("← Start of list")} aria-label={t("← Start of list")} className="flex h-9 w-9 shrink-0 items-center justify-center text-lg text-ink-600">‹</span>}
      {next ? (
        <Link href={buildProblemNavHref(next.slug, listSource as "problems" | "collection", listId, { sort, difficulties, tags, examKind })}
          aria-label={stripProblemNumber(next.title, next.uvaId)} title={stripProblemNumber(next.title, next.uvaId)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-ink-300 hover:bg-ink-800 hover:text-brand"><span aria-hidden>›</span></Link>
      ) : <span title={t("End of list →")} aria-label={t("End of list →")} className="flex h-9 w-9 shrink-0 items-center justify-center text-lg text-ink-600">›</span>}
      <span className="ml-2 shrink-0 font-mono text-xs tabular-nums text-ink-400">{index + 1} / {ordered.length}</span>
    </nav>
  );
}
