"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ChevronRightIcon, FileTextIcon, FlagIcon, FlameIcon, XIcon } from "@/components/icons";
import type { Achievement } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const ITEMS = [
  {
    key: "first_ac",
    icon: FlagIcon,
    label: "Solve your first problem",
    desc: "Pick anything from the problem list and land an AC.",
    href: "/problems",
  },
  {
    key: "first_virtual_exam",
    icon: FileTextIcon,
    label: "Take a virtual CPE exam",
    desc: "Run a timed sitting under real exam conditions.",
    href: "/cpe",
  },
  {
    key: "daily_goal",
    icon: FlameIcon,
    label: "Set your daily goal",
    desc: "Decide how many problems a day keeps your streak alive.",
    href: "/settings",
  },
] as const;

/**
 * A sticky note tucked against the right edge of the viewport rather than a full-width block at
 * the top of the dashboard — onboarding is a nudge, not the main event, so it shouldn't push the
 * greeting/streak card (the thing a returning user actually opens the site for) below the fold.
 * Being `fixed`, it sits outside the page flow entirely, so its position in the JSX tree doesn't
 * affect layout.
 *
 * Auto-dismisses (persisted to User.settings) once every item is done, so a returning user who
 * completed everything organically never sees a stale checklist — no action required from them.
 */
export default function OnboardingChecklist() {
  const t = useT();
  const { user, setUser } = useAuthStore();
  // Starts tucked into its tab and only springs open on a wide screen: at phone widths an open
  // panel would cover most of the page, so there it waits to be tapped instead.
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed(false);
  }, []);

  const { data: achievements } = useQuery({
    queryKey: ["achievements", user?.handle],
    queryFn: () => apiFetch<Achievement[]>(`/achievements/${user!.handle}`),
    enabled: !!user,
  });

  const earnedCodes = new Set((achievements ?? []).map((a) => a.code));
  const done: Record<(typeof ITEMS)[number]["key"], boolean> = {
    first_ac: earnedCodes.has("first_ac"),
    first_virtual_exam: earnedCodes.has("first_virtual_exam"),
    daily_goal: user?.settings.dailyGoal !== undefined,
  };
  // Only counts once achievements have actually loaded — otherwise the undefined-during-fetch
  // default would read as "all false" and could never trigger the auto-dismiss below.
  const allDone = !!achievements && Object.values(done).every(Boolean);
  const doneCount = Object.values(done).filter(Boolean).length;

  async function dismiss() {
    if (!user) return;
    const { settings } = await apiFetch<{ settings: typeof user.settings }>("/users/me/settings", {
      method: "PATCH",
      body: { onboardingDismissed: true },
    });
    setUser({ ...user, settings });
  }

  useEffect(() => {
    if (allDone) void dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  if (!user || user.settings.onboardingDismissed || allDone) return null;

  const remaining = ITEMS.length - doneCount;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        title={t("Getting started")}
        aria-label={t("Getting started")}
        className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l border border-r-0 border-brand/40 bg-brand/10 px-2 py-3 text-brand transition-colors hover:bg-brand/20"
      >
        <FlagIcon className="h-4 w-4" />
        <span className="font-mono text-[11px] font-semibold tabular-nums">{remaining}</span>
      </button>
    );
  }

  return (
    <div className="oj-card fixed right-0 top-1/2 z-30 w-[min(17rem,calc(100vw-2rem))] -translate-y-1/2 rounded-r-none border-r-0 border-l-2 border-l-brand p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink-100">{t("Getting started")}</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {t("{done} of {total} done", { done: doneCount, total: ITEMS.length })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title={t("Tuck away")}
            aria-label={t("Tuck away")}
            className="rounded p-1 text-ink-500 transition-colors hover:bg-ink-800 hover:text-ink-200"
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={dismiss}
            title={t("Skip")}
            aria-label={t("Skip")}
            className="rounded p-1 text-ink-500 transition-colors hover:bg-ink-800 hover:text-ink-200"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {ITEMS.map((item) => {
          const isDone = done[item.key];
          if (isDone) {
            return (
              <div key={item.key} className="flex items-center gap-2.5 rounded px-2 py-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-verdict-ac/15 text-xs text-verdict-ac">
                  ✓
                </span>
                <span className="min-w-0 truncate text-xs text-ink-500 line-through">{t(item.label)}</span>
              </div>
            );
          }
          return (
            <Link
              key={item.key}
              href={item.href}
              title={t(item.desc)}
              className="group flex items-center gap-2.5 rounded px-2 py-1.5 transition-colors hover:bg-ink-800/70"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <item.icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-100 group-hover:text-brand">
                {t(item.label)}
              </span>
              <ChevronRightIcon className="h-3 w-3 shrink-0 text-ink-600 group-hover:text-brand" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
