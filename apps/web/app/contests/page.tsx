import Link from "next/link";
import { serverFetch } from "@/lib/serverApi";
import type { ContestListItem } from "@/lib/types";

export default async function ContestsPage() {
  const contests = (await serverFetch<ContestListItem[]>("/contests")) ?? [];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">Contests</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {contests.map((c) => (
          <Link key={c.id} href={`/contests/${c.id}`} className="oj-card p-4 transition-colors hover:border-brand">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-ink-500">{c.kind}</span>
              <span className="font-mono text-xs text-ink-400">{c.durationMin} min</span>
            </div>
            <h3 className="font-medium text-ink-50">{c.title}</h3>
          </Link>
        ))}
        {contests.length === 0 && <p className="text-sm text-ink-400">No contests yet.</p>}
      </div>
    </div>
  );
}
