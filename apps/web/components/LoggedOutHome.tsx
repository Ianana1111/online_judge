"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useT } from "@/lib/i18n/LocaleContext";
import { TerminalIcon, ClockIcon, LayersIcon, FlameIcon } from "@/components/icons";

type DemoVerdict = "AC" | "WA" | "TLE" | "RE" | "CE";

// Reuses the same verdict color tokens as VerdictBadge.tsx, just spelled out locally — this is a
// one-off marketing demo, not worth threading a shared export through for four color strings.
const VERDICT_DEMO: Record<DemoVerdict, { chip: string; color: string; lines: string[]; result: string }> = {
  AC: {
    chip: "border-verdict-ac/50 bg-verdict-ac/15 text-verdict-ac",
    color: "text-verdict-ac",
    lines: ["test 01/04   AC    4ms    1.2MB", "test 02/04   AC    6ms    1.2MB", "test 03/04   AC    5ms    1.2MB", "test 04/04   AC    4ms    1.2MB"],
    result: "verdict: ACCEPTED",
  },
  WA: {
    chip: "border-verdict-wa/50 bg-verdict-wa/15 text-verdict-wa",
    color: "text-verdict-wa",
    lines: ["test 01/04   AC    4ms   1.2MB", "test 02/04   WA    5ms   1.2MB"],
    result: "verdict: WRONG ANSWER\nexpected: 42\ngot:      41",
  },
  TLE: {
    chip: "border-verdict-tle/50 bg-verdict-tle/15 text-verdict-tle",
    color: "text-verdict-tle",
    lines: ["test 01/04   AC    4ms      1.2MB", "test 02/04   AC    6ms      1.2MB", "test 03/04   TLE   2000ms   1.4MB"],
    result: "verdict: TIME LIMIT EXCEEDED",
  },
  RE: {
    chip: "border-verdict-re/50 bg-verdict-re/15 text-verdict-re",
    color: "text-verdict-re",
    lines: ["test 01/04   AC    4ms   1.2MB", "test 02/04   RE    3ms   1.1MB"],
    result: "verdict: RUNTIME ERROR\nsignal: SIGSEGV (segmentation fault)",
  },
  CE: {
    chip: "border-verdict-ce/50 bg-verdict-ce/15 text-verdict-ce",
    color: "text-verdict-ce",
    lines: ["compiling...   failed", "", "main.cpp:14:5: error: expected ';' before 'return'"],
    result: "verdict: COMPILE ERROR",
  },
};

/** Click a verdict, watch the terminal output change to match — the exact output format a real
 * submission produces, not a static screenshot. */
function JudgeDemo() {
  const [verdict, setVerdict] = useState<DemoVerdict>("AC");
  const demo = VERDICT_DEMO[verdict];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(Object.keys(VERDICT_DEMO) as DemoVerdict[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setVerdict(key)}
            className={`rounded border px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors ${
              verdict === key ? VERDICT_DEMO[key].chip : "border-ink-700 text-ink-500 hover:border-ink-500"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="oj-card p-4 font-mono text-[11px] leading-relaxed text-ink-400">
        <pre className="whitespace-pre-wrap">{demo.lines.join("\n")}</pre>
        <pre className={`mt-2 whitespace-pre-wrap font-semibold ${demo.color}`}>{demo.result}</pre>
      </div>
    </div>
  );
}

const EXAM_PROBLEMS: { label: string; minute: number }[] = [
  { label: "A", minute: 4 },
  { label: "B", minute: 12 },
  { label: "C", minute: 27 },
  { label: "D", minute: 41 },
];

/** Mark problems solved and watch the penalty clock run — the same ICPC rule the real scoreboard
 * uses: a problem you solve late costs more than one you solve early. */
function ExamDemo() {
  const t = useT();
  const [solved, setSolved] = useState<Record<string, boolean>>({ A: true });
  const solvedList = EXAM_PROBLEMS.filter((p) => solved[p.label]);
  const penalty = solvedList.reduce((sum, p) => sum + p.minute, 0);
  return (
    <div>
      <div className="mb-3 flex gap-2">
        {EXAM_PROBLEMS.map((p) => {
          const on = !!solved[p.label];
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setSolved((s) => ({ ...s, [p.label]: !s[p.label] }))}
              className={`flex h-10 w-10 items-center justify-center rounded border font-mono text-sm font-bold transition-colors ${
                on ? "border-verdict-ac/50 bg-verdict-ac/15 text-verdict-ac" : "border-ink-700 text-ink-400 hover:border-brand"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="oj-card flex items-center justify-between p-4 font-mono text-sm">
        <span className="text-ink-300">{t("Solved {n}/{total}", { n: solvedList.length, total: EXAM_PROBLEMS.length })}</span>
        <span className="text-brand">{t("+{min} min penalty", { min: penalty })}</span>
      </div>
      <p className="mt-2 text-xs text-ink-500">{t("Click a problem to mark it solved — the later you solve it, the more it costs.")}</p>
    </div>
  );
}

const SAMPLE_PROBLEMS = [
  { title: "The 3n + 1 Problem", difficulty: 1, appearances: 2 },
  { title: "Ugly Numbers", difficulty: 2, appearances: 5 },
  { title: "The Skyline Problem", difficulty: 3, appearances: 1 },
  { title: "Maximum Sum", difficulty: 4, appearances: 4 },
];

/** Toggle the sort order and watch the same four problems reshuffle — difficulty alone doesn't
 * tell you what's worth grinding; how often it's actually shown up on a real exam does. */
function AppearanceDemo() {
  const t = useT();
  const [sortBy, setSortBy] = useState<"difficulty" | "appearances">("appearances");
  const rows = [...SAMPLE_PROBLEMS].sort((a, b) =>
    sortBy === "difficulty" ? a.difficulty - b.difficulty : b.appearances - a.appearances,
  );
  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setSortBy("difficulty")}
          className={sortBy === "difficulty" ? "oj-btn-primary px-3 py-1 text-xs" : "oj-btn-secondary px-3 py-1 text-xs"}
        >
          {t("By difficulty")}
        </button>
        <button
          type="button"
          onClick={() => setSortBy("appearances")}
          className={sortBy === "appearances" ? "oj-btn-primary px-3 py-1 text-xs" : "oj-btn-secondary px-3 py-1 text-xs"}
        >
          {t("By exam appearances")}
        </button>
      </div>
      <div className="oj-card divide-y divide-ink-800">
        {rows.map((p) => (
          <div key={p.title} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="text-ink-200">{t(p.title)}</span>
            <span className="font-mono text-xs text-ink-500">
              {sortBy === "difficulty" ? "★".repeat(p.difficulty) : t("{n}x in past exams", { n: p.appearances })}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-500">{t("Illustrative example — full appearance data is a Pro feature.")}</p>
    </div>
  );
}

/** Click a day to toggle it, same as a real solve — miss one and the streak breaks, exactly like
 * the tracker on your own dashboard. */
function StreakDemo() {
  const t = useT();
  const [days, setDays] = useState<boolean[]>([true, true, false, true, true, true, false]);
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (!days[i]) break;
    streak++;
  }
  return (
    <div>
      <div className="mb-3 flex gap-1.5">
        {days.map((on, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            onClick={() => setDays((d) => d.map((v, j) => (j === i ? !v : v)))}
            className={`h-8 w-8 rounded transition-colors ${on ? "bg-verdict-ac" : "bg-ink-800 hover:bg-ink-700"}`}
          />
        ))}
      </div>
      <div className="oj-card flex items-center gap-2 p-4">
        <FlameIcon className={`h-5 w-5 ${streak > 0 ? "text-verdict-tle" : "text-ink-600"}`} />
        <span className="font-mono text-sm text-ink-200">{t("{n}-day streak", { n: streak })}</span>
      </div>
      <p className="mt-2 text-xs text-ink-500">{t("Click a day to toggle it — break the chain and it resets, same as the real thing.")}</p>
    </div>
  );
}

const FEATURES: { icon: typeof TerminalIcon; title: string; body: string; Demo: () => ReactElement }[] = [
  {
    icon: TerminalIcon,
    title: "Judged exactly like the real exam",
    body: "Every problem is calibrated against what the exam itself actually accepts. Pick a verdict below — it's the exact output format a real submission produces.",
    Demo: JudgeDemo,
  },
  {
    icon: ClockIcon,
    title: "Timed virtual exams, real ICPC penalties",
    body: "Same 3-hour, 7-problem pacing as the real CPE, and the same penalty-minute rule the actual scoreboard uses.",
    Demo: ExamDemo,
  },
  {
    icon: LayersIcon,
    title: "Sorted by what actually gets tested",
    body: "Every problem tracks how many times it's shown up on past CPE/GPE exams, not just how hard it is — so you know exactly where to spend your time.",
    Demo: AppearanceDemo,
  },
  {
    icon: FlameIcon,
    title: "Keep a streak, climb the leaderboard",
    body: "Solve something every day to keep your streak alive, and see how you stack up against other students.",
    Demo: StreakDemo,
  },
];

/** The original marketing homepage, self-gated to hide once a session is confirmed —
 * HomeDashboard takes over for logged-in visitors. Renders from the server component and toggles
 * client-side on the same auth check NavBar already uses, so there's no server/client branching
 * needed in the page itself. */
export default function LoggedOutHome({ total }: { total: number }) {
  const t = useT();
  const { user, status } = useAuthStore();
  if (status === "ready" && user) return null;

  return (
    <div className="space-y-16">
      {/* Just the welcome row — no terminal mockup here anymore, that idea now lives inside the
          first feature demo below instead of being shown twice. The headline uses font-statement
          (STIX Two Text / Noto Serif TC), not font-display (Space Grotesk / Noto Sans TC):
          Space Grotesk's geometric letterforms have no CJK glyphs, so Chinese text elsewhere on
          this page falls back to a plain generic sans — a mismatch that doesn't apply here since
          "Welcome to Judge." is always English (see below), but the serif is kept for visual
          continuity with the rest of the page's headings. tracking-normal overrides the sitewide
          tracking-tight on h1 (globals.css), tuned for Latin type and too cramped for CJK
          headings elsewhere on this page. */}
      <section className="relative overflow-hidden rounded-2xl border border-brand/20 bg-ink-900 p-6 sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.11]"
          style={{ background: "radial-gradient(circle at 6% 0%, rgb(var(--brand)) 0%, transparent 58%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ background: "radial-gradient(circle at 100% 100%, rgb(var(--verdict-ac)) 0%, transparent 52%)" }}
        />

        <div className="relative max-w-xl">
          <p className="flex items-center gap-2 text-xs text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-verdict-ac" />
            {t("Judge online · {total}+ problems indexed", { total })}
          </p>
          {/* Never run through t() — like the "judge." wordmark in NavBar, this is a fixed brand
              moment, not translated content. The text itself is always in the DOM (see
              .hero-typewriter in globals.css); only the reveal is animated. */}
          <h1 className="mt-4 font-statement text-4xl font-bold tracking-normal text-ink-50 sm:text-5xl">
            <span className="hero-typewriter">Welcome to Judge.</span>
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
      </section>

      {/* Four real, working parts of the product, alternating sides so the row itself signals
          "these are four distinct things," not a repeated template. Each demo is the actual
          interaction pattern used elsewhere in the app (verdict colors, ICPC penalty math,
          appearance-count sorting, streak tracking) — a visitor can act on all four before ever
          creating an account. */}
      <section className="space-y-6">
        <div>
          <h2 className="font-statement text-2xl font-bold text-ink-50">{t("What you can actually do here")}</h2>
          <p className="mt-1 text-sm text-ink-400">{t("These are working parts of the product, not screenshots — try clicking them.")}</p>
        </div>
        <div className="space-y-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="oj-panel grid gap-6 p-6 sm:grid-cols-2 sm:items-center">
              <div className={i % 2 === 1 ? "sm:order-2" : ""}>
                <f.icon className="h-6 w-6 text-brand" />
                <h3 className="mt-3 text-lg font-semibold text-ink-50">{t(f.title)}</h3>
                <p className="mt-2 text-sm text-ink-400">{t(f.body)}</p>
              </div>
              <div className={i % 2 === 1 ? "sm:order-1" : ""}>
                <f.Demo />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
