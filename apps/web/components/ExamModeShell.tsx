"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExamTimerStore, formatDuration } from "@/store/examTimer";

export default function ExamModeShell({
  contestId,
  title,
  endsAtIso,
  homeHref = "/cpe",
  children,
}: {
  contestId: string;
  title: string;
  endsAtIso: string;
  homeHref?: string;
  children: React.ReactNode;
}) {
  const { setWindow, setActive, remainingMs } = useExamTimerStore();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setWindow(contestId, endsAtIso);
    setActive(true);
    return () => setActive(false);
  }, [contestId, endsAtIso, setWindow, setActive]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = remainingMs(now);
  const isOver = remaining <= 0;
  const urgent = remaining > 0 && remaining < 5 * 60 * 1000;

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-ink-800 bg-ink-950/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href={homeHref} className="font-display text-sm font-bold text-ink-50">
            judge<span className="text-brand">.</span>
          </Link>
          <span className="text-sm text-ink-300">{title}</span>
        </div>
        <div
          className={`font-mono text-lg font-semibold tabular-nums ${
            isOver ? "text-ink-500" : urgent ? "text-verdict-wa animate-pulse-soft" : "text-brand"
          }`}
        >
          {isOver ? "Time's up" : formatDuration(remaining)}
        </div>
      </header>

      {isOver && (
        <div className="border-b border-verdict-wa/40 bg-verdict-wa/10 px-4 py-2 text-center text-sm text-verdict-wa">
          Your exam window has ended. Submissions are locked —{" "}
          <Link href={`/contests/${contestId}`} className="underline">
            view the final scoreboard
          </Link>
          .
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
