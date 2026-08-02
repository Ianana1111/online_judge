import type { ProblemRow } from "./types";

export type SortKey = "number" | "difficulty-asc" | "difficulty-desc" | "unsolved-first" | "cpe-appearances";
export const SORT_KEYS: SortKey[] = ["number", "difficulty-asc", "difficulty-desc", "unsolved-first", "cpe-appearances"];

export interface ProblemFilters {
  difficulty?: string; // "" | "1".."4", same string the <select> uses directly
  tag?: string;
  sort?: SortKey;
}

/**
 * The single source of truth for "difficulty + tag filter, then sort" — shared by
 * ProblemFilterTable (what you see) and ProblemPrevNext (where Previous/Next take you), so the two
 * can never disagree about what order problems are in. Deliberately excludes free-text search: the
 * prev/next feature is specified to follow difficulty/tags/sort only, not the search box, so a
 * search string never shrinks or reorders the prev/next sequence.
 */
/** The one place that builds a `/problems/:slug` link carrying list context (which set of
 * problems, and the difficulty/tag/sort applied to it) — used both when linking OUT of a filtered
 * list (ProblemFilterTable) and when linking BETWEEN problems via Previous/Next
 * (ProblemPrevNext), so the two can never drift into building the URL shape differently. */
export function buildProblemNavHref(
  slug: string,
  listSource: "problems" | "collection",
  listId: string | null,
  filters: { sort: SortKey; difficulty: string; tag: string },
): string {
  const params = new URLSearchParams();
  params.set("listSource", listSource);
  if (listSource === "collection" && listId) params.set("listId", listId);
  if (filters.sort !== "number") params.set("sort", filters.sort);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.tag) params.set("tag", filters.tag);
  return `/problems/${slug}?${params.toString()}`;
}

export function filterAndSortProblems(problems: ProblemRow[], { difficulty, tag, sort }: ProblemFilters): ProblemRow[] {
  const list = problems.filter((p) => {
    if (difficulty && p.difficulty !== parseInt(difficulty, 10)) return false;
    if (tag && !p.tags.includes(tag)) return false;
    return true;
  });
  switch (sort ?? "number") {
    case "number":
      list.sort((a, b) => (a.uvaId ?? Infinity) - (b.uvaId ?? Infinity));
      break;
    case "difficulty-asc":
      list.sort((a, b) => a.difficulty - b.difficulty);
      break;
    case "difficulty-desc":
      list.sort((a, b) => b.difficulty - a.difficulty);
      break;
    case "unsolved-first":
      list.sort((a, b) => Number(a.solvedByMe) - Number(b.solvedByMe));
      break;
    case "cpe-appearances":
      list.sort((a, b) => (b.cpeAppearances ?? 0) - (a.cpeAppearances ?? 0));
      break;
  }
  return list;
}
