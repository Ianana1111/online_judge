"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ClassSessionItem } from "@/lib/types";
import StatementRenderer from "@/components/StatementRenderer";
import HomeworkStatusBadge from "@/components/HomeworkStatusBadge";

export default function MyClassesPage() {
  const { user, status } = useAuthStore();

  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes", "me"],
    queryFn: () => apiFetch<ClassSessionItem[]>("/classes/me"),
    enabled: !!user,
  });

  if (status === "ready" && !user) {
    return <p className="text-sm text-verdict-wa">Log in to see your classes.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">My Classes</h1>
        <p className="mt-1 text-sm text-ink-400">
          What was taught each session, and the homework that came with it.
        </p>
      </div>

      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}
      {classes?.length === 0 && (
        <p className="oj-card p-4 text-sm text-ink-400">No classes have been recorded for you yet.</p>
      )}

      <div className="space-y-6">
        {classes?.map((c) => (
          <div key={c.id} className="oj-card p-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-ink-50">
                Class {c.number}
                {c.title && <span className="ml-2 text-base font-normal text-ink-300">— {c.title}</span>}
              </h2>
              <span className="whitespace-nowrap font-mono text-xs text-ink-500">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>

            {c.contentMd && (
              <div className="mb-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Taught today</h3>
                <StatementRenderer content={c.contentMd} />
              </div>
            )}

            {c.homework.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Homework</h3>
                <div className="space-y-1.5">
                  {c.homework.map((hw) => (
                    <div key={hw.id} className="flex items-center justify-between gap-3 rounded border border-ink-800 px-3 py-2">
                      <Link href={`/problems/${hw.slug}`} className="text-sm text-ink-200 hover:text-brand">
                        {hw.uvaId ? `UVa ${hw.uvaId} — ` : ""}
                        {hw.title}
                      </Link>
                      <HomeworkStatusBadge status={hw.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
