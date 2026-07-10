"use client";

import { useState } from "react";

export default function InfoTooltip({ text }: { text: string }) {
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
        <span className="oj-card absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 whitespace-normal p-2 text-xs font-normal normal-case text-ink-300">
          {text}
        </span>
      )}
    </span>
  );
}
