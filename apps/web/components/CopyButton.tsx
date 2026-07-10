"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-50"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
            <path d="M2.5 10.5v-7a1 1 0 0 1 1-1h7" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
