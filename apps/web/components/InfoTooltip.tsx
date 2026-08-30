"use client";

import { useState } from "react";

// Which edge of the "?" icon the popover hangs off. "center" (the default) works fine as long as
// there's roughly w-56's worth of room on both sides — false for a tooltip on the rightmost (or
// leftmost) column of a table, where centering a fixed-width box under an icon flush against that
// edge pushes half of it past the table/viewport boundary, clipping/covering its own text.
type Align = "left" | "center" | "right";

const POPOVER_POSITION: Record<Align, string> = {
  left: "left-0",
  center: "left-1/2 -translate-x-1/2",
  right: "right-0",
};

export default function InfoTooltip({ text, align = "center" }: { text: string; align?: Align }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-ink-500 text-[9px] font-bold normal-case text-ink-500 hover:border-brand hover:text-brand"
      >
        ?
      </span>
      {open && (
        <span
          className={`oj-card absolute top-full z-10 mt-2 w-56 whitespace-normal p-2 text-xs font-normal normal-case text-ink-300 ${POPOVER_POSITION[align]}`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
