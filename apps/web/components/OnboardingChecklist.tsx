"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Achievement } from "@/lib/types";

const ITEMS = [
  {
    key: "first_ac",
    icon: "🎯",
    label: "Solve your first problem",
    desc: "Pick anything from the problem list and land an AC.",
    href: "/problems",
  },
  {
    key: "first_virtual_exam",
    icon: "📝",
    label: "Take a virtual CPE exam",
    desc: "Run a timed sitting under real exam conditions.",
    href: "/cpe",
  },
  {
    key: "daily_goal",
    icon: "🔥",
    label: "Set your daily goal",
    desc: "Decide how many problems a day keeps your streak alive.",
    href: "/settings",
  },
] as const;

/** Auto-dismisses (persisted to User.settings) once every item is done, so a returning user who
 * completed everything organically never sees a stale checklist — no action required from them. */
export default function OnboardingChecklist() {
  const { user, setUser } = useAuthStore();

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

  return (
    <div className="oj-card p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink-100">Getting started</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {doneCount} of {ITEMS.length} done
          </p>
        </div>
        <button onClick={dismiss} className="text-xs text-ink-500 hover:text-ink-300">
          Skip
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {ITEMS.map((item) => {
          const isDone = done[item.key];
          const body = (
            <>
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full text-base ${
                  isDone ? "bg-verdict-ac/15 text-verdict-ac" : "bg-brand/10 text-brand"
                }`}
              >
                {isDone ? "✓" : item.icon}
              </div>
              <h3
                className={`text-sm font-medium ${
                  isDone ? "text-ink-500 line-through" : "text-ink-50 group-hover:text-brand"
                }`}
              >
                {item.label}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{item.desc}</p>
            </>
          );

          if (isDone) {
            return (
              <div key={item.key} className="rounded border border-verdict-ac/30 bg-verdict-ac/5 p-4">
                {body}
              </div>
            );
          }
          return (
            <Link
              key={item.key}
              href={item.href}
              className="group rounded border border-ink-700 bg-ink-800/40 p-4 transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-ink-800/70"
            >
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
