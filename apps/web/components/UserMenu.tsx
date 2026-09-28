"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { useT } from "@/lib/i18n/LocaleContext";

export default function UserMenu({
  handle,
  avatarUrl,
  isAdmin,
  plan,
  onLogout,
  compact = false,
}: {
  compact?: boolean;
  handle: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  plan: "FREE" | "PRO";
  onLogout: () => Promise<void>;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [showHandle, setShowHandle] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [logoutError, setLogoutError] = useState(false);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function escape(e: KeyboardEvent) { if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("focusin", onClickOutside as unknown as EventListener);
    if (open) document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", onClickOutside); document.removeEventListener("focusin", onClickOutside as unknown as EventListener); document.removeEventListener("keydown", escape); };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-50">
      <button
        type="button"
        ref={triggerRef}
        aria-label={t("Account menu for {handle}", { handle })}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setShowHandle(true)}
        onMouseLeave={() => setShowHandle(false)}
        onFocus={() => setShowHandle(true)}
        onBlur={() => setShowHandle(false)}
        className={`flex items-center justify-center rounded-lg text-sm text-ink-200 hover:bg-ink-800 hover:text-brand ${compact ? "h-11 w-11 lg:h-8 lg:w-8" : "min-h-11 min-w-11 gap-1.5 px-2"}`}
      >
        {isAdmin && !compact && (
          <span className="hidden whitespace-nowrap rounded border border-brand/40 bg-brand/10 md:inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-brand">
            {t("Admin")}
          </span>
        )}
        <Avatar avatarUrl={avatarUrl} handle={handle} size={compact ? 26 : 22} />
        {!compact && <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>}
      </button>
      {/* The handle is a hover/focus affordance rather than always-on text: a long one used to
          stretch the header and crowd the nav. The open menu already shows it, so don't stack both. */}
      {showHandle && !open && (
        <span
          aria-hidden
          className="oj-card pointer-events-none absolute right-0 top-full z-50 mt-2 max-w-[14rem] break-words px-2.5 py-1.5 text-xs font-medium text-ink-200"
        >
          {handle}
        </span>
      )}
      {open && (
        <div className="oj-card absolute right-0 top-full mt-2 w-56 overflow-hidden p-2">
          <p className="truncate border-b border-ink-700 px-3 py-3 text-sm font-semibold text-ink-200">{handle}</p>
          <Link
            href="/upgrade"
            onClick={() => setOpen(false)}
            className={`block rounded px-3 py-2 text-xs font-semibold hover:bg-ink-800 ${
              plan === "PRO" ? "text-brand hover:text-brand" : "text-ink-500 hover:text-brand"
            }`}
          >
            {plan === "PRO" ? t("Pro Plan") : t("Free Plan")}
          </Link>
          <div className="my-1 border-t border-ink-800" />
          <Link
            href={`/u/${handle}`}
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm text-ink-200 hover:bg-ink-800"
          >
            {t("Activity")}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm text-ink-200 hover:bg-ink-800"
          >
            {t("Settings")}
          </Link>
          <div className="my-1 border-t border-ink-800" />
          <button
            type="button"
            onClick={async () => {
              setLogoutError(false);
              try { await onLogout(); setOpen(false); } catch { setLogoutError(true); }
            }}
            className="block w-full rounded px-3 py-2 text-left text-sm text-ink-400 hover:bg-ink-800 hover:text-verdict-wa"
          >
            {t("Log out")}
          </button>
          {logoutError && <p role="alert" className="px-3 py-2 text-xs text-verdict-wa">{t("Could not log out. Please try again.")}</p>}
        </div>
      )}
    </div>
  );
}

