"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { MyAssignment } from "@/lib/types";

export default function AssignmentsPage() {
  const { user, status } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["assignments", "me"],
    queryFn: () => apiFetch<MyAssignment[]>("/assignments/me"),
    enabled: !!user,
  });

  if (status === "ready" && !user) {
    return <p className="text-sm text-ink-400">Log in to see your assignments.</p>;
  }
  if (isLoading) return <p className="text-sm text-ink-400">Loading assignments…</p>;

  const items = data ?? [];
  const now = Date.now();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-50">My assignments</h1>
      {items.length === 0 && <p className="text-sm text-ink-400">Nothing assigned to you yet.</p>}
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
                  {a.completedCount}/{a.totalCount} done
                </span>
              </div>
              {a.description && <p className="mb-2 text-sm text-ink-300">{a.description}</p>}
              {a.dueAt && (
                <p className={`mb-3 font-mono text-xs ${overdue ? "text-verdict-wa" : "text-ink-500"}`}>
                  Due {new Date(a.dueAt).toLocaleString()}
                  {overdue ? " — overdue" : ""}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
