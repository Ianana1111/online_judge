"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { UserStats } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const LEVELS = [
  "bg-ink-800", // 0
  "bg-brand/25",
  "bg-brand/50",
  "bg-brand/75",
  "bg-brand", // max
];

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 1) return 4;
  const ratio = count / max;
  return Math.min(4, 1 + Math.floor(ratio * 3));
}

const MONTH_KEYS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Cell = { date: string; count: number };

/** Rolling 365-day window ending today — the "Current" option, unchanged from before this
 * component grew a year picker. Local-time day-stepping with a UTC-string key, same as the
 * original implementation (and as the API's own `since` default for no `year` param). */
function rollingDays(): string[] {
  const today = new Date();
  const out: string[] = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** A specific past calendar year, Jan 1 – Dec 31 — stepped entirely in UTC to match the API's
 * own `Date.UTC(year, 0, 1)` / `Date.UTC(year + 1, 0, 1)` range for the `year` query param. */
function yearDays(year: number): string[] {
  const out: string[] = [];
  const cursor = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  while (cursor.getTime() <= end.getTime()) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

type MonthBlock = { key: string; label: string; weeks: (Cell | null)[][] };

/** Each month gets its own mini-grid sized to its own day count (a 28-day month is genuinely
 * narrower than a 31-day one) instead of one continuous week-numbered strip where a column can
 * straddle two months — that's what made every month blur into its neighbors regardless of the
 * gap between columns. `dayList` only contains real in-range days (the two edge months of a
 * rolling window are naturally partial, e.g. day 1 of a leading month may already be a week
 * before the window starts), so grouping by each day's own calendar month and padding to *that*
 * day's actual weekday keeps every date in its correct row even when a month block is partial. */
function buildMonthBlocks(dayList: string[], byDate: Map<string, number>): MonthBlock[] {
  const byMonth = new Map<string, string[]>();
  for (const date of dayList) {
    const key = date.slice(0, 7); // "YYYY-MM"
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(date);
  }

  const blocks: MonthBlock[] = [];
  for (const [key, monthDays] of byMonth) {
    const lead = new Date(monthDays[0]).getDay();
    const cells: (Cell | null)[] = Array.from({ length: lead }, (): Cell | null => null);
    for (const date of monthDays) cells.push({ date, count: byDate.get(date) ?? 0 });
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (Cell | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const month = Number(key.slice(5, 7)) - 1;
    blocks.push({ key, label: MONTH_KEYS[month], weeks });
  }
  return blocks;
}

/** Longest run of *calendar-adjacent* dates with at least one submission — walks actual date
 * gaps rather than array position, since `heatmap` only contains days with count > 0 (a gap of
 * zero-activity days never appears as an element, so array-adjacency alone can't tell a real
 * streak from two unrelated active days days apart). */
export function computeMaxStreak(heatmap: Cell[]): number {
  if (heatmap.length === 0) return 0;
  const sorted = [...heatmap].sort((a, b) => a.date.localeCompare(b.date));
  let max = 1;
  let running = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date + "T00:00:00Z").getTime();
    const cur = new Date(sorted[i].date + "T00:00:00Z").getTime();
    const diffDays = Math.round((cur - prev) / 86_400_000);
    running = diffDays === 1 ? running + 1 : 1;
    max = Math.max(max, running);
  }
  return max;
}

export default function Heatmap({
  handle,
  initialHeatmap,
  joinDate,
}: {
  handle: string;
  initialHeatmap: Cell[];
  joinDate: string;
}) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<"current" | number>("current");

  const currentYear = new Date().getFullYear();
  const joinYear = new Date(joinDate).getFullYear();
  const pastYears = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 1; y >= joinYear; y--) years.push(y);
    return years;
  }, [currentYear, joinYear]);

  const { data: heatmapData, isFetching } = useQuery({
    queryKey: ["heatmap", handle, selected],
    queryFn: async () => {
      if (selected === "current") return initialHeatmap;
      const stats = await apiFetch<UserStats>(`/users/${handle}/stats?year=${selected}`);
      return stats.heatmap;
    },
    staleTime: 60_000,
  });

  const data = heatmapData ?? [];
  const byDate = new Map(data.map((d) => [d.date, d.count]));
  const max = data.reduce((m, d) => Math.max(m, d.count), 0);
  const days = selected === "current" ? rollingDays() : yearDays(selected);
  const blocks = buildMonthBlocks(days, byDate);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.length;
  const maxStreak = computeMaxStreak(data);

  // Land scrolled to the most recent activity (right edge) by default — a wall of empty history
  // on the left is what everyone sees first otherwise, with no hint that scrolling reveals more.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [selected]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-200">
          <span className="font-semibold text-ink-50">{total}</span>{" "}
          {selected === "current" ? t("submissions in the past year") : t("submissions in {year}", { year: selected })}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-400">
          <span>{t("Total active days: {n}", { n: activeDays })}</span>
          <span>{t("Max streak: {n}", { n: maxStreak })}</span>
          {pastYears.length > 0 && (
            <select
              value={String(selected)}
              onChange={(e) => setSelected(e.target.value === "current" ? "current" : Number(e.target.value))}
              className="rounded border border-ink-700 bg-ink-800 px-2 py-1 text-xs text-ink-200"
            >
              <option value="current">{t("Current")}</option>
              {pastYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div ref={scrollRef} className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-50" : ""}`}>
        {/* Each month is its own self-contained column group (grid + label together), laid out
            left to right with a real gap between groups — the gap is structural here, not a
            margin hack on whichever column happens to start a new month. */}
        <div className="inline-flex items-start gap-3">
          {blocks.map((block) => (
            <div key={block.key} className="flex flex-col items-start gap-1">
              <div className="inline-flex gap-1">
                {block.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day, di) =>
                      day ? (
                        <div
                          key={di}
                          title={t("{date}: {count} submissions", { date: day.date, count: day.count })}
                          className={`h-3 w-3 rounded-sm ${LEVELS[levelFor(day.count, max)]}`}
                        />
                      ) : (
                        <div key={di} className="h-3 w-3" />
                      ),
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[10px] leading-none text-ink-500">{t(block.label)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-ink-400">
        <span>{t("Less")}</span>
        {LEVELS.map((l, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${l}`} />
        ))}
        <span>{t("More")}</span>
      </div>
    </div>
  );
}
