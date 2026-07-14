import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-brand">404 / not found</p>
      <h1 className="font-display text-3xl font-bold text-ink-50">This page doesn&apos;t exist</h1>
      <p className="max-w-sm text-sm text-ink-400">
        The problem, contest, or page you&apos;re looking for isn&apos;t here — it may have been moved or never existed.
      </p>
      <div className="mt-2 flex gap-3">
        <Link href="/" className="oj-btn-primary px-5 py-2.5">
          Go home
        </Link>
        <Link href="/problems" className="oj-btn-secondary px-5 py-2.5">
          Browse problems
        </Link>
      </div>
    </div>
  );
}
