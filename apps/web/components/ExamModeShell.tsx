"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExamTimerStore, formatDuration } from "@/store/examTimer";
import { useT } from "@/lib/i18n/LocaleContext";

export default function ExamModeShell({
  contestId,
  title,
  endsAtIso,
  homeHref = "/cpe",
  fullHeight = false,
  children,
}: {
  contestId: string;
  title: string;
  endsAtIso: string;
  homeHref?: string;
  /** For viewing a single problem (the LeetCode-style split-pane workspace, same as the standalone
   * problem page) — fills exactly one viewport with no page-level scroll, letting the problem's own
   * left/right panes scroll independently instead. Not used for the problem-list/scoreboard view,
   * which is a normal, arbitrarily-tall page and should scroll like one. A flex column rather than
   * a fixed calc() for the header's height: that height isn't a stable constant the way NavBar's
   * 56px is elsewhere, so let flexbox absorb whatever it actually renders at instead of guessing. */
  fullHeight?: boolean;
  children: React.ReactNode;
}) {
  const t = useT();
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
    <div className={`bg-ink-950 ${fullHeight ? "flex h-[calc(100vh-3rem)] flex-col overflow-hidden" : "min-h-screen"}`}>
      <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-ink-800 bg-ink-950/95 px-4 py-2.5 backdrop-blur">
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
          {isOver ? t("Time's up") : formatDuration(remaining)}
        </div>
      </header>

      {isOver && (
        <div className="shrink-0 border-b border-verdict-wa/40 bg-verdict-wa/10 px-4 py-2 text-center text-sm text-verdict-wa">
          {t("Your exam window has ended. Submissions are locked —")}{" "}
          <Link href={`/contests/${contestId}`} className="underline">
            {t("view the final scoreboard")}
          </Link>
          .
        </div>
      )}

      <div
        className={`mx-auto w-full max-w-[1400px] px-6 ${fullHeight ? "min-h-0 flex-1 overflow-hidden py-3" : "py-6"}`}
      >
        {children}
      </div>
    </div>
  );
}
