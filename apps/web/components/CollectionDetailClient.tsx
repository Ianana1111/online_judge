"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CollectionDetail } from "@/lib/types";

export default function CollectionDetailClient({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["collections", slug],
    queryFn: () => apiFetch<CollectionDetail>(`/collections/${slug}`),
  });

  const total = data?.problems.length ?? 0;
  const solved = data?.problems.filter((p) => p.solvedByMe).length ?? 0;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  if (isLoading) return <p className="text-sm text-ink-400">Loading…</p>;
  if (!data) return <p className="text-sm text-verdict-wa">Collection not found.</p>;

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

      <table className="oj-table">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Source</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {data.problems.map((p) => (
            <tr key={p.id}>
              <td className="w-6 text-center">{p.solvedByMe && <span className="text-verdict-ac">✓</span>}</td>
              <td>
                <Link href={`/problems/${p.slug}`} className="font-medium text-ink-50 hover:text-brand">
                  {p.title}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-400">{p.source}</td>
              <td className="font-mono text-xs text-brand">{"★".repeat(p.difficulty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
