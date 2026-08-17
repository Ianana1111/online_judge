"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TAIWAN_UNIVERSITIES } from "@oj/shared";
import { useT } from "@/lib/i18n/LocaleContext";

/**
 * Searchable picker over the closed TAIWAN_UNIVERSITIES list (packages/shared) — a plain <select>
 * with ~90 <option>s works but is slow to scan; typing to filter is much faster for a list this
 * long. Deliberately can't submit free text: `value` only ever becomes one of the list's exact
 * strings (or null), which is what makes the leaderboard's school filter work at all.
 */
export default function SchoolCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string | null;
  onChange: (school: string | null) => void;
  placeholder?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query) return TAIWAN_UNIVERSITIES;
    return TAIWAN_UNIVERSITIES.filter((u) => u.includes(query));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="oj-input flex items-center justify-between gap-2 text-left"
      >
        <span className={`truncate ${value ? "text-ink-50" : "text-ink-400"}`}>
          {value ?? placeholder ?? t("Select your school")}
        </span>
        <svg
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className={`h-2.5 w-2.5 shrink-0 text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 3l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div role="listbox" className="oj-card absolute left-0 top-full z-20 mt-1.5 w-full overflow-hidden">
          <div className="border-b border-ink-800 p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search…")}
              className="oj-input"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setQuery("");
                }}
                className="block w-full rounded px-3 py-1.5 text-left text-sm text-ink-500 hover:bg-ink-800"
              >
                {t("Clear")}
              </button>
            )}
            {filtered.length === 0 && <p className="px-3 py-2 text-sm text-ink-500">{t("No matches")}</p>}
            {filtered.map((u) => (
              <button
                key={u}
                type="button"
                role="option"
                aria-selected={u === value}
                onClick={() => {
                  onChange(u);
                  setOpen(false);
                  setQuery("");
                }}
                className={`block w-full truncate rounded px-3 py-1.5 text-left text-sm hover:bg-ink-800 ${
                  u === value ? "text-brand" : "text-ink-200"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
