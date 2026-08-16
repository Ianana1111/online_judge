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

function SittingCard({ contest, dateLabel }: { contest: ContestListItem; dateLabel: string | null }) {
  const t = useT();
  return (
    <Link
      href={`/contests/${contest.id}`}
      className="group oj-card flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-brand"
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
            contest.kind === "CPE" ? "bg-brand/15 text-brand" : "bg-sky-400/15 text-sky-400"
          }`}
        >
          {contest.kind}
        </span>
        {dateLabel && <span className="font-mono text-[11px] text-ink-500">{dateLabel}</span>}
      </div>
      <h3 className="text-sm font-medium text-ink-50 group-hover:text-brand">{contest.title}</h3>
      <p className="mt-auto pt-2 font-mono text-xs text-ink-500">{t("{n} min virtual exam", { n: contest.durationMin })}</p>
    </Link>
  );
}

function ArchiveRow({ contest, dateLabel }: { contest: ContestListItem; dateLabel: string | null }) {
  return (
    <Link
      href={`/contests/${contest.id}`}
      className="flex items-center justify-between gap-3 rounded px-3 py-2 transition-colors hover:bg-ink-800/60"
    >
      <span className="min-w-0 truncate text-sm text-ink-200">{contest.title}</span>
      <span className="flex shrink-0 items-center gap-3">
        {dateLabel && <span className="font-mono text-xs text-ink-500">{dateLabel}</span>}
        <span className="font-mono text-xs text-ink-600">{contest.durationMin}m</span>
      </span>
    </Link>
  );
}

export default function ContestsPage() {
  const t = useT();
  const { user, status: authStatus } = useAuthStore();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab")?.toUpperCase() === "GPE" ? "GPE" : "CPE";
  const [tab, setTab] = useState<"CPE" | "GPE">(initialTab);

  const { data: all, isLoading: allLoading } = useQuery({
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

  const dateLabel = (d: Date | null) => (d ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : null);

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

      {!allLoading && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-200">{t("Latest CPE sittings")}</h2>
              <span className="text-xs text-ink-500">{t("{n} total", { n: cpeSorted.length })}</span>
            </div>
            <div className="grid gap-3">
              {cpeSorted.slice(0, 3).map(({ c, d }) => (
                <SittingCard key={c.id} contest={c} dateLabel={dateLabel(d)} />
              ))}
              {cpeSorted.length === 0 && <p className="text-sm text-ink-400">{t("No CPE sittings loaded yet.")}</p>}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-200">{t("Latest GPE sittings")}</h2>
              <span className="text-xs text-ink-500">{t("{n} total", { n: gpeSorted.length })}</span>
            </div>
            <div className="grid gap-3">
              {gpeSorted.slice(0, 3).map(({ c, d }) => (
                <SittingCard key={c.id} contest={c} dateLabel={dateLabel(d)} />
              ))}
              {gpeSorted.length === 0 && <p className="text-sm text-ink-400">{t("No GPE sittings loaded yet.")}</p>}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-200">{t("Full archive")}</h2>
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
        <div className="oj-card max-h-[480px] overflow-y-auto p-2">
          {activeArchive.map(({ c, d }) => (
            <ArchiveRow key={c.id} contest={c} dateLabel={dateLabel(d)} />
          ))}
          {activeArchive.length === 0 && <p className="p-4 text-center text-sm text-ink-400">{t("Nothing here yet.")}</p>}
        </div>
      </div>
    </div>
  );
}
