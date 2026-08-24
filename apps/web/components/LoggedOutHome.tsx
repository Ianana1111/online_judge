"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import type { ProblemListItem } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const FEATURES = [
  {
    title: "Judged like the real exam",
    body: "Every problem is calibrated against what the exam itself actually accepts — the result you see here is the result you'd see on exam day, not a guess.",
  },
  {
    title: "A scoreboard that behaves like contest day",
    body: "ICPC-style scoring, penalty minutes, and a freeze period — the same rules that decide the real ranking, not a simplified stand-in.",
  },
  {
    title: "Sorted by what actually gets tested",
    body: "Filter by difficulty, or by how often a problem has shown up on past CPE exams — so you know exactly where to spend your time.",
  },
];

/** The original marketing homepage (hero + recent problems), self-gated to hide once a session is
 * confirmed — HomeDashboard takes over for logged-in visitors. Both pieces render from the server
 * component and toggle client-side on the same auth check NavBar already uses, so there's no
 * server/client branching needed in the page itself. */
export default function LoggedOutHome({ items, total }: { items: ProblemListItem[]; total: number }) {
  const t = useT();
  const { user, status } = useAuthStore();
  if (status === "ready" && user) return null;

  return (
    <div className="space-y-16">
      <section className="grid gap-10 py-10 sm:grid-cols-[1.25fr_1fr] sm:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t("CPE Judge")}
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink-50 sm:text-5xl">
            {t("This is CPE Judge.")}
            <br />
            {t("Train like it's exam day.")}
          </h1>
          <p className="mt-4 max-w-md text-ink-300">
            {t(
              "{total}+ practice problems, timed CPE/GPE virtual exams, and a live scoreboard with real ICPC-style penalties — prepare at the exact pace of the real thing.",
              { total },
            )}
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/problems" className="oj-btn-primary px-5 py-2.5">
              {t("Browse problems")}
            </Link>
            <Link href="/cpe" className="oj-btn-secondary px-5 py-2.5">
              {t("Start a CPE exam")}
            </Link>
          </div>
        </div>
        <div className="oj-card p-5 font-mono text-xs leading-relaxed text-ink-400">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-verdict-ac" />
              <span className="h-2.5 w-2.5 rounded-full bg-verdict-tle" />
              <span className="h-2.5 w-2.5 rounded-full bg-verdict-wa" />
            </div>
            <span className="text-[10px] tracking-wide text-ink-500">{t("contest clock · 02:57:12")}</span>
          </div>
          <pre className="whitespace-pre-wrap text-ink-300">{`$ submit C.cpp --contest cpe
compiling...        ok (0.4s)
test 01/04          AC   4ms   1.2MB
test 02/04          AC   6ms   1.2MB
test 03/04          AC   5ms   1.2MB
test 04/04          AC   4ms   1.2MB

verdict: ACCEPTED
penalty: +0 min`}</pre>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="oj-panel p-5">
            <h3 className="font-medium text-ink-50">{t(f.title)}</h3>
            <p className="mt-2 text-sm text-ink-400">{t(f.body)}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-50">{t("Recent problems")}</h2>
          <Link href="/problems" className="text-sm text-brand hover:underline">
            {t("View all →")}
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && <p className="text-sm text-ink-400">{t("No problems yet — check back soon.")}</p>}
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
