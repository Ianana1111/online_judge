"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { SubmissionDetail } from "@/lib/types";
import { LANGUAGE_LABEL } from "@/lib/types";
import VerdictBadge from "@/components/VerdictBadge";
import CopyButton from "@/components/CopyButton";

export default function SubmissionCodeModal({
  submissionId,
  onClose,
}: {
  submissionId: string;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => apiFetch<SubmissionDetail>(`/submissions/${submissionId}`),
  });

  // Close on Escape, and lock body scroll while the modal is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="oj-card flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-sm font-semibold text-ink-100">Submission</h2>
            {data && (
              <>
                <VerdictBadge verdict={data.verdict} size="sm" />
                <span className="font-mono text-xs text-ink-400">{LANGUAGE_LABEL[data.languageKey] ?? data.languageKey}</span>
                {data.timeMs != null && <span className="font-mono text-xs text-ink-500">{data.timeMs} ms</span>}
                <span className="font-mono text-xs text-ink-500">{new Date(data.createdAt).toLocaleString()}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {isLoading && <p className="text-sm text-ink-400">Loading…</p>}
          {error && <p className="text-sm text-verdict-wa">Could not load this submission.</p>}

          {data?.compileError && (
            <div className="mb-4">
              <p className="mb-1 text-xs font-medium text-verdict-ce">Compiler / judge message</p>
              <pre className="oj-card overflow-x-auto p-3 font-mono text-xs text-verdict-wa">{data.compileError}</pre>
            </div>
          )}

          {data && (data.sourceCode ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-medium text-ink-400">Source code</p>
                <CopyButton text={data.sourceCode} />
              </div>
              <pre className="oj-card overflow-x-auto p-3 font-mono text-xs leading-relaxed text-ink-100">
                {data.sourceCode}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-ink-400">Source code is only visible to the person who wrote it.</p>
          ))}
        </div>
      </div>
    </div>
  );
}
