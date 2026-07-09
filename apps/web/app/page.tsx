import Link from "next/link";
import { serverFetch } from "@/lib/serverApi";
import type { ProblemListResponse } from "@/lib/types";

export default async function HomePage() {
  const problems = await serverFetch<ProblemListResponse>("/problems?page=1");
  const items = problems?.items?.slice(0, 6) ?? [];

  return (
    <div className="space-y-12">
      <section className="grid gap-8 py-10 sm:grid-cols-[1.3fr_1fr] sm:items-center">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand">accepted / wrong answer / tle</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-ink-50 sm:text-5xl">
            Practice UVa.
            <br />
            Sit CPE for real.
          </h1>
          <p className="mt-4 max-w-md text-ink-300">
            A judge built around the 3-hour, 7-problem CPE format — solve at your own pace, or start a
            timed virtual exam with a real scoreboard and ICPC-style penalties.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/problems" className="oj-btn-primary px-5 py-2.5">
              Browse problems
            </Link>
            <Link href="/cpe" className="oj-btn-secondary px-5 py-2.5">
              Start a CPE exam
            </Link>
          </div>
        </div>
        <div className="oj-card p-5 font-mono text-xs leading-relaxed text-ink-400">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-verdict-ac" />
            <span className="h-2.5 w-2.5 rounded-full bg-verdict-tle" />
            <span className="h-2.5 w-2.5 rounded-full bg-verdict-wa" />
          </div>
          <pre className="whitespace-pre-wrap text-ink-300">{`> submit main.cpp
compiling...        ok (0.4s)
test 01/04          AC   4ms   1.2MB
test 02/04          AC   6ms   1.2MB
test 03/04          AC   5ms   1.2MB
test 04/04          AC   4ms   1.2MB

verdict: ACCEPTED`}</pre>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-50">Recent problems</h2>
          <Link href="/problems" className="text-sm text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && <p className="text-sm text-ink-400">No problems yet — check back soon.</p>}
          {items.map((p) => (
            <Link key={p.id} href={`/problems/${p.slug}`} className="oj-card p-4 transition-colors hover:border-brand">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-xs text-ink-500">{p.source}</span>
                <span className="font-mono text-xs text-brand">{"★".repeat(p.difficulty)}</span>
              </div>
              <h3 className="font-medium text-ink-50">{p.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
