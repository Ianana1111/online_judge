import Link from "next/link";
import { serverFetch } from "@/lib/serverApi";
import type { ContestListItem } from "@/lib/types";

export default async function CpePage() {
  const contests = (await serverFetch<ContestListItem[]>("/contests")) ?? [];
  const cpeContests = contests.filter((c) => c.kind === "CPE");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-50">CPE 專區</h1>
        <p className="mt-1 text-sm text-ink-400">
          Past 大學程式能力檢定 sittings, packaged as 3-hour / 7-problem virtual exams. Starting one begins
          your own private countdown — take it whenever you're ready.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cpeContests.map((c) => (
          <Link key={c.id} href={`/contests/${c.id}`} className="oj-card p-4 transition-colors hover:border-brand">
            <p className="mb-1 font-mono text-xs uppercase text-ink-500">Virtual exam</p>
            <h3 className="font-medium text-ink-50">{c.title}</h3>
            <p className="mt-1 font-mono text-xs text-ink-400">{c.durationMin} minutes</p>
          </Link>
        ))}
        {cpeContests.length === 0 && <p className="text-sm text-ink-400">No CPE sittings loaded yet.</p>}
      </div>
    </div>
  );
}
