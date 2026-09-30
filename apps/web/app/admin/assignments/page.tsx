"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AdminAssignment } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

export default function AdminAssignmentsPage() {
  const t = useT();
  const { user, status } = useAuthStore();
  const qc = useQueryClient();

  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const { data: assignments, isPending, isError, refetch } = useQuery({
    queryKey: ["assignments", "admin"],
    queryFn: () => apiFetch<AdminAssignment[]>("/assignments"),
    enabled: isAdmin,
  });

  if (status === "ready" && !isAdmin) {
    return <p className="text-sm text-verdict-wa">{t("Admins only.")}</p>;
  }

  async function remove(id: string) {
    if (!confirm(t("Delete this assignment? This cannot be undone."))) return;
    setError(null);
    try {
      await apiFetch(`/assignments/${id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["assignments", "admin"] });
    } catch (e) {
      // Previously silently swallowed — a failed delete left the assignment still listed with no
      // explanation of why the click appeared to do nothing.
      setError(e instanceof ApiError ? e.message : t("Could not delete this assignment"));
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">{t("Admin · Assignments")}</h1>

      {isPending && <p role="status" className="text-sm text-ink-400">載入作業中…</p>}
      {isError && <p role="alert" className="text-sm text-verdict-wa">無法取得作業。<button className="ml-2 underline" onClick={() => void refetch()}>重試</button></p>}
      {error && <p role="alert" className="text-sm text-verdict-wa">{error}</p>}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("Existing assignments")}</h2>
        <div className="space-y-2">
          {assignments?.map((a) => (
            <div key={a.id} className="oj-card p-3">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-medium text-ink-50">{a.title}</h3>
                <button onClick={() => remove(a.id)} className="text-xs text-ink-500 hover:text-verdict-wa">
                  {t("Delete")}
                </button>
              </div>
              {a.dueAt && (
                <p className="mb-1 font-mono text-xs text-ink-400">
                  {t("Due {date}", { date: new Date(a.dueAt).toLocaleString() })}
                </p>
              )}
              <p className="text-xs text-ink-400">
                {t("{count} problems · {students} students", { count: a.problemCount, students: a.assigneeCount })}
              </p>
              <p className="mt-1 text-xs text-ink-500">{a.problems.map((p) => p.title).join(", ")}</p>
            </div>
          ))}
          {assignments?.length === 0 && <p className="text-sm text-ink-400">{t("No assignments yet.")}</p>}
        </div>
      </div>
    </div>
  );
}
