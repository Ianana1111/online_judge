"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/LocaleContext";
import { SkeletonList } from "./Skeleton";

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

interface QueryBoundaryProps<T> {
  query: QueryLike<T>;
  /** Defaults to SkeletonList — pass a page-specific skeleton (e.g. SkeletonGrid) when the list
   * being loaded doesn't read as a list of rows. */
  loading?: ReactNode;
  /** True when `data` is present but represents "nothing to show" (an empty array, etc.) —
   * renders `empty` instead of `children` in that case. Omit to skip the empty-state check
   * entirely (e.g. for data that's never meaningfully "empty", like a single object). */
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * The fix for the launch audit's biggest frontend finding: of 66 call sites using useQuery
 * across this app, only a couple handled the error case at all — with retry:1 (React Query's
 * default) and no explicit error UI, an API outage or a slow cold start made every list page
 * quietly render its own "nothing here yet" empty state instead of a real error. A visitor had no
 * way to tell "this genuinely has nothing" apart from "the site is broken right now," and would
 * reasonably just leave. This makes the three states (loading / error / empty) explicit and
 * consistent everywhere instead of ad hoc per page — most call sites had no error branch at all,
 * a few had a subtly wrong empty-state condition (e.g. `data?.items.length === 0`, which is
 * `false` for both a genuine empty list AND an error, since `undefined === 0` is also false —
 * that page rendered nothing at all on error, worse than the wrong-but-visible empty message).
 */
export default function QueryBoundary<T>({ query, loading, isEmpty, empty, children }: QueryBoundaryProps<T>) {
  const t = useT();

  if (query.isLoading) return <>{loading ?? <SkeletonList rows={6} />}</>;

  if (query.isError) {
    return (
      <div className="oj-card flex flex-col items-center gap-2 p-6 text-center">
        <p className="text-sm text-ink-300">{t("Something went wrong")}</p>
        <button type="button" onClick={() => query.refetch()} className="oj-btn-secondary px-4 py-1.5 text-xs">
          {t("Try again")}
        </button>
      </div>
    );
  }

  if (query.data === undefined) return null; // isLoading/isError both false but no data — shouldn't happen with a real query

  if (isEmpty?.(query.data)) return <>{empty}</>;

  return <>{children(query.data)}</>;
}
