"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CollectionListItem } from "@/lib/types";
import { SkeletonCard } from "@/components/Skeleton";
import { useT } from "@/lib/i18n/LocaleContext";

// Fixed display order for known groupings; any category not listed here (or the "" fallback for
// uncategorized rows) sorts after these, alphabetically among themselves.
const CATEGORY_ORDER = ["考試歷屆", "演算法主題"];
const UNCATEGORIZED = "其他";

function groupByCategory(items: CollectionListItem[]): [string, CollectionListItem[]][] {
  const groups = new Map<string, CollectionListItem[]>();
  for (const item of items) {
    const key = item.category || UNCATEGORIZED;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function CollectionCard({ c }: { c: CollectionListItem }) {
  const t = useT();
  return (
    <Link href={`/collections/${c.slug}`} className="oj-card block p-4 transition-colors hover:border-brand">
      <h3 className="font-display text-lg font-semibold text-ink-50">{c.title}</h3>
      {c.description && <p className="mt-1 text-sm text-ink-400">{c.description}</p>}
      <p className="mt-3 font-mono text-xs text-ink-500">{t("{n} problems", { n: c.problemCount })}</p>
    </Link>
  );
}

export default function CollectionsListClient() {
  const t = useT();
  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => apiFetch<CollectionListItem[]>("/collections"),
  });

  const groups = collections ? groupByCategory(collections) : [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{t("Collections")}</h1>
        <p className="mt-1 text-sm text-ink-400">{t("Curated problem sets to work through at your own pace.")}</p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!isLoading &&
        groups.map(([category, items]) => (
          <section key={category}>
            <div className="mb-4 flex items-baseline justify-between border-b border-ink-800 pb-2">
              <h2 className="font-display text-xl font-bold text-ink-50">{category}</h2>
              <span className="font-mono text-xs text-ink-500">{t("{n} collections", { n: items.length })}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((c) => (
                <CollectionCard key={c.id} c={c} />
              ))}
            </div>
          </section>
        ))}

      {!isLoading && collections?.length === 0 && <p className="text-sm text-ink-400">{t("No collections yet.")}</p>}
    </div>
  );
}
