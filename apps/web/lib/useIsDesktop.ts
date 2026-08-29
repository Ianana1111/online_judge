"use client";

import { useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

/** Shared by SplitPane and VerticalSplitPane — both fall back to a plain stacked layout below this
 * breakpoint rather than a draggable-divider one, since a drag handle isn't a sane touch target
 * and a fixed-height split pane isn't a good fit for a small screen either way. */
export function useIsDesktop(): boolean {
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
