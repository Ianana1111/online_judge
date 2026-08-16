"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import AssignmentLeaderboard from "@/components/AssignmentLeaderboard";
import type { MyAssignment } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

export default function AssignmentsPage() {
  const t = useT();
  const { user, status } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["assignments", "me"],
    queryFn: () => apiFetch<MyAssignment[]>("/assignments/me"),
    enabled: !!user,
  });

  if (status === "ready" && !user) {
    return <p className="text-sm text-ink-400">{t("Log in to see your assignments.")}</p>;
  }
  if (isLoading) return <p className="text-sm text-ink-400">{t("Loading assignments…")}</p>;

  const items = data ?? [];
  const now = Date.now();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-50">{t("My assignments")}</h1>
      {items.length === 0 && <p className="text-sm text-ink-400">{t("Nothing assigned to you yet.")}</p>}
      <div className="space-y-3">
        {items.map((a) => {
          const overdue = a.dueAt && new Date(a.dueAt).getTime() < now && a.completedCount < a.totalCount;
          const allDone = a.totalCount > 0 && a.completedCount === a.totalCount;
          return (
            <div key={a.id} className="oj-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display font-semibold text-ink-50">{a.title}</h2>
                <span
                  className={`font-mono text-xs ${allDone ? "text-verdict-ac" : overdue ? "text-verdict-wa" : "text-ink-400"}`}
                >
                  {t("{done}/{total} done", { done: a.completedCount, total: a.totalCount })}
                </span>
              </div>
              {a.description && <p className="mb-2 text-sm text-ink-300">{a.description}</p>}
              {a.dueAt && (
                <p className={`mb-3 font-mono text-xs ${overdue ? "text-verdict-wa" : "text-ink-500"}`}>
                  {t("Due {date}", { date: new Date(a.dueAt).toLocaleString() })}
                  {overdue ? t(" — overdue") : ""}
                </p>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                {a.problems.map((p) => (
                  <Link
                    key={p.id}
                    href={`/problems/${p.slug}`}
                    className="flex items-center justify-between rounded border border-ink-800 px-3 py-2 text-sm transition-colors hover:border-brand"
                  >
                    <span className="text-ink-100">{p.title}</span>
                    <span className={p.completed ? "text-verdict-ac" : "text-ink-600"}>
                      {p.completed ? "✓" : "○"}
                    </span>
                  </Link>
                ))}
              </div>
              <AssignmentLeaderboard assignmentId={a.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
