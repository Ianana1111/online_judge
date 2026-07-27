"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InfoTooltip from "@/components/InfoTooltip";
import LockIcon from "@/components/LockIcon";
import { stripProblemNumber } from "@/lib/problemTitle";
import { useAuthStore } from "@/store/auth";
import type { ProblemRow } from "@/lib/types";

const DIFFICULTY_EXPLANATION =
  "Curated ratings come first: problems from an officially-rated set (like the CPE 必考49題 one-star selection) keep that rating. Everything else is derived from how many people worldwide have solved it on UVa (more solvers = more introductory), with a minimum floor based on the algorithm topic — a DP or graph problem never rates below what its technique demands.";

type SortKey = "number" | "difficulty-asc" | "difficulty-desc" | "unsolved-first" | "cpe-appearances";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "number", label: "Problem number ↑" },
  { key: "difficulty-asc", label: "Difficulty: low → high" },
  { key: "difficulty-desc", label: "Difficulty: high → low" },
  { key: "unsolved-first", label: "Unsolved first" },
];

// <option> elements can't render an icon, so the Pro-only nature is spelled out in words here
// instead of the lock glyph used everywhere else this stat appears.
const PRO_SORT_OPTION: { key: SortKey; label: string } = { key: "cpe-appearances", label: "Times in past CPE exams (Pro) ↓" };

/**
 * The single filter+sort+table used by both the Problems list and each collection page, so the two
 * behave identically. The caller fetches the full problem set and hands it in; all filtering and
 * sorting happens client-side here.
 */
export default function ProblemFilterTable({ problems }: { problems: ProblemRow[] }) {
  const isPro = useAuthStore((s) => s.user?.plan === "PRO");
  const router = useRouter();
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<SortKey>("number");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of problems) for (const t of p.tags) set.add(t);
    return [...set].sort();
  }, [problems]);

  const visible = useMemo(() => {
    let list = problems.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (difficulty && p.difficulty !== parseInt(difficulty, 10)) return false;
      if (tag && !p.tags.includes(tag)) return false;
      return true;
    });
    list = [...list];
    switch (sort) {
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
        // Only ever reachable with real numbers when isPro — non-Pro users are redirected to
        // /upgrade before `sort` ever gets set to this value (see the <select> below), so this
        // never silently runs a no-op sort against everyone's cpeAppearances: null.
        list.sort((a, b) => (b.cpeAppearances ?? 0) - (a.cpeAppearances ?? 0));
        break;
    }
    return list;
  }, [problems, q, difficulty, tag, sort]);

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
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="oj-input max-w-[160px]">
          <option value="">All difficulties</option>
          <option value="1">★</option>
          <option value="2">★★</option>
          <option value="3">★★★</option>
          <option value="4">★★★★</option>
        </select>
        <select value={tag} onChange={(e) => setTag(e.target.value)} className="oj-input max-w-[200px]">
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => {
            const next = e.target.value as SortKey;
            // Visible to everyone (it's the tease), but selecting it without Pro sends them
            // straight to the upgrade page instead of applying the sort — `sort` state never
            // changes, so the <select> (a controlled input) snaps back to the current value.
            if (next === "cpe-appearances" && !isPro) {
              router.push("/upgrade");
              return;
            }
            setSort(next);
          }}
          className="oj-input max-w-[220px]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
          <option value={PRO_SORT_OPTION.key}>{PRO_SORT_OPTION.label}</option>
        </select>
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
                <Link href={`/problems/${p.slug}`} className="font-medium text-ink-50 hover:text-brand">
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
