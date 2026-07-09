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

export default function Heatmap({ data }: { data: { date: string; count: number }[] }) {
  const byDate = new Map(data.map((d) => [d.date, d.count]));
  const max = data.reduce((m, d) => Math.max(m, d.count), 0);

  const today = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, count: byDate.get(iso) ?? 0 });
  }
  // pad to a full week grid starting on Sunday
  const lead = new Date(days[0].date).getDay();
  const padded = Array.from({ length: lead }, () => null as null | { date: string; count: number }).concat(days);
  const weeks: (null | { date: string; count: number })[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  title={`${day.date}: ${day.count} submission${day.count === 1 ? "" : "s"}`}
                  className={`h-3 w-3 rounded-sm ${LEVELS[levelFor(day.count, max)]}`}
                />
              ) : (
                <div key={di} className="h-3 w-3" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-ink-400">
        <span>Less</span>
        {LEVELS.map((l, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${l}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
