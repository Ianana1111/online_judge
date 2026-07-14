"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-verdict-wa">error</p>
      <h1 className="font-display text-3xl font-bold text-ink-50">Something went wrong</h1>
      <p className="max-w-sm text-sm text-ink-400">
        This page hit an unexpected error. It&apos;s been logged — try again, or head back to the homepage.
      </p>
      <button onClick={reset} className="oj-btn-primary mt-2 px-5 py-2.5">
        Try again
      </button>
    </div>
  );
}
