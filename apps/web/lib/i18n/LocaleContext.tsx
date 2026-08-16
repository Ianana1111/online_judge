"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth";
import { apiFetch } from "@/lib/api";
import type { UserSettings } from "@/lib/types";
import { dictionary } from "./dictionary";

export type Locale = "zh-TW" | "en";
const STORAGE_KEY = "locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * zh-TW is the default and what every server-rendered page assumes before hydration — starting
 * state here matches that on purpose so the common case (nobody's switched to English) never
 * flashes. Only a returning visitor who chose English sees a brief flash back to Chinese before
 * the effect below reads their saved preference; there's no SSR-safe way around that without
 * reading a cookie in the root layout, which would force every page off static/ISR rendering.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-TW");
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh-TW") setLocaleState(stored);
  }, []);

  // Server-stored preference (synced across devices/browsers) wins over whatever this browser
  // had saved — the same "server value wins once it exists" pattern Preferences' defaultLanguage
  // setting already uses.
  useEffect(() => {
    const serverLocale = user?.settings.uiLocale;
    if (serverLocale && serverLocale !== locale) {
      setLocaleState(serverLocale);
      localStorage.setItem(STORAGE_KEY, serverLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.settings.uiLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (user) {
      apiFetch<{ settings: UserSettings }>("/users/me/settings", {
        method: "PATCH",
        body: { uiLocale: next },
      })
        .then(({ settings }) => setUser({ ...user, settings }))
        .catch(() => {
          /* best-effort — the local choice above already applies regardless */
        });
    }
  }

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, user],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

/**
 * `t("Some English string")` — the argument doubles as both the English text (returned as-is in
 * English mode, and as a fallback for any zh-TW key that hasn't been translated yet) and the
 * dictionary lookup key. `params` fills "{name}"-style placeholders present in the matched string.
 */
export function useT() {
  const { locale } = useLocale();
  return function t(text: string, params?: Record<string, string | number>): string {
    const translated = locale === "en" ? text : (dictionary[text] ?? text);
    if (!params) return translated;
    return Object.entries(params).reduce((acc, [key, val]) => acc.split(`{${key}}`).join(String(val)), translated);
  };
}
