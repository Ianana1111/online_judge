"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ProblemListResponse } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

export default function AdminProblemsPage() {
  const t = useT();
  const { user, status } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["problems", "admin", page, search],
    queryFn: () => apiFetch<ProblemListResponse>(`/problems?page=${page}&pageSize=50&q=${encodeURIComponent(search)}`),
    enabled: user?.role === "ADMIN",
  });

  if (status === "ready" && user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">{t("Admins only.")}</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">{t("Admin · Problems")}</h1>

      <input aria-label="搜尋題目" placeholder="搜尋題名或題號" className="oj-input max-w-md" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      {isPending && <p role="status" className="text-sm text-ink-400">載入題目中…</p>}
      {isError && <p role="alert" className="text-sm text-verdict-wa">無法取得題目。<button className="ml-2 underline" onClick={() => void refetch()}>重試</button></p>}
      <div className="overflow-x-auto">
        <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("Existing problems")}</h2>
        <table className="oj-table">
          <thead>
            <tr>
              <th>{t("Title")}</th>
              <th>{t("Slug")}</th>
              <th>{t("Source")}</th>
              <th>{t("Difficulty")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td className="font-mono text-xs text-ink-400">{p.slug}</td>
                <td className="text-xs text-ink-400">{p.source}</td>
                <td className="font-mono text-xs text-brand">{"★".repeat(p.difficulty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && <div className="mt-4 flex items-center justify-between gap-3 text-sm text-ink-300"><span>共 {data.total} 題 · 第 {page} 頁</span><div className="flex gap-2"><button className="oj-btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>上一頁</button><button className="oj-btn-secondary" disabled={page * 50 >= data.total} onClick={() => setPage(p => p + 1)}>下一頁</button></div></div>}
      </div>
    </div>
  );
}
