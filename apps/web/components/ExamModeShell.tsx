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
  solvedCount,
  totalProblems,
  onEnd,
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
  /** Shown in the end-early confirmation dialog's progress summary. Omit either to skip the
   * "end exam" control entirely (e.g. a scheduled group sitting, which can't be shortened by one
   * participant — see ContestsService.endAttempt). */
  solvedCount?: number;
  totalProblems?: number;
  onEnd?: () => Promise<void>;
  children: React.ReactNode;
}) {
  const t = useT();
  const { setWindow, setActive, remainingMs } = useExamTimerStore();
  const [now, setNow] = useState(Date.now());
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    setWindow(contestId, endsAtIso);
    setActive(true);
    return () => setActive(false);
  }, [contestId, endsAtIso, setWindow, setActive]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Leaving the tab doesn't stop the clock (the countdown is server-authoritative, not tied to
  // this page being open) — warn before an accidental close/refresh so nobody loses track of a
  // window they're still meant to be answering inside of.
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (remainingMs() <= 0) return; // time's already up — nothing left to warn about
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [remainingMs]);

  const remaining = remainingMs(now);
  const isOver = remaining <= 0;
  const urgent = remaining > 0 && remaining < 5 * 60 * 1000;

  async function confirmEnd() {
    if (!onEnd) return;
    setEnding(true);
    try {
      await onEnd();
    } finally {
      setEnding(false);
      setConfirmingEnd(false);
    }
  }

  return (
    <div className={`bg-ink-950 ${fullHeight ? "flex h-[calc(100vh-3rem)] flex-col overflow-hidden" : "min-h-screen"}`}>
      <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-ink-800 bg-ink-950/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href={homeHref} className="font-display text-sm font-bold text-ink-50">
            judge<span className="text-brand">.</span>
          </Link>
          <span className="text-sm text-ink-300">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {onEnd && !isOver && (
            <button
              type="button"
              onClick={() => setConfirmingEnd(true)}
              className="rounded border border-ink-700 px-2.5 py-1 text-xs font-medium text-ink-400 transition-colors hover:border-verdict-wa/50 hover:text-verdict-wa"
            >
              {t("End exam")}
            </button>
          )}
          <div
            className={`font-mono text-lg font-semibold tabular-nums ${
              isOver ? "text-ink-500" : urgent ? "text-verdict-wa animate-pulse-soft" : "text-brand"
            }`}
          >
            {isOver ? t("Time's up") : formatDuration(remaining)}
          </div>
        </div>
      </header>

      {confirmingEnd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/70 p-4" role="dialog" aria-modal="true">
          <div className="oj-card w-full max-w-sm p-5">
            <h2 className="mb-2 font-display text-lg font-bold text-ink-50">{t("End this exam now?")}</h2>
            <p className="mb-4 text-sm text-ink-300">
              {solvedCount !== undefined && totalProblems !== undefined
                ? t("You've solved {solved}/{total} with {remaining} left on the clock. This finalizes your score for this attempt and can't be undone.", {
                    solved: solvedCount,
                    total: totalProblems,
                    remaining: formatDuration(remaining),
                  })
                : t("This finalizes your score for this attempt and can't be undone.")}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingEnd(false)}
                disabled={ending}
                className="oj-btn-secondary px-3 py-1.5 text-sm"
              >
                {t("Keep going")}
              </button>
              <button type="button" onClick={confirmEnd} disabled={ending} className="oj-btn-primary px-3 py-1.5 text-sm">
                {ending ? t("Ending…") : t("End exam")}
              </button>
            </div>
          </div>
        </div>
      )}

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
