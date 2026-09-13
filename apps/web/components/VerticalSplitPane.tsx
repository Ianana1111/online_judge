"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { useT } from "@/lib/i18n/LocaleContext";

const MIN_PERCENT = 20;

/**
 * SplitPane's vertical counterpart — a draggable divider between a top and bottom pane instead of
 * left/right, used for SubmissionPanel's editor-over-test-panel split on the standalone problem
 * page. Same desktop-only/mobile-stacks-normally behavior, same clamping. Always fills its
 * container's height (there's no non-fullHeight mode here, unlike SplitPane): a vertical split
 * only means something when there's a fixed height to divide up in the first place.
 */
export default function VerticalSplitPane({ top, bottom }: { top: React.ReactNode; bottom: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  // Slightly favors the editor over the test panel by default — writing code is the more
  // space-hungry, more constant activity; the test panel is checked in shorter bursts.
  const [topPercent, setTopPercent] = useState(60);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientY - rect.top) / rect.height) * 100;
    setTopPercent(Math.min(100 - MIN_PERCENT, Math.max(MIN_PERCENT, pct)));
  }, []);

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      if (draggingRef.current) stopDragging();
    };
  }, [onPointerMove, stopDragging]);

  function startDragging() {
    draggingRef.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }

  if (!isDesktop) {
    return (
      <div className="space-y-6">
        <div>{top}</div>
        <div>{bottom}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-col">
      <div style={{ flexBasis: `${topPercent}%` }} className="min-h-0 overflow-hidden">
        {top}
      </div>
      <div
        onPointerDown={startDragging}
        role="separator"
        aria-orientation="horizontal"
        aria-label={t("Resize editor and test cases")}
        tabIndex={0}
        aria-valuemin={MIN_PERCENT}
        aria-valuemax={100 - MIN_PERCENT}
        aria-valuenow={Math.round(topPercent)}
        onKeyDown={(e) => {
          if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
          e.preventDefault();
          setTopPercent((value) => e.key === "Home" ? MIN_PERCENT : e.key === "End" ? 100 - MIN_PERCENT : Math.min(100 - MIN_PERCENT, Math.max(MIN_PERCENT, value + (e.key === "ArrowUp" ? -5 : 5))));
        }}
        className="group flex h-3 shrink-0 cursor-row-resize items-center justify-center"
      >
        <div className="h-px w-full bg-ink-800 transition-colors group-hover:bg-brand group-active:bg-brand" />
      </div>
      <div style={{ flexBasis: `${100 - topPercent}%` }} className="min-h-0 flex-1 overflow-hidden">
        {bottom}
      </div>
    </div>
  );
}
