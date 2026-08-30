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
import { useT } from "@/lib/i18n/LocaleContext";

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
  filters: { sort: SortKey | null; difficulty: string; tag: string; examKind: ExamKind },
): string {
  return buildProblemNavHref(slug, ctx.type, ctx.type === "collection" ? ctx.slug : null, filters);
}

interface DropdownOption {
  value: string;
  label: ReactNode;
}

/** A from-scratch dropdown, not a styled native &lt;select&gt; — the open panel on a native select is
 * drawn by the OS/browser itself (that washed-out translucent white list on macOS), which no amount
 * of CSS on the closed control can fix. This instead reuses the exact panel NavBar's own account
 * menu already uses (oj-card, solid ink-900, hover:bg-ink-800 rows) so an open filter dropdown looks
 * like it belongs to this site instead of to the OS. */
function Dropdown({
  value,
  options,
  onChange,
  className = "",
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

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
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="oj-input flex items-center justify-between gap-2 text-left"
      >
        <span className="truncate">{current?.label}</span>
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
          role="listbox"
          className="oj-card absolute left-0 top-full z-20 mt-1.5 max-h-72 w-full min-w-max overflow-y-auto p-1"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`block w-full whitespace-nowrap rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-ink-800 ${
                o.value === value ? "text-brand" : "text-ink-200"
              }`}
            >
              {o.label}
            </button>
          ))}
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
  const [difficulty, setDifficultyState] = useState(searchParams.get("difficulty") ?? "");
  const [tag, setTagState] = useState(searchParams.get("tag") ?? "");
  const [examKind, setExamKindState] = useState<ExamKind>(searchParams.get("examKind") === "GPE" ? "GPE" : "CPE");

  function syncUrl(next: { sort?: SortKey | null; difficulty?: string; tag?: string; examKind?: ExamKind }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { sort, difficulty, tag, examKind, ...next };
    if (merged.sort) params.set("sort", merged.sort);
    else params.delete("sort");
    if (merged.difficulty) params.set("difficulty", merged.difficulty);
    else params.delete("difficulty");
    if (merged.tag) params.set("tag", merged.tag);
    else params.delete("tag");
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
  function setDifficulty(next: string) {
    setDifficultyState(next);
    syncUrl({ difficulty: next });
  }
  /** Switches which exam's appearance count the column shows/sorts by — a display toggle, not a
   * row filter, so it never touches which problems are visible, only what that one column reads. */
  function setExamKind(next: ExamKind) {
    setExamKindState(next);
    syncUrl({ examKind: next });
  }
  function setTag(next: string) {
    setTagState(next);
    syncUrl({ tag: next });
  }

  const DIFFICULTY_OPTIONS: DropdownOption[] = useMemo(
    () => [
      { value: "", label: t("All difficulties") },
      { value: "1", label: "★" },
      { value: "2", label: "★★" },
      { value: "3", label: "★★★" },
      { value: "4", label: "★★★★" },
    ],
    [t],
  );
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of problems) for (const tag of p.tags) set.add(tag);
    return [...set].sort();
  }, [problems]);
  const tagOptions: DropdownOption[] = useMemo(
    () => [{ value: "", label: t("All tags") }, ...allTags.map((tag) => ({ value: tag, label: tag }))],
    [allTags, t],
  );
  const filteredSorted = useMemo(
    () => filterAndSortProblems(problems, { difficulty, tag, sort, examKind }),
    [problems, difficulty, tag, sort, examKind],
  );
  const visible = useMemo(
    () => (q ? filteredSorted.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())) : filteredSorted),
    [filteredSorted, q],
  );

  const filtersActive = q !== "" || difficulty !== "" || tag !== "";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("Search title…")}
          className="oj-input max-w-xs"
        />
        <Dropdown value={difficulty} onChange={setDifficulty} options={DIFFICULTY_OPTIONS} className="w-[150px]" />
        <Dropdown value={tag} onChange={setTag} options={tagOptions} className="w-[180px]" />
        {filtersActive && (
          <button
            onClick={() => {
              setQ("");
              setDifficulty("");
              setTag("");
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
            <th>{t("Source")}</th>
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
                  href={buildProblemHref(p.slug, listContext, { sort, difficulty, tag, examKind })}
                  className="font-medium text-ink-50 hover:text-brand"
                >
                  {stripProblemNumber(p.title, p.uvaId)}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-400">{p.source}</td>
              <td className="font-mono text-xs text-brand">{"★".repeat(p.difficulty)}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {p.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTag(tag)}
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
