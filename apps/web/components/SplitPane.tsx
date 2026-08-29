"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIsDesktop } from "@/lib/useIsDesktop";

const MIN_PERCENT = 20;

/**
 * Two-pane layout with a draggable divider (desktop only — stacks normally on mobile).
 * Each side is clamped to [MIN_PERCENT, 100 - MIN_PERCENT] so neither can be dragged away entirely.
 *
 * `fullHeight` opts into filling (not just growing to) the container's own height — stretches the
 * pane and both children to `h-full` instead of leaving them their natural content height. Only
 * the standalone problem page (app/problems/[slug]/page.tsx) passes this: it wraps ProblemView in
 * a fixed `100vh`-derived height so the page itself never scrolls, and each side scrolls its own
 * content independently instead. The contest-embedded ProblemView (ContestDetailClient) doesn't
 * pass it, and keeps behaving exactly as it always has — normal document flow, whole-page scroll.
 */
export default function SplitPane({
  left,
  right,
  fullHeight = false,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  fullHeight?: boolean;
}) {
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [leftPercent, setLeftPercent] = useState(50);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftPercent(Math.min(100 - MIN_PERCENT, Math.max(MIN_PERCENT, pct)));
  }, []);

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [onPointerMove, stopDragging]);

  function startDragging() {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  if (!isDesktop) {
    return (
      <div className="space-y-6">
        <div>{left}</div>
        <div>{right}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex w-full items-stretch ${fullHeight ? "h-full min-h-0" : ""}`}>
      <div style={{ flexBasis: `${leftPercent}%` }} className={`min-w-0 overflow-hidden ${fullHeight ? "h-full" : ""}`}>
        {left}
      </div>
      <div
        onPointerDown={startDragging}
        role="separator"
        aria-orientation="vertical"
        className="group flex w-3 shrink-0 cursor-col-resize items-center justify-center"
      >
        <div className="h-full w-px bg-ink-800 transition-colors group-hover:bg-brand group-active:bg-brand" />
      </div>
      <div style={{ flexBasis: `${100 - leftPercent}%` }} className={`min-w-0 flex-1 overflow-hidden ${fullHeight ? "h-full" : ""}`}>
        {right}
      </div>
    </div>
  );
}
