"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ClassOverviewRow } from "@/lib/types";
import { SkeletonList } from "@/components/Skeleton";
import { useT } from "@/lib/i18n/LocaleContext";

export default function AdminClassesOverviewPage() {
  const t = useT();
  const { user, status } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { data: rows, isLoading } = useQuery({
    queryKey: ["classes", "overview"],
    queryFn: () => apiFetch<ClassOverviewRow[]>("/classes/overview"),
    enabled: isAdmin,
  });

  if (status === "ready" && !isAdmin) {
    return <p className="text-sm text-verdict-wa">{t("Admins only.")}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">{t("Admin · Classes")}</h1>
        <p className="mt-1 text-sm text-ink-400">
          {t("Every student's progress at a glance. Click a student to record a class or manage homework.")}
        </p>
      </div>

      {isLoading && <SkeletonList rows={5} />}

      <table className="oj-table">
        <thead>
          <tr>
            <th>{t("Student")}</th>
            <th>{t("Current class")}</th>
            <th>{t("Homework")}</th>
            <th>{t("AC")}</th>
            <th>{t("Wrong / Error")}</th>
            <th>{t("Pending")}</th>
            <th>{t("Not started")}</th>
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
              <td className="font-mono text-xs text-ink-300">
                {r.currentClass > 0 ? t("Class {n}", { n: r.currentClass }) : "—"}
              </td>
              <td className="font-mono text-xs text-ink-400">{r.totalHomework}</td>
              <td className="font-mono text-xs text-verdict-ac">{r.ac}</td>
              <td className="font-mono text-xs text-verdict-wa">{r.wrong}</td>
              <td className="font-mono text-xs text-verdict-pending">{r.pending}</td>
              <td className="font-mono text-xs text-ink-500">{r.notStarted}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows?.length === 0 && <p className="text-sm text-ink-400">{t("No students yet — create accounts under Users.")}</p>}
    </div>
  );
}
