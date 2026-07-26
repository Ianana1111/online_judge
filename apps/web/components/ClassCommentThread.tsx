"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import type { ClassComment, ClassSessionDetail } from "@/lib/types";

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClassCommentThread({ classId, comments }: { classId: string; comments: ClassComment[] }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setError(null);
    setSending(true);
    try {
      const comment = await apiFetch<ClassComment>(`/classes/${classId}/comments`, {
        method: "POST",
        body: { body: trimmed },
      });
      qc.setQueryData<ClassSessionDetail | undefined>(["classes", "detail", classId], (prev) =>
        prev ? { ...prev, comments: [...prev.comments, comment] } : prev,
      );
      setBody("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not send your message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Questions &amp; discussion</h3>

      <div className="space-y-3">
        {comments.length === 0 && <p className="text-sm text-ink-500">No messages yet — ask a question below.</p>}
        {comments.map((c) => (
          <div
            key={c.id}
            className={`rounded border p-3 ${
              c.isAdmin ? "border-brand/30 bg-brand/5" : "border-ink-800 bg-ink-800/40"
            }`}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className={`text-sm font-semibold ${c.isAdmin ? "text-brand" : "text-ink-100"}`}>{c.authorHandle}</span>
              {c.isAdmin && (
                <span className="rounded border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-brand">
                  Teacher
                </span>
              )}
              <span className="font-mono text-xs text-ink-500">{timeLabel(c.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-ink-200">{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="mt-4 space-y-2">
        <textarea
          className="oj-input h-24 text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ask a question about this class…"
          maxLength={4000}
        />
        {error && <p className="text-sm text-verdict-wa">{error}</p>}
        <button type="submit" disabled={sending || !body.trim()} className="oj-btn-primary text-sm">
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
