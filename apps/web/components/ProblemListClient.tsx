"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ProblemListResponse } from "@/lib/types";

const PAGE_SIZE = 20;

export default function ProblemListClient({
  initial,
  initialParams,
}: {
  initial: ProblemListResponse;
  initialParams: { tag?: string; difficulty?: string; q?: string; page?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialParams.q ?? "");
  const [difficulty, setDifficulty] = useState(initialParams.difficulty ?? "");
  const [page, setPage] = useState(parseInt(initialParams.page ?? "1", 10) || 1);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (difficulty) params.set("difficulty", difficulty);
  params.set("page", String(page));

  const { data } = useQuery({
    queryKey: ["problems", q, difficulty, page],
    queryFn: () => apiFetch<ProblemListResponse>(`/problems?${params.toString()}`),
    initialData: !q && !difficulty && page === (parseInt(initialParams.page ?? "1", 10) || 1) ? initial : undefined,
  });

  const items = data?.items ?? initial.items;
  const total = data?.total ?? initial.total;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function navigate(nextPage: number) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (difficulty) p.set("difficulty", difficulty);
    p.set("page", String(nextPage));
    setPage(nextPage);
    router.push(`${pathname}?${p.toString()}`);
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    navigate(1);
  }

  return (
    <div>
      <form onSubmit={applyFilters} className="mb-4 flex flex-wrap gap-3">
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
        <button type="submit" className="oj-btn-secondary">
          Filter
        </button>
      </form>

      <table className="oj-table">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Source</th>
            <th>Difficulty</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td className="w-6 text-center">{p.solvedByMe && <span className="text-verdict-ac">✓</span>}</td>
              <td>
                <Link href={`/problems/${p.slug}`} className="font-medium text-ink-50 hover:text-brand">
                  {p.title}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-400">{p.source}</td>
              <td className="font-mono text-xs text-brand">{"★".repeat(p.difficulty)}</td>
              <td className="text-xs text-ink-400">{p.tags.join(", ")}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-ink-400">
                No problems match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between text-sm text-ink-400">
        <span>
          {total} problem{total === 1 ? "" : "s"} · page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(page - 1)}
            disabled={page <= 1}
            className="oj-btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => navigate(page + 1)}
            disabled={page >= totalPages}
            className="oj-btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
