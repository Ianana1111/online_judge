"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Achievement } from "@/lib/types";

const ITEMS = [
  { key: "first_ac", label: "Solve your first problem", href: "/problems" },
  { key: "first_virtual_exam", label: "Take a virtual CPE exam", href: "/cpe" },
  { key: "daily_goal", label: "Set your daily goal", href: "/settings" },
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
  const done = {
    first_ac: earnedCodes.has("first_ac"),
    first_virtual_exam: earnedCodes.has("first_virtual_exam"),
    daily_goal: user?.settings.dailyGoal !== undefined,
  };
  // Only counts once achievements have actually loaded — otherwise the undefined-during-fetch
  // default would read as "all false" and could never trigger the auto-dismiss below.
  const allDone = !!achievements && Object.values(done).every(Boolean);

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
    <div className="oj-card mb-4 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-200">Getting started</h2>
        <button onClick={dismiss} className="text-xs text-ink-500 hover:text-ink-300">
          Dismiss
        </button>
      </div>
      <ul className="space-y-1.5">
        {ITEMS.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm">
            <span className={done[item.key] ? "text-verdict-ac" : "text-ink-600"}>{done[item.key] ? "✓" : "○"}</span>
            {done[item.key] ? (
              <span className="text-ink-500 line-through">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-ink-200 hover:text-brand">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
