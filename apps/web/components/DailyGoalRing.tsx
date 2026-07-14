const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Same ring visual as SolvedRing (progress toward "total"), but labeled for a daily count-toward-
 * goal instead of lifetime solved-toward-catalog — different enough framing that reusing SolvedRing
 * directly would mean fighting its hardcoded "/ {total} solved" label. */
export default function DailyGoalRing({ solvedToday, goal }: { solvedToday: number; goal: number }) {
  const pct = goal > 0 ? Math.min(1, solvedToday / goal) : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  const met = solvedToday >= goal;

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="currentColor" strokeWidth={STROKE} className="text-ink-800" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`transition-[stroke-dashoffset] duration-700 ease-out ${met ? "text-verdict-ac" : "text-brand"}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl font-bold text-ink-50">{solvedToday}</span>
        <span className="text-[10px] text-ink-500">/ {goal} today</span>
      </div>
    </div>
  );
}
