"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ClassSessionItem } from "@/lib/types";
import { previewText } from "@/lib/textPreview";
import HomeworkStatusBadge from "@/components/HomeworkStatusBadge";
import { SkeletonList } from "@/components/Skeleton";

function ClassSessionRow({ c }: { c: ClassSessionItem }) {
  return (
    <Link href={`/classes/${c.id}`} className="oj-card block p-4 transition-colors hover:border-brand/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-ink-50">
            Class {c.number}
            {c.title && <span className="ml-2 text-base font-normal text-ink-300">— {c.title}</span>}
          </h2>
          {c.contentMd && <p className="mt-1 truncate text-sm text-ink-400">{previewText(c.contentMd)}</p>}
        </div>
        <span className="shrink-0 whitespace-nowrap font-mono text-xs text-ink-500">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      </div>

      {c.homework.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-ink-800 pt-3">
          {c.homework.map((hw) => (
            <div key={hw.id} className="flex items-center justify-between gap-3 rounded border border-ink-800 px-3 py-1.5">
              <span className="truncate text-sm text-ink-200">
                {hw.uvaId ? `UVa ${hw.uvaId} — ` : ""}
                {hw.title}
              </span>
              <HomeworkStatusBadge status={hw.status} />
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

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
          What was taught each session, and the homework that came with it. Open a class to see the full content and ask
          questions.
        </p>
      </div>

      {isLoading && <SkeletonList rows={4} />}
      {classes?.length === 0 && (
        <p className="oj-card p-4 text-sm text-ink-400">No classes have been recorded for you yet.</p>
      )}

      <div className="space-y-4">
        {classes?.map((c) => (
          <ClassSessionRow key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
