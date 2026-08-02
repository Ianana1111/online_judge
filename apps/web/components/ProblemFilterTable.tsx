"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InfoTooltip from "@/components/InfoTooltip";
import LockIcon from "@/components/LockIcon";
import { stripProblemNumber } from "@/lib/problemTitle";
import { buildProblemNavHref, filterAndSortProblems, SORT_KEYS, type SortKey } from "@/lib/problemFilter";
import { useAuthStore } from "@/store/auth";
import type { ProblemRow } from "@/lib/types";

const DIFFICULTY_EXPLANATION =
  "Curated ratings come first: problems from an officially-rated set (like the CPE 必考49題 one-star selection) keep that rating. Everything else is derived from how many people worldwide have solved it on UVa (more solvers = more introductory), with a minimum floor based on the algorithm topic — a DP or graph problem never rates below what its technique demands.";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "number", label: "Problem number ↑" },
  { key: "difficulty-asc", label: "Difficulty: low → high" },
  { key: "difficulty-desc", label: "Difficulty: high → low" },
  { key: "unsolved-first", label: "Unsolved first" },
];

// The dropdown is free-form (not <option> elements), so the Pro-only nature could carry a lock
// icon instead — kept as plain text for now to match the rest of this row's option labels.
const PRO_SORT_OPTION: { key: SortKey; label: string } = { key: "cpe-appearances", label: "Times in past CPE exams (Pro) ↓" };

const DIFFICULTY_OPTIONS: DropdownOption[] = [
  { value: "", label: "All difficulties" },
  { value: "1", label: "★" },
  { value: "2", label: "★★" },
  { value: "3", label: "★★★" },
  { value: "4", label: "★★★★" },
];

/** Where this table's problem set came from — threaded into each row's link (see
 * buildProblemHref) so the detail page's Previous/Next can fetch the exact same set and re-apply
 * the exact same filters, instead of guessing. */
export type ListContext = { type: "problems" } | { type: "collection"; slug: string };

function buildProblemHref(
  slug: string,
  ctx: ListContext,
  filters: { sort: SortKey; difficulty: string; tag: string },
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
  const [sort, setSortState] = useState<SortKey>(
    initialSort && SORT_KEYS.includes(initialSort as SortKey) ? (initialSort as SortKey) : "number",
  );
  const [difficulty, setDifficultyState] = useState(searchParams.get("difficulty") ?? "");
  const [tag, setTagState] = useState(searchParams.get("tag") ?? "");

  function syncUrl(next: { sort?: SortKey; difficulty?: string; tag?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { sort, difficulty, tag, ...next };
    if (merged.sort === "number") params.delete("sort");
    else params.set("sort", merged.sort);
    if (merged.difficulty) params.set("difficulty", merged.difficulty);
    else params.delete("difficulty");
    if (merged.tag) params.set("tag", merged.tag);
    else params.delete("tag");
    const qs = params.toString();
    // replace (not push): changing a filter shouldn't pile up its own back-button history — only
    // the navigation to/from a problem page should do that.
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setSort(next: SortKey) {
    setSortState(next);
    syncUrl({ sort: next });
  }
  function setDifficulty(next: string) {
    setDifficultyState(next);
    syncUrl({ difficulty: next });
  }
  function setTag(next: string) {
    setTagState(next);
    syncUrl({ tag: next });
  }

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of problems) for (const t of p.tags) set.add(t);
    return [...set].sort();
  }, [problems]);
  const tagOptions: DropdownOption[] = useMemo(
    () => [{ value: "", label: "All tags" }, ...allTags.map((t) => ({ value: t, label: t }))],
    [allTags],
  );
  const sortOptions: DropdownOption[] = useMemo(
    () => [...SORT_OPTIONS.map((o) => ({ value: o.key, label: o.label })), { value: PRO_SORT_OPTION.key, label: PRO_SORT_OPTION.label }],
    [],
  );

  const filteredSorted = useMemo(
    () => filterAndSortProblems(problems, { difficulty, tag, sort }),
    [problems, difficulty, tag, sort],
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
          placeholder="Search title…"
          className="oj-input max-w-xs"
        />
        <Dropdown value={difficulty} onChange={setDifficulty} options={DIFFICULTY_OPTIONS} className="w-[150px]" />
        <Dropdown value={tag} onChange={setTag} options={tagOptions} className="w-[180px]" />
        <Dropdown
          value={sort}
          onChange={(next) => {
            // Visible to everyone (it's the tease), but selecting it without Pro sends them
            // straight to the upgrade page instead of applying the sort — `sort` state never
            // changes, so the dropdown's displayed value snaps back on its own next render.
            if (next === "cpe-appearances" && !isPro) {
              router.push("/upgrade");
              return;
            }
            setSort(next as SortKey);
          }}
          options={sortOptions}
          className="w-[220px]"
        />
        {filtersActive && (
          <button
            onClick={() => {
              setQ("");
              setDifficulty("");
              setTag("");
            }}
            className="text-xs text-ink-400 hover:text-brand"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-ink-500">
          {visible.length} of {problems.length} shown
        </span>
      </div>

      <table className="oj-table">
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>Title</th>
            <th>Source</th>
            <th>
              <span className="inline-flex items-center gap-1">
                Difficulty
                <InfoTooltip text={DIFFICULTY_EXPLANATION} />
              </span>
            </th>
            <th>Tags</th>
            <th>
              <span className="inline-flex items-center gap-1 text-brand">
                Past CPE
                <InfoTooltip text="Pro perk: how many past CPE sittings this problem has appeared in." />
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
                  href={buildProblemHref(p.slug, listContext, { sort, difficulty, tag })}
                  className="font-medium text-ink-50 hover:text-brand"
                >
                  {stripProblemNumber(p.title, p.uvaId)}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-400">{p.source}</td>
              <td className="font-mono text-xs text-brand">{"★".repeat(p.difficulty)}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTag(t)}
                      title={`Filter by ${t}`}
                      className="rounded border border-ink-700 bg-ink-800/60 px-1.5 py-0.5 text-[11px] text-ink-300 transition-colors hover:border-brand/40 hover:text-brand"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </td>
              <td className="text-center font-mono text-xs">
                {isPro ? (
                  p.cpeAppearances ? (
                    <span className="text-brand">×{p.cpeAppearances}</span>
                  ) : (
                    <span className="text-ink-700">—</span>
                  )
                ) : (
                  <Link
                    href="/upgrade"
                    title="Pro feature — upgrade to see how many past CPE exams this problem appeared in"
                    className="inline-flex text-ink-600 hover:text-brand"
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
                No problems match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
