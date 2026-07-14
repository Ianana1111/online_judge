/** A pulsing placeholder block — same visual language as the lazy-load placeholders already used
 * for Monaco/recharts (see CodeEditor/StatChartsLoader), reused here for route-level loading.tsx
 * files instead of bare "Loading…" text. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-800 ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`oj-card animate-pulse space-y-3 p-4 ${className}`}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function SkeletonGrid({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
