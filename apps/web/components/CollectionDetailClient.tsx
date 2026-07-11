"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CollectionDetail, CollectionProblemItem } from "@/lib/types";

type SortKey = "number" | "curated" | "difficulty-asc" | "difficulty-desc" | "unsolved-first";

export default function CollectionDetailClient({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["collections", slug],
    queryFn: () => apiFetch<CollectionDetail>(`/collections/${slug}`),
  });

  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<SortKey>("number");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of data?.problems ?? []) for (const t of p.tags) set.add(t);
    return [...set].sort();
  }, [data]);

  const visible = useMemo(() => {
    let list = [...(data?.problems ?? [])];
    if (tag) list = list.filter((p) => p.tags.includes(tag));
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
      // "curated": keep the collection's curated order (already sorted by the API)
    }
    return list;
  }, [data, tag, sort]);

  if (isLoading) return <p className="text-sm text-ink-400">Loading…</p>;
  if (!data) return <p className="text-sm text-verdict-wa">Collection not found.</p>;

  const total = data.problems.length;
  const solved = data.problems.filter((p) => p.solvedByMe).length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{data.title}</h1>
        {data.description && <p className="mt-1 text-sm text-ink-400">{data.description}</p>}
      </div>

      <div className="oj-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-ink-300">Progress</span>
          <span className="font-mono text-ink-200">
            {solved} / {total} solved
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink-800">
          <div className="h-full rounded-full bg-verdict-ac transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={tag} onChange={(e) => setTag(e.target.value)} className="oj-input max-w-[200px]">
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="oj-input max-w-[200px]">
          <option value="number">Problem number ↑</option>
          <option value="curated">Curated order</option>
          <option value="difficulty-asc">Difficulty: low → high</option>
          <option value="difficulty-desc">Difficulty: high → low</option>
          <option value="unsolved-first">Unsolved first</option>
        </select>
        {tag && (
          <button onClick={() => setTag("")} className="text-xs text-ink-400 hover:text-brand">
            Clear filter
          </button>
        )}
        <span className="ml-auto text-xs text-ink-500">
          {visible.length} of {total} shown
        </span>
      </div>

      <table className="oj-table">
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>Title</th>
            <th>Source</th>
            <th>Difficulty</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p: CollectionProblemItem) => (
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
                No problems match this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
