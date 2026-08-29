import type { ProblemRow } from "./types";

// Each sortable column cycles through exactly three states on repeated clicks: its "descending"
// key, then its "ascending" key, then back to no sort at all (represented by `null`, not a key) —
// see ProblemFilterTable's per-header click handler. "solved-first"/"unsolved-first" aren't a
// literal desc/asc pair, but they occupy the same two cycle slots for the one boolean column.
export type SortKey =
  | "number-desc"
  | "number-asc"
  | "difficulty-desc"
  | "difficulty-asc"
  | "appearances-desc"
  | "appearances-asc"
  | "solved-first"
  | "unsolved-first";
export const SORT_KEYS: SortKey[] = [
  "number-desc",
  "number-asc",
  "difficulty-desc",
  "difficulty-asc",
  "appearances-desc",
  "appearances-asc",
  "solved-first",
  "unsolved-first",
];

// Which exam's past-appearance count the "appearances" sort/column reads — CPE and GPE counts are
// both always present on ProblemRow (see its own comment), so switching this is instant, no
// refetch. Defaults to CPE (the site's main audience) wherever it's omitted from the URL.
export type ExamKind = "CPE" | "GPE";

export interface ProblemFilters {
  difficulty?: string; // "" | "1".."4", same string the <select> uses directly
  tag?: string;
  sort?: SortKey | null;
  examKind?: ExamKind;
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
  filters: { sort: SortKey | null; difficulty: string; tag: string; examKind?: ExamKind },
): string {
  const params = new URLSearchParams();
  params.set("listSource", listSource);
  if (listSource === "collection" && listId) params.set("listId", listId);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.tag) params.set("tag", filters.tag);
  // Omitted for the default (CPE) so a plain/no-toggle URL stays exactly as short as before this
  // existed — only a deliberate switch to GPE shows up in the link.
  if (filters.examKind === "GPE") params.set("examKind", filters.examKind);
  return `/problems/${slug}?${params.toString()}`;
}

export function filterAndSortProblems(
  problems: ProblemRow[],
  { difficulty, tag, sort, examKind = "CPE" }: ProblemFilters,
): ProblemRow[] {
  const list = problems.filter((p) => {
    if (difficulty && p.difficulty !== parseInt(difficulty, 10)) return false;
    if (tag && !p.tags.includes(tag)) return false;
    return true;
  });
  const appearancesOf = (p: ProblemRow) => (examKind === "GPE" ? p.gpeAppearances : p.cpeAppearances) ?? 0;
  switch (sort ?? null) {
    case "number-desc":
      list.sort((a, b) => (b.uvaId ?? -Infinity) - (a.uvaId ?? -Infinity));
      break;
    case "difficulty-desc":
      list.sort((a, b) => b.difficulty - a.difficulty);
      break;
    case "difficulty-asc":
      list.sort((a, b) => a.difficulty - b.difficulty);
      break;
    case "appearances-desc":
      list.sort((a, b) => appearancesOf(b) - appearancesOf(a));
      break;
    case "appearances-asc":
      list.sort((a, b) => appearancesOf(a) - appearancesOf(b));
      break;
    case "solved-first":
      list.sort((a, b) => Number(b.solvedByMe) - Number(a.solvedByMe));
      break;
    case "unsolved-first":
      list.sort((a, b) => Number(a.solvedByMe) - Number(b.solvedByMe));
      break;
    case "number-asc":
    default:
      list.sort((a, b) => (a.uvaId ?? Infinity) - (b.uvaId ?? Infinity));
      break;
  }
  return list;
}
