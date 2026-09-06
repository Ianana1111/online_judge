"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import type { DailyProblem } from "@/lib/types";
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
    body: "Filter by difficulty, or by how often a problem has shown up on past CPE/GPE exams — so you know exactly where to spend your time.",
  },
];

/** The original marketing homepage (hero + recent problems), self-gated to hide once a session is
 * confirmed — HomeDashboard takes over for logged-in visitors. Both pieces render from the server
 * component and toggle client-side on the same auth check NavBar already uses, so there's no
 * server/client branching needed in the page itself. */
export default function LoggedOutHome({ total, daily }: { total: number; daily: DailyProblem | null }) {
  const t = useT();
  const { user, status } = useAuthStore();
  if (status === "ready" && user) return null;

  return (
    <div className="space-y-16">
      {/* Same hero-panel treatment (rounded-2xl, brand hairline, dual radial wash) as
          HomeDashboard's logged-in hero — so the very first thing a visitor sees already looks
          like the product they'll land in after signing up, not a bolted-on marketing page.
          The headline uses font-statement (STIX Two Text / Noto Serif TC), not font-display
          (Space Grotesk / Noto Sans TC): Space Grotesk's distinctive geometric letterforms have
          no CJK glyphs, so every Chinese character was silently falling back to a plain generic
          sans sitting right next to it — the mismatch users were reacting to as "the Chinese text
          looks ugly." The serif pair already reads as intentional here (see ProblemView.tsx),
          and doubles as a nod to "these are real past exam papers." tracking-normal overrides the
          sitewide tracking-tight on h1 (globals.css), which is tuned for Latin type and just
          cramps full-width CJK glyphs.
          "Welcome to Judge." is deliberately never run through t() — like the "judge." wordmark
          in NavBar, it's a brand moment, not content, so it stays fixed in every locale. */}
      <section className="relative overflow-hidden rounded-2xl border border-brand/20 bg-ink-900 p-6 sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.11]"
          style={{ background: "radial-gradient(circle at 6% 0%, rgb(var(--brand)) 0%, transparent 58%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ background: "radial-gradient(circle at 100% 100%, rgb(var(--verdict-ac)) 0%, transparent 52%)" }}
        />

        <div className="relative grid gap-10 sm:grid-cols-[1.2fr_1fr] sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs text-ink-400">
              <span className="h-1.5 w-1.5 rounded-full bg-verdict-ac" />
              {t("Judge online · {total}+ problems indexed", { total })}
            </p>
            <h1 className="mt-4 font-statement text-4xl font-bold tracking-normal text-ink-50 sm:text-5xl">
              Welcome to Judge.
            </h1>
            <p className="mt-5 max-w-md text-ink-300">
              {t(
                "Timed CPE/GPE virtual exams, an ICPC-style scoreboard with real penalty minutes — the same pressure you'll feel on exam day, not a simplified stand-in.",
              )}
            </p>
            <div className="mt-7 flex gap-3">
              <Link href="/problems" className="oj-btn-primary px-5 py-2.5">
                {t("Browse problems")}
              </Link>
              <Link href="/contests" className="oj-btn-secondary px-5 py-2.5">
                {t("Start a virtual exam")}
              </Link>
            </div>
          </div>

          {/* A graded verdict slip, not a generic dashboard screenshot: the AC stamp (styled off
              VerdictBadge's own AC classes, just larger and rotated like an ink stamp) sits on
              top of the same judge-terminal output the product actually produces. */}
          <div className="relative">
            <div className="absolute -right-2 -top-3 z-10 rotate-[-7deg] rounded border-2 border-verdict-ac/50 bg-ink-950 px-3 py-1 font-mono text-sm font-bold uppercase tracking-wide text-verdict-ac">
              AC ✓
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
          </div>
        </div>
      </section>

      {/* One rubric sheet with internal dividers, not three identical floating cards — reads as
          a graded breakdown of what this platform gets right, rather than a generic feature grid. */}
      <section className="oj-panel grid divide-y divide-ink-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {FEATURES.map((f) => (
          <div key={f.title} className="p-6">
            <h3 className="font-medium text-ink-50">{t(f.title)}</h3>
            <p className="mt-2 text-sm text-ink-400">{t(f.body)}</p>
          </div>
        ))}
      </section>

      {/* A single concrete problem to try right now beats a "recent problems" list an anonymous
          visitor has no reason to care about — recency isn't a meaningful axis on a first visit.
          This is the same daily pick every visitor sees today (ProblemsService.dailyPick, no
          login required to read it) — a shared, low-friction hook, and one the product doesn't
          surface anywhere else yet. The statement itself is fully public; SubmissionPanel is what
          actually gates on login (its own "log in to submit" prompt), so this naturally funnels
          someone who's already invested time reading the problem straight into that prompt. */}
      {daily && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-50">{t("Today's problem")}</h2>
            <Link href="/problems" className="text-sm text-brand hover:underline">
              {t("Browse all {total}+ →", { total })}
            </Link>
          </div>
          <Link
            href={`/problems/${daily.slug}`}
            className="oj-card flex flex-col gap-4 p-6 transition-colors hover:border-brand sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <span className="h-1.5 w-1.5 rounded-full bg-verdict-pending" />
                {t("The same one for everyone, all day.")}
              </div>
              <h3 className="mt-2 font-statement text-2xl font-semibold text-ink-50">{daily.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                <span className="font-mono">{daily.source}</span>
                <span className="font-mono text-brand">{"★".repeat(daily.difficulty)}</span>
                {daily.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded border border-ink-700 px-1.5 py-0.5 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="oj-btn-primary shrink-0 px-5 py-2.5 text-sm">{t("Take today's challenge →")}</span>
          </Link>
        </section>
      )}
    </div>
  );
}
