"use client";

import Link from "next/link";
import { WorkspaceBackLink } from "@/components/WorkspaceChrome";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { buildProblemNavHref, filterAndSortProblems, SORT_KEYS, type ExamKind, type SortKey } from "@/lib/problemFilter";
import { stripProblemNumber } from "@/lib/problemTitle";
import type { CollectionDetail, ProblemListResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

/** Walk the filtered list supplied by ProblemFilterTable's URL parameters.
 * Direct links have no list to walk; the return link still leads to the full problem list. Active exams supply their own navigation through ProblemView.
 */
export default function ProblemPrevNext({ slug, compact = false }: { slug: string; compact?: boolean }) {
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

  const pool = listSource === "problems" ? allProblems?.items : collection?.problems;
  const ordered = pool && enabled ? filterAndSortProblems(pool, { difficulties, tags, sort, examKind }) : [];
  const index = ordered.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;
  const q = searchParams.get("q") ?? "";

  return (
    <nav aria-label={t("Problems")} className="flex min-h-11 min-w-0 flex-wrap items-center gap-x-1 lg:min-h-8 lg:flex-nowrap">
      <WorkspaceBackLink />
      {index >= 0 && <div className="flex shrink-0 items-center gap-1">
        {prev ? (
          <Link href={buildProblemNavHref(prev.slug, listSource as "problems" | "collection", listId, { sort, difficulties, tags, examKind, q })}
            aria-label={stripProblemNumber(prev.title, prev.uvaId)} title={stripProblemNumber(prev.title, prev.uvaId)}
            className="flex h-11 w-9 lg:h-8 lg:w-8 shrink-0 items-center justify-center rounded-lg text-lg text-ink-300 hover:bg-ink-800 hover:text-brand"><span aria-hidden>‹</span></Link>
        ) : <span title={t("← Start of list")} aria-label={t("← Start of list")} className="flex h-11 w-9 lg:h-8 lg:w-8 shrink-0 items-center justify-center text-lg text-ink-600">‹</span>}
        {next ? (
          <Link href={buildProblemNavHref(next.slug, listSource as "problems" | "collection", listId, { sort, difficulties, tags, examKind, q })}
            aria-label={stripProblemNumber(next.title, next.uvaId)} title={stripProblemNumber(next.title, next.uvaId)}
            className="flex h-11 w-9 lg:h-8 lg:w-8 shrink-0 items-center justify-center rounded-lg text-lg text-ink-300 hover:bg-ink-800 hover:text-brand"><span aria-hidden>›</span></Link>
        ) : <span title={t("End of list →")} aria-label={t("End of list →")} className="flex h-11 w-9 lg:h-8 lg:w-8 shrink-0 items-center justify-center text-lg text-ink-600">›</span>}
        <span className={`${compact ? "hidden xl:inline" : ""} ml-2 shrink-0 font-mono text-xs tabular-nums text-ink-400`}>{index + 1} / {ordered.length}</span>
      </div>}
    </nav>
  );
}
