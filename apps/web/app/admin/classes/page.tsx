"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ClassOverviewRow } from "@/lib/types";

export default function AdminClassesOverviewPage() {
  const { user, status } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { data: rows, isLoading } = useQuery({
    queryKey: ["classes", "overview"],
    queryFn: () => apiFetch<ClassOverviewRow[]>("/classes/overview"),
    enabled: isAdmin,
  });

  if (status === "ready" && !isAdmin) {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Admin · Classes</h1>
        <p className="mt-1 text-sm text-ink-400">
          Every student's progress at a glance. Click a student to record a class or manage homework.
        </p>
      </div>

      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}

      <table className="oj-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Current class</th>
            <th>Homework</th>
            <th>AC</th>
            <th>Wrong / Error</th>
            <th>Pending</th>
            <th>Not started</th>
          </tr>
        </thead>
        <tbody>
          {rows?.map((r) => (
            <tr key={r.studentId}>
              <td>
                <Link href={`/admin/classes/${r.studentId}`} className="text-ink-200 hover:text-brand">
                  {r.handle}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-300">{r.currentClass > 0 ? `Class ${r.currentClass}` : "—"}</td>
              <td className="font-mono text-xs text-ink-400">{r.totalHomework}</td>
              <td className="font-mono text-xs text-verdict-ac">{r.ac}</td>
              <td className="font-mono text-xs text-verdict-wa">{r.wrong}</td>
              <td className="font-mono text-xs text-verdict-pending">{r.pending}</td>
              <td className="font-mono text-xs text-ink-500">{r.notStarted}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows?.length === 0 && <p className="text-sm text-ink-400">No students yet — create accounts under Users.</p>}
    </div>
  );
}
