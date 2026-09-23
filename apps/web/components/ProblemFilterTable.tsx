"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InfoTooltip from "@/components/InfoTooltip";
import LockIcon from "@/components/LockIcon";
import { stripProblemNumber } from "@/lib/problemTitle";
import { buildProblemNavHref, filterAndSortProblems, SORT_KEYS, type ExamKind, type SortKey } from "@/lib/problemFilter";
import { useAuthStore } from "@/store/auth";
import type { ProblemRow } from "@/lib/types";
import { useLocale, useT } from "@/lib/i18n/LocaleContext";

const DIFFICULTY_EXPLANATION =
  "Estimated from official ratings where available, otherwise from worldwide solve statistics — for reference only.";

const SOLVED_EXPLANATION = "Pro perk: sort by whether you've solved a problem yet, to hunt down what's left.";
// {kind} is substituted with the currently-toggled exam ("CPE" or "GPE") — not translated per kind,
// since those are the same two ASCII abbreviations in either language.
const APPEARANCES_EXPLANATION = "Pro perk: how many past {kind} sittings this problem has appeared in.";

/** Each sortable column cycles through exactly three states on repeated clicks: `desc`, then
 * `asc`, then back to no sort at all (`null`) — see `cycleSort`. `pair` is [descKey, ascKey]; for
 * the solved column those slots hold "solved-first"/"unsolved-first" instead of a literal
 * desc/asc pair, but the cycle mechanics are identical. */
function cycleSort(current: SortKey | null, pair: [SortKey, SortKey]): SortKey | null {
  if (current === pair[0]) return pair[1];
  if (current === pair[1]) return null;
  return pair[0];
}

function sortDirectionOf(current: SortKey | null, pair: [SortKey, SortKey]): "desc" | "asc" | null {
  if (current === pair[0]) return "desc";
  if (current === pair[1]) return "asc";
  return null;
}

/** Small ▲/▼ indicator for a sortable column header — filled brand color when this column is the
 * active sort, dim outline otherwise so the header still visibly invites a click. */
function SortArrows({ direction }: { direction: "desc" | "asc" | null }) {
  return (
    <span className="inline-flex flex-col leading-none">
      <span className={`text-[9px] ${direction === "asc" ? "text-brand" : "text-ink-500"}`}>▲</span>
      <span className={`-mt-1 text-[9px] ${direction === "desc" ? "text-brand" : "text-ink-500"}`}>▼</span>
    </span>
  );
}

/** Where this table's problem set came from — threaded into each row's link (see
 * buildProblemHref) so the detail page's Previous/Next can fetch the exact same set and re-apply
 * the exact same filters, instead of guessing. */
export type ListContext = { type: "problems" } | { type: "collection"; slug: string };

function buildProblemHref(
  slug: string,
  ctx: ListContext,
  filters: { sort: SortKey | null; difficulties: string[]; tags: string[]; examKind: ExamKind },
): string {
  return buildProblemNavHref(slug, ctx.type, ctx.type === "collection" ? ctx.slug : null, filters);
}

interface DropdownOption {
  value: string;
  label: ReactNode;
  searchText?: string;
}

/** A from-scratch dropdown, not a styled native &lt;select&gt; — the open panel on a native select is
 * drawn by the OS/browser itself (that washed-out translucent white list on macOS), which no amount
 * of CSS on the closed control can fix. This instead reuses the exact panel NavBar's own account
 * menu already uses (oj-card, solid ink-900, hover:bg-ink-800 rows) so an open filter dropdown looks
 * like it belongs to this site instead of to the OS. */
function MultiSelectDropdown({
  values,
  options,
  onChange,
  allLabel,
  summary,
  panelLabel,
  searchable = false,
  searchPlaceholder,
  clearLabel,
  doneLabel,
  className = "",
}: {
  values: string[];
  options: DropdownOption[];
  onChange: (values: string[]) => void;
  allLabel: string;
  summary: string;
  panelLabel: string;
  searchable?: boolean;
  searchPlaceholder: string;
  clearLabel: string;
  doneLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const filteredOptions = query
    ? options.filter((option) => (option.searchText ?? option.value).toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery(""); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={panelLabel}
        className={`oj-input flex min-h-11 items-center justify-between gap-2 text-left transition-colors ${values.length ? "border-brand/50 bg-brand/[0.04]" : ""}`}
      >
        <span className="min-w-0 truncate">{values.length ? summary : allLabel}</span>
        {values.length > 0 && <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1.5 font-mono text-[10px] font-bold text-onbrand">{values.length}</span>}
        <svg
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className={`h-2.5 w-2.5 shrink-0 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 3l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          className="oj-card absolute left-0 top-full z-30 mt-1.5 w-full min-w-[240px] overflow-hidden p-1.5 shadow-2xl shadow-black/25"
        >
          <div className="flex items-center justify-between gap-3 px-2 py-1.5">
            <p className="text-xs font-semibold text-ink-200">{panelLabel}</p>
            {values.length > 0 && <button type="button" onClick={() => onChange([])} className="text-xs text-ink-400 hover:text-brand">{clearLabel}</button>}
          </div>
          {searchable && <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="oj-input mb-1 min-h-9 w-full text-sm" placeholder={searchPlaceholder} aria-label={searchPlaceholder} />}
          <div role="listbox" aria-multiselectable="true" aria-label={panelLabel} className="max-h-64 overflow-y-auto py-1">
          {filteredOptions.map((o) => {
            const selected = values.includes(o.value);
            return (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onChange(selected ? values.filter((value) => value !== o.value) : [...values, o.value])}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-ink-800 ${selected ? "text-brand" : "text-ink-200"}`}
            >
              <span aria-hidden className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${selected ? "border-brand bg-brand font-bold text-onbrand" : "border-ink-600"}`}>{selected ? "✓" : ""}</span>
              <span className="min-w-0 truncate">{o.label}</span>
            </button>
          );})}
          {filteredOptions.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-400">—</p>}
          </div>
          <div className="flex items-center justify-between border-t border-ink-800 px-2 pt-2">
            <span className="text-[11px] text-ink-500">{values.length ? summary : allLabel}</span>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-onbrand">{doneLabel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The single filter+sort+table used by both the Problems list and each collection page, so the two
 * behave identically. The caller fetches the full problem set and hands it in; all filtering and
 * sorting happens client-side here. `listContext` says which of those two callers this is, purely
 * so each row's link can tell the problem detail page what set + filters to rebuild for Previous/Next.
 */
export default function ProblemFilterTable({ problems, listContext }: { problems: ProblemRow[]; listContext: ListContext }) {
  const t = useT();
  const { locale } = useLocale();
  const isPro = useAuthStore((s) => s.user?.plan === "PRO");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");

  // difficulty, tag, and sort all round-trip through the URL (not just component state) so they
  // survive navigating to a problem and coming back, AND so a fresh mount of the problem detail
  // page's Previous/Next can read the exact same three values back out of the link it was given.
  // Free-text search deliberately doesn't — see filterAndSortProblems's doc comment.
  const initialSort = searchParams.get("sort");
  const [sort, setSortState] = useState<SortKey | null>(
    initialSort && SORT_KEYS.includes(initialSort as SortKey) ? (initialSort as SortKey) : null,
  );
  const [difficulties, setDifficultiesState] = useState(() => [...new Set(searchParams.getAll("difficulty").filter((value) => /^[1-4]$/.test(value)))]);
  const [tags, setTagsState] = useState(() => [...new Set(searchParams.getAll("tag").filter(Boolean))]);
  const [examKind, setExamKindState] = useState<ExamKind>(searchParams.get("examKind") === "GPE" ? "GPE" : "CPE");

  function syncUrl(next: { sort?: SortKey | null; difficulties?: string[]; tags?: string[]; examKind?: ExamKind }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { sort, difficulties, tags, examKind, ...next };
    if (merged.sort) params.set("sort", merged.sort);
    else params.delete("sort");
    params.delete("difficulty");
    for (const difficulty of merged.difficulties) params.append("difficulty", difficulty);
    params.delete("tag");
    for (const tag of merged.tags) params.append("tag", tag);
    // Omitted for the default (CPE) — see buildProblemNavHref's own comment for why.
    if (merged.examKind === "GPE") params.set("examKind", merged.examKind);
    else params.delete("examKind");
    const qs = params.toString();
    // replace (not push): changing a filter shouldn't pile up its own back-button history — only
    // the navigation to/from a problem page should do that.
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setSort(next: SortKey | null) {
    setSortState(next);
    syncUrl({ sort: next });
  }
  /** Click handler shared by every sortable column header: cycles desc → asc → none, redirecting
   * to /upgrade instead of applying anything when the column is Pro-gated and the viewer isn't. */
  function handleHeaderClick(pair: [SortKey, SortKey], proGated: boolean) {
    if (proGated && !isPro) {
      router.push("/upgrade");
      return;
    }
    setSort(cycleSort(sort, pair));
  }
  function setDifficulties(next: string[]) {
    setDifficultiesState(next);
    syncUrl({ difficulties: next });
  }
  /** Switches which exam's appearance count the column shows/sorts by — a display toggle, not a
   * row filter, so it never touches which problems are visible, only what that one column reads. */
  function setExamKind(next: ExamKind) {
    setExamKindState(next);
    syncUrl({ examKind: next });
  }
  function setTags(next: string[]) {
    setTagsState(next);
    syncUrl({ tags: next });
  }

  const DIFFICULTY_OPTIONS: DropdownOption[] = useMemo(
    () => [
      { value: "1", label: "★" },
      { value: "2", label: "★★" },
      { value: "3", label: "★★★" },
      { value: "4", label: "★★★★" },
    ],
    [],
  );
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of problems) for (const tag of p.tags) set.add(tag);
    return [...set].sort();
  }, [problems]);
  const tagOptions: DropdownOption[] = useMemo(
    () => allTags.map((tag) => ({ value: tag, label: tag, searchText: tag })),
    [allTags],
  );
  const filteredSorted = useMemo(
    () => filterAndSortProblems(problems, { difficulties, tags, sort, examKind }),
    [problems, difficulties, tags, sort, examKind],
  );
  const visible = useMemo(
    () => (q ? filteredSorted.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())) : filteredSorted),
    [filteredSorted, q],
  );

  const filtersActive = q !== "" || difficulties.length > 0 || tags.length > 0;
  const difficultySummary = difficulties.length === 1
    ? "★".repeat(Number(difficulties[0]))
    : locale === "zh-TW" ? `${difficulties.length} 個難度` : `${difficulties.length} difficulties`;
  const tagSummary = tags.length === 1
    ? tags[0]
    : locale === "zh-TW" ? `${tags.length} 個標籤` : `${tags.length} tags`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("Search title…")}
          className="oj-input max-w-xs"
        />
        <MultiSelectDropdown values={difficulties} onChange={setDifficulties} options={DIFFICULTY_OPTIONS} allLabel={t("All difficulties")} summary={difficultySummary} panelLabel={t("Difficulty")} searchPlaceholder={t("Search…")} clearLabel={t("Clear")} doneLabel={locale === "zh-TW" ? "完成" : "Done"} className="w-[170px]" />
        <MultiSelectDropdown values={tags} onChange={setTags} options={tagOptions} allLabel={t("All tags")} summary={tagSummary} panelLabel={t("Tags")} searchable searchPlaceholder={t("Search…")} clearLabel={t("Clear")} doneLabel={locale === "zh-TW" ? "完成" : "Done"} className="w-[210px]" />
        {filtersActive && (
          <button
            onClick={() => {
              setQ("");
              setDifficultiesState([]);
              setTagsState([]);
              syncUrl({ difficulties: [], tags: [] });
            }}
            className="text-xs text-ink-400 hover:text-brand"
          >
            {t("Clear filters")}
          </button>
        )}
        <span className="ml-auto text-xs text-ink-500">
          {t("{visible} of {total} shown", { visible: visible.length, total: problems.length })}
        </span>
      </div>

      {(difficulties.length > 0 || tags.length > 0) && <div className="mb-4 flex flex-wrap gap-2" aria-label={locale === "zh-TW" ? "已套用的篩選" : "Applied filters"}>
        {difficulties.map((difficulty) => <button key={`difficulty-${difficulty}`} type="button" onClick={() => setDifficulties(difficulties.filter((value) => value !== difficulty))} className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/[0.06] px-2.5 py-1 text-xs text-brand transition-colors hover:bg-brand/10"><span>{"★".repeat(Number(difficulty))}</span><span aria-hidden>×</span></button>)}
        {tags.map((tag) => <button key={`tag-${tag}`} type="button" onClick={() => setTags(tags.filter((value) => value !== tag))} className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800/70 px-2.5 py-1 text-xs text-ink-200 transition-colors hover:border-brand/40 hover:text-brand"><span>{tag}</span><span aria-hidden>×</span></button>)}
      </div>}

      <div className="overflow-x-auto">
      <table className="oj-table">
        <thead>
          <tr>
            <th className="w-10">
              <span className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleHeaderClick(["solved-first", "unsolved-first"], true)}
                  title={isPro ? t("Sort by solved") : undefined}
                  className={`inline-flex items-center gap-1 ${isPro ? "text-verdict-ac hover:text-brand" : "text-ink-400 hover:text-brand"}`}
                >
                  ✓
                  {isPro ? (
                    <SortArrows direction={sortDirectionOf(sort, ["solved-first", "unsolved-first"])} />
                  ) : (
                    <LockIcon />
                  )}
                </button>
                <InfoTooltip text={t(SOLVED_EXPLANATION)} align="left" />
              </span>
            </th>
            <th>
              <button
                type="button"
                onClick={() => handleHeaderClick(["number-desc", "number-asc"], false)}
                className="inline-flex items-center gap-1 hover:text-brand"
              >
                #<SortArrows direction={sortDirectionOf(sort, ["number-desc", "number-asc"])} />
              </button>
            </th>
            <th>{t("Title")}</th>
            <th>
              <span className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleHeaderClick(["difficulty-desc", "difficulty-asc"], false)}
                  className="inline-flex items-center gap-1 hover:text-brand"
                >
                  {t("Difficulty")}
                  <SortArrows direction={sortDirectionOf(sort, ["difficulty-desc", "difficulty-asc"])} />
                </button>
                <InfoTooltip text={t(DIFFICULTY_EXPLANATION)} />
              </span>
            </th>
            <th>{t("Tags")}</th>
            <th>
              <span className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleHeaderClick(["appearances-desc", "appearances-asc"], true)}
                  title={isPro ? t("Sort by past {kind} appearances", { kind: examKind }) : undefined}
                  className={`inline-flex items-center gap-1 ${isPro ? "text-brand hover:text-brand/80" : "text-ink-400 hover:text-brand"}`}
                >
                  {t("Past")}
                  {isPro ? <SortArrows direction={sortDirectionOf(sort, ["appearances-desc", "appearances-asc"])} /> : <LockIcon />}
                </button>
                {/* CPE/GPE toggle — a display switch for this one column, not a sort trigger and
                    not itself Pro-gated (the underlying count still is, via the lock icon above):
                    stopPropagation keeps a click here from also bubbling into the sort cycle. */}
                <span className="inline-flex overflow-hidden rounded border border-ink-700" role="group" aria-label={t("Exam kind")}>
                  {(["CPE", "GPE"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExamKind(k);
                      }}
                      aria-pressed={examKind === k}
                      className={`px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal transition-colors ${
                        examKind === k ? "bg-brand text-onbrand" : "text-ink-400 hover:text-ink-100"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </span>
                <InfoTooltip text={t(APPEARANCES_EXPLANATION, { kind: examKind })} align="right" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p) => (
            <tr key={p.id}>
              <td className="w-6 text-center">{p.solvedByMe && <span className="text-verdict-ac">✓</span>}</td>
              <td className="font-mono text-xs text-ink-400">{p.uvaId ?? "—"}</td>
              <td>
                <Link
                  href={buildProblemHref(p.slug, listContext, { sort, difficulties, tags, examKind })}
                  className="font-medium text-ink-50 hover:text-brand"
                >
                  {stripProblemNumber(p.title, p.uvaId)}
                </Link>
              </td>
              <td className="font-mono text-xs text-brand">{"★".repeat(p.difficulty)}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {p.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTags(tags.includes(tag) ? tags : [...tags, tag])}
                      title={t("Filter by {tag}", { tag })}
                      className="rounded border border-ink-700 bg-ink-800/60 px-1.5 py-0.5 text-[11px] text-ink-300 transition-colors hover:border-brand/40 hover:text-brand"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </td>
              <td className="text-center font-mono text-xs">
                {isPro ? (
                  (() => {
                    const appearances = examKind === "GPE" ? p.gpeAppearances : p.cpeAppearances;
                    return appearances ? (
                      <span className="text-brand">×{appearances}</span>
                    ) : (
                      <span className="text-ink-400">—</span>
                    );
                  })()
                ) : (
                  <Link
                    href="/upgrade"
                    title={t("Pro feature — upgrade to see how many past CPE exams this problem appeared in")}
                    className="inline-flex text-ink-400 hover:text-brand"
                  >
                    <LockIcon />
                  </Link>
                )}
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-ink-400">
                {t("No problems match these filters.")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
