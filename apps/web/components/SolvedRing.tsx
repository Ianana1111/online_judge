const SIZE = 128;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SolvedRing({ solved, total }: { solved: number; total: number }) {
  const pct = total > 0 ? Math.min(1, solved / total) : 0;
  const offset = CIRCUMFERENCE * (1 - pct);

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
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
          className="text-brand transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-2xl font-bold text-ink-50">{solved}</span>
        <span className="text-[11px] text-ink-500">/ {total} solved</span>
      </div>
    </div>
  );
}
