"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import InfoTooltip from "@/components/InfoTooltip";
import type { ProblemRow } from "@/lib/types";

const DIFFICULTY_EXPLANATION =
  "Curated ratings come first: problems from an officially-rated set (like the CPE 必考49題 one-star selection) keep that rating. Everything else is derived from how many people worldwide have solved it on UVa (more solvers = more introductory), with a minimum floor based on the algorithm topic — a DP or graph problem never rates below what its technique demands.";

type SortKey = "number" | "difficulty-asc" | "difficulty-desc" | "unsolved-first";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "number", label: "Problem number ↑" },
  { key: "difficulty-asc", label: "Difficulty: low → high" },
  { key: "difficulty-desc", label: "Difficulty: high → low" },
  { key: "unsolved-first", label: "Unsolved first" },
];

/**
 * The single filter+sort+table used by both the Problems list and each collection page, so the two
 * behave identically. The caller fetches the full problem set and hands it in; all filtering and
 * sorting happens client-side here.
 */
export default function ProblemFilterTable({ problems }: { problems: ProblemRow[] }) {
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
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="oj-input max-w-[200px]">
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
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
          </tr>
        </thead>
        <tbody>
          {visible.map((p) => (
            <tr key={p.id}>
              <td className="w-6 text-center">{p.solvedByMe && <span className="text-verdict-ac">✓</span>}</td>
              <td className="font-mono text-xs text-ink-400">{p.uvaId ?? "—"}</td>
              <td>
                <Link href={`/problems/${p.slug}`} className="font-medium text-ink-50 hover:text-brand">
                  {p.title}
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
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-ink-400">
                No problems match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
