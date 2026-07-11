"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CollectionDetail } from "@/lib/types";
import ProblemFilterTable from "@/components/ProblemFilterTable";

export default function CollectionDetailClient({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["collections", slug],
    queryFn: () => apiFetch<CollectionDetail>(`/collections/${slug}`),
  });

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

      <ProblemFilterTable problems={data.problems} />
    </div>
  );
}
