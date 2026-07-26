"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ClassSessionItem } from "@/lib/types";
import StatementRenderer from "@/components/StatementRenderer";
import HomeworkStatusBadge from "@/components/HomeworkStatusBadge";

// Strips Markdown syntax down to a single-line plain-text teaser so a long lesson writeup
// (headers, code blocks, lists...) can't blow up the collapsed card — only expanding shows the
// real, fully-rendered content.
function previewText(md: string, maxLen = 140): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trimEnd()}…` : plain;
}

function ClassSessionCard({ c }: { c: ClassSessionItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="oj-card overflow-hidden p-4">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-ink-50">
            Class {c.number}
            {c.title && <span className="ml-2 text-base font-normal text-ink-300">— {c.title}</span>}
          </h2>
          {c.contentMd && !expanded && <p className="mt-1 truncate text-sm text-ink-400">{previewText(c.contentMd)}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="whitespace-nowrap font-mono text-xs text-ink-500">
            {new Date(c.createdAt).toLocaleDateString()}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            className={`text-ink-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </button>

      {expanded && c.contentMd && (
        <div className="mb-4 mt-3 border-t border-ink-800 pt-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Taught today</h3>
          <StatementRenderer content={c.contentMd} />
        </div>
      )}

      {c.homework.length > 0 && (
        <div className={expanded || !c.contentMd ? "mt-3" : "mt-3 border-t border-ink-800 pt-3"}>
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
          What was taught each session, and the homework that came with it. Tap a class to see the full content.
        </p>
      </div>

      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}
      {classes?.length === 0 && (
        <p className="oj-card p-4 text-sm text-ink-400">No classes have been recorded for you yet.</p>
      )}

      <div className="space-y-4">
        {classes?.map((c) => (
          <ClassSessionCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
