"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ProblemListResponse } from "@/lib/types";

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

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (difficulty) params.set("difficulty", difficulty);
  params.set("page", "1");

  const { data } = useQuery({
    queryKey: ["problems", q, difficulty],
    queryFn: () => apiFetch<ProblemListResponse>(`/problems?${params.toString()}`),
    initialData: !q && !difficulty ? initial : undefined,
  });

  const items = data?.items ?? initial.items;

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    router.push(`${pathname}?${params.toString()}`);
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
    </div>
  );
}
