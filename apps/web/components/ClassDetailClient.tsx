"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ClassSessionDetail } from "@/lib/types";
import BackButton from "@/components/BackButton";
import StatementRenderer from "@/components/StatementRenderer";
import HomeworkStatusBadge from "@/components/HomeworkStatusBadge";
import ClassCommentThread from "@/components/ClassCommentThread";
import { Skeleton } from "@/components/Skeleton";
import { useT } from "@/lib/i18n/LocaleContext";

export default function ClassDetailClient({ classId, backHref }: { classId: string; backHref: string }) {
  const t = useT();
  const { user, status: authStatus } = useAuthStore();

  const { data: cls, isLoading, error } = useQuery({
    queryKey: ["classes", "detail", classId],
    queryFn: () => apiFetch<ClassSessionDetail>(`/classes/${classId}`),
    enabled: !!user,
  });

  const isAdmin = user?.role === "ADMIN";

  if (authStatus === "ready" && !user) {
    return <p className="text-sm text-verdict-wa">{t("Log in to see this class.")}</p>;
  }

  return (
    <div className="space-y-6">
      <BackButton fallbackHref={backHref} />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}
      {error && <p className="oj-card p-4 text-sm text-verdict-wa">{t("You don't have access to this class.")}</p>}

      {cls && (
        <>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-50">
              {t("Class {n}", { n: cls.number })}
              {cls.title && <span className="ml-2 text-lg font-normal text-ink-300">— {cls.title}</span>}
            </h1>
            <p className="mt-1 text-sm text-ink-400">
              {isAdmin ? t("Student: {handle}", { handle: cls.studentHandle }) : t("Taught by {handle}", { handle: cls.teacherHandle })} ·{" "}
              {new Date(cls.createdAt).toLocaleDateString()}
            </p>
          </div>

          {cls.contentMd && (
            <div className="oj-card p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Taught this session")}</h2>
              <StatementRenderer content={cls.contentMd} />
            </div>
          )}

          {cls.homework.length > 0 && (
            <div className="oj-card p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Homework")}</h2>
              <div className="space-y-1.5">
                {cls.homework.map((hw) => (
                  <div key={hw.id} className="flex items-center justify-between gap-3 rounded border border-ink-800 px-3 py-2">
                    <Link href={`/problems/${hw.slug}`} className="text-sm text-ink-200 hover:text-brand">
                      {hw.uvaId ? t("UVa {id} — ", { id: hw.uvaId }) : ""}
                      {hw.title}
                    </Link>
                    <HomeworkStatusBadge status={hw.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="oj-card p-5">
            <ClassCommentThread classId={cls.id} comments={cls.comments} />
          </div>
        </>
      )}
    </div>
  );
}
