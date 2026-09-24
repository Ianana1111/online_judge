"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/LocaleContext";

const DISCORD_WIDGET_URL = "https://discord.com/widget?id=1542874383322972262&theme=dark";

export default function DiscordLink() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("Join our Discord")}
        aria-expanded={open}
        aria-controls="discord-widget-panel"
        title={t("Join our Discord")}
        className="flex h-7 w-7 items-center justify-center rounded text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.891.076.076 0 0 0-.04.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.673-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418Zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.212 0 2.176 1.096 2.157 2.42 0 1.333-.945 2.418-2.157 2.418Z" />
        </svg>
      </button>
      {open && (
        <div
          id="discord-widget-panel"
          className="absolute right-0 top-full z-50 mt-3 flex h-[min(544px,calc(100dvh-4rem))] w-[min(350px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2.5">
            <span className="text-sm font-semibold text-ink-50">Discord</span>
            <button
              type="button"
              onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
              aria-label={t("Close")}
              className="rounded px-2 py-1 text-lg leading-none text-ink-400 hover:bg-ink-800 hover:text-ink-50"
            >
              ×
            </button>
          </div>
          <iframe
            src={DISCORD_WIDGET_URL}
            title={t("Join our Discord")}
            loading="lazy"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            className="min-h-0 w-full flex-1 border-0"
          />
        </div>
      )}
    </div>
  );
}
