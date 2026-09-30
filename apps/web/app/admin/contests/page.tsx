"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ContestListItem } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

export default function AdminContestsPage() {
  const t = useT();
  const { user, status } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { data: contests, isPending, isError, refetch } = useQuery({
    queryKey: ["contests"],
    queryFn: () => apiFetch<ContestListItem[]>("/contests"),
    enabled: isAdmin,
  });

  if (status === "ready" && !isAdmin) {
    return <p className="text-sm text-verdict-wa">{t("Admins only.")}</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">{t("Admin · Contests")}</h1>

      {isPending && <p role="status" className="text-sm text-ink-400">載入測驗中…</p>}
      {isError && <p role="alert" className="text-sm text-verdict-wa">無法取得測驗。<button className="ml-2 underline" onClick={() => void refetch()}>重試</button></p>}
      {contests && <p className="text-sm text-ink-400">共 {contests.length} 場 · CPE {contests.filter(c => c.kind === "CPE").length} 場 · GPE {contests.filter(c => c.kind === "GPE").length} 場</p>}
      <div className="overflow-x-auto">
        <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("Existing contests")}</h2>
        <table className="oj-table">
          <thead>
            <tr>
              <th>{t("Title")}</th>
              <th>{t("Kind")}</th>
              <th>{t("Start")}</th>
              <th>{t("Duration")}</th>
            </tr>
          </thead>
          <tbody>
            {contests?.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td className="text-xs text-ink-400">{c.kind}</td>
                <td className="font-mono text-xs text-ink-400">
                  {c.startAt ? new Date(c.startAt).toLocaleString() : t("virtual (per-user)")}
                </td>
                <td className="font-mono text-xs text-ink-400">{c.durationMin}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
