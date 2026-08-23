"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { SkeletonList } from "@/components/Skeleton";
import type { ContestListItem, MyContest } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

// CPE/GPE sittings are virtual (no fixed startAt) but their slugs always embed the real exam
// date (e.g. "cpe-2026-05-26", "gpe-2018-01-03-9781") — the one reliable way to sort/label them
// chronologically. Falls back to null for the rare non-dated slug (e.g. the CPE demo sitting),
// which just sorts to the end instead of crashing.
function sittingDate(slug: string): Date | null {
  const m = slug.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function StatusBadge({ status }: { status: "RUNNING" | "FINISHED" }) {
  const t = useT();
  return (
    <span
      className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        status === "RUNNING"
          ? "border-verdict-tle/40 bg-verdict-tle/10 text-verdict-tle"
          : "border-ink-600 bg-ink-800 text-ink-400"
      }`}
    >
      {status === "RUNNING" ? t("In progress") : t("Finished")}
    </span>
  );
}

// A stopwatch bezel rather than a plain circle: every sitting here is a timed run against the
// clock, so the dial is the one shape that actually says what these are. The arc sits at ~72% and
// sweeps closed on hover — "start the clock" — which is also the card's only motion.
const RING_R = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

/** The single newest sitting of one kind, as a stopwatch dial — the page's primary action, since
 * "practise the most recent paper" is what nearly everyone lands here to do. */
function LatestSitting({
  contest,
  date,
  kind,
}: {
  contest: ContestListItem;
  date: Date | null;
  kind: "CPE" | "GPE";
}) {
  const t = useT();
  const accent = kind === "CPE" ? "text-brand" : "text-sky-400";
  const accentBorder = kind === "CPE" ? "hover:border-brand" : "hover:border-sky-400";
  const mmdd = date ? `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}` : "–";

  return (
    <Link
      href={`/contests/${contest.id}`}
      className={`group oj-card flex items-center gap-5 p-5 transition-all hover:-translate-y-0.5 ${accentBorder}`}
    >
      <div className="relative h-[132px] w-[132px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth="3" className="stroke-ink-700" />
          <circle
            cx="50"
            cy="50"
            r={RING_R}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * 0.28}
            className={`${accent} stroke-current transition-[stroke-dashoffset] duration-500 ease-out group-hover:[stroke-dashoffset:0]`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${accent}`}>{kind}</span>
          <span className="font-display text-2xl font-bold tabular-nums text-ink-50">{mmdd}</span>
          <span className="font-mono text-[11px] text-ink-500">{date ? date.getFullYear() : ""}</span>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Latest {kind} sitting", { kind })}</p>
        <h2 className="mt-1 font-display text-lg font-bold text-ink-50">{contest.title}</h2>
        <p className="mt-1 font-mono text-xs text-ink-500">{t("{n} min virtual exam", { n: contest.durationMin })}</p>
        <span className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold ${accent}`}>
          {t("Start exam")} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

/** One past sitting in the archive, reduced to its date — every sitting is 180 minutes and the
 * titles are all "<kind> <date>" restated, so the date is the only thing that distinguishes one
 * row from the next. Chips instead of full-width rows fit ~17 years of papers on screen at once
 * rather than behind a 480px scroll box. */
function ArchiveChip({ contest, date, kind }: { contest: ContestListItem; date: Date | null; kind: "CPE" | "GPE" }) {
  const hover = kind === "CPE" ? "hover:border-brand hover:text-brand" : "hover:border-sky-400 hover:text-sky-400";
  const mmdd = date ? `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}` : "—";
  return (
    <Link
      href={`/contests/${contest.id}`}
      title={contest.title}
      className={`min-w-[86px] rounded border border-ink-700 bg-ink-800/40 px-3 py-2 text-center font-mono text-sm tabular-nums text-ink-200 transition-colors ${hover}`}
    >
      {mmdd}
    </Link>
  );
}

export default function ContestsPage() {
  const t = useT();
  const { user, status: authStatus } = useAuthStore();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab")?.toUpperCase() === "GPE" ? "GPE" : "CPE";
  const [tab, setTab] = useState<"CPE" | "GPE">(initialTab);

  const {
    data: all,
    isLoading: allLoading,
    isError: allIsError,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ["contests", "all"],
    queryFn: () => apiFetch<ContestListItem[]>("/contests"),
  });
  const { data: mine, isLoading: mineLoading } = useQuery({
    queryKey: ["contests", "me"],
    queryFn: () => apiFetch<MyContest[]>("/contests/me"),
    enabled: !!user,
  });

  const { cpeSorted, gpeSorted } = useMemo(() => {
    const withDate = (c: ContestListItem) => ({ c, d: sittingDate(c.slug) });
    const sortDesc = (a: { d: Date | null }, b: { d: Date | null }) => (b.d?.getTime() ?? 0) - (a.d?.getTime() ?? 0);
    const cpe = (all ?? []).filter((c) => c.kind === "CPE").map(withDate).sort(sortDesc);
    const gpe = (all ?? []).filter((c) => c.kind === "GPE").map(withDate).sort(sortDesc);
    return { cpeSorted: cpe, gpeSorted: gpe };
  }, [all]);

  const running = (mine ?? []).filter((c) => c.status === "RUNNING");
  const activeArchive = tab === "CPE" ? cpeSorted : gpeSorted;

  // Sittings run a few times a year, so the year is the unit people actually navigate by ("I want
  // to drill the 2024 papers") — grouping on it turns one 60-row wall into a scannable index.
  const archiveByYear = useMemo(() => {
    const groups = new Map<string, typeof activeArchive>();
    for (const entry of activeArchive) {
      const year = entry.d ? String(entry.d.getFullYear()) : "—";
      const bucket = groups.get(year) ?? [];
      bucket.push(entry);
      groups.set(year, bucket);
    }
    return [...groups.entries()];
  }, [activeArchive]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{t("Contests")}</h1>
        <p className="mt-1 text-sm text-ink-400">
          {t(
            "Every past CPE and GPE sitting, packaged as a timed virtual exam — start one whenever you're ready and it runs its own private countdown, exactly like the real thing.",
          )}
        </p>
      </div>

      {authStatus === "ready" && !user && (
        <div className="oj-card p-6 text-center">
          <p className="text-sm text-ink-300">{t("Log in to start a virtual exam and track your attempts here.")}</p>
          <Link href="/login" className="oj-btn-primary mt-3 inline-block px-4 py-2 text-sm">
            {t("Log in")}
          </Link>
        </div>
      )}

      {user && mineLoading && <SkeletonList rows={2} />}

      {user && running.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-200">{t("Continue where you left off")}</h2>
          <div className="space-y-2">
            {running.map((c) => (
              <Link key={c.id} href={`/contests/${c.id}`} className="oj-card block p-4 transition-colors hover:border-brand">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs uppercase text-ink-500">{c.kind}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <h3 className="font-medium text-ink-50">{c.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-brand">
                      {t("{solved} / {total} solved", { solved: c.solvedCount, total: c.totalProblems })}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-ink-500">{t("resume before it ends")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {allLoading && <SkeletonList rows={3} />}

      {/* Without this, a failed /contests fetch fell through to `all ?? []` everywhere below and
          rendered as "Nothing here yet." — indistinguishable from a genuinely empty archive. */}
      {allIsError && (
        <div className="oj-card flex flex-col items-center gap-2 p-6 text-center">
          <p className="text-sm text-ink-300">{t("Something went wrong")}</p>
          <button type="button" onClick={() => refetchAll()} className="oj-btn-secondary px-4 py-1.5 text-xs">
            {t("Try again")}
          </button>
        </div>
      )}

      {!allLoading && !allIsError && (
        <div className="grid gap-6 lg:grid-cols-2">
          {cpeSorted[0] && <LatestSitting contest={cpeSorted[0].c} date={cpeSorted[0].d} kind="CPE" />}
          {gpeSorted[0] && <LatestSitting contest={gpeSorted[0].c} date={gpeSorted[0].d} kind="GPE" />}
        </div>
      )}

      {!allIsError && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-50">{t("Every past sitting")}</h2>
              <p className="mt-0.5 text-xs text-ink-500">
                {t("{n} papers · 180 minutes each", { n: activeArchive.length })}
              </p>
            </div>
            <div className="flex rounded border border-ink-700 p-0.5">
              {(["CPE", "GPE"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                    tab === k ? "bg-brand text-onbrand" : "text-ink-400 hover:text-ink-100"
                  }`}
                >
                  {k} ({k === "CPE" ? cpeSorted.length : gpeSorted.length})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {archiveByYear.map(([year, sittings]) => (
              <div key={year} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex shrink-0 items-center gap-3 sm:w-20">
                  <span className="font-display text-sm font-bold tabular-nums text-ink-400">{year}</span>
                  <span className="h-px flex-1 bg-ink-800 sm:hidden" />
                </div>
                {/* Wrapping row rather than a fixed grid: a year holds at most ~4 sittings, so
                    grid columns wide enough for the busiest year would leave the rest half-empty,
                    and the column alignment wouldn't mean anything anyway (each year's sittings
                    fall in different months). */}
                <div className="flex flex-1 flex-wrap gap-2">
                  {sittings.map(({ c, d }) => (
                    <ArchiveChip key={c.id} contest={c} date={d} kind={tab} />
                  ))}
                </div>
              </div>
            ))}
            {activeArchive.length === 0 && !allLoading && (
              <p className="oj-card p-4 text-center text-sm text-ink-400">{t("Nothing here yet.")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
