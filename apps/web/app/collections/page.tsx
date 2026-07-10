"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CollectionListItem } from "@/lib/types";

export default function CollectionsPage() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => apiFetch<CollectionListItem[]>("/collections"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Collections</h1>
        <p className="mt-1 text-sm text-ink-400">Curated problem sets to work through at your own pace.</p>
      </div>

      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {collections?.map((c) => (
          <Link key={c.id} href={`/collections/${c.slug}`} className="oj-card block p-4 transition-colors hover:border-brand">
            <h2 className="font-display text-lg font-semibold text-ink-50">{c.title}</h2>
            {c.description && <p className="mt-1 text-sm text-ink-400">{c.description}</p>}
            <p className="mt-3 font-mono text-xs text-ink-500">{c.problemCount} problems</p>
          </Link>
        ))}
      </div>
      {collections?.length === 0 && <p className="text-sm text-ink-400">No collections yet.</p>}
    </div>
  );
}
