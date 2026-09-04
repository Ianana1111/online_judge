"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useExamTimerStore, formatDuration } from "@/store/examTimer";
import type { MyContest } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

/** Reminds a logged-in user, on every page other than the exam itself, that a virtual/individual
 * exam is still ticking somewhere — ExamModeShell hides NavBar entirely while it's mounted (see
 * `examActive` below), so leaving that page via the logo link used to be the easiest way to
 * forget an exam was still running in the background and accidentally start a second one. Only
 * one contest can ever be live for a user at a time (ContestsService.register), so this never has
 * more than one row to show. */
export default function ActiveExamBanner() {
  const t = useT();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const examActive = useExamTimerStore((s) => s.active);
  const [ending, setEnding] = useState(false);

  const { data: mine } = useQuery({
    queryKey: ["contests", "me"],
    queryFn: () => apiFetch<MyContest[]>("/contests/me"),
    enabled: !!user && !examActive,
    // Mounted site-wide for every logged-in visitor, so this stays deliberately infrequent —
    // it only needs to notice "still running" within a minute or so, not track it live.
    refetchInterval: 30_000,
  });

  if (!user || examActive) return null;
  const running = (mine ?? []).find((c) => c.status === "RUNNING");
  if (!running) return null;

  async function endNow() {
    setEnding(true);
    try {
      await apiFetch(`/contests/${running!.id}/end`, { method: "POST" });
      await qc.invalidateQueries({ queryKey: ["contests", "me"] });
      await qc.invalidateQueries({ queryKey: ["contest", running!.id] });
    } finally {
      setEnding(false);
    }
  }

  const remaining = Math.max(0, new Date(running.endsAt).getTime() - Date.now());

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-verdict-tle/30 bg-verdict-tle/10 px-4 py-1.5 text-center text-xs text-verdict-tle sm:text-sm">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-verdict-tle" aria-hidden />
        {t("{title} is still running — {remaining} left unanswered.", { title: running.title, remaining: formatDuration(remaining) })}
      </span>
      <span className="inline-flex items-center gap-2">
        <Link href={`/contests/${running.id}`} className="font-semibold underline hover:no-underline">
          {t("Resume")}
        </Link>
        <button type="button" onClick={endNow} disabled={ending} className="font-semibold underline hover:no-underline disabled:opacity-50">
          {ending ? t("Ending…") : t("End it")}
        </button>
      </span>
    </div>
  );
}
