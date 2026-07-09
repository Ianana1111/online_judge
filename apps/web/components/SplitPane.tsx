"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_PERCENT = 20;
const DESKTOP_QUERY = "(min-width: 1024px)";

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

/**
 * Two-pane layout with a draggable divider (desktop only — stacks normally on mobile).
 * Each side is clamped to [MIN_PERCENT, 100 - MIN_PERCENT] so neither can be dragged away entirely.
 */
export default function SplitPane({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
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
    <div ref={containerRef} className="flex w-full items-stretch">
      <div style={{ flexBasis: `${leftPercent}%` }} className="min-w-0 overflow-hidden">
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
      <div style={{ flexBasis: `${100 - leftPercent}%` }} className="min-w-0 flex-1 overflow-hidden">
        {right}
      </div>
    </div>
  );
}
