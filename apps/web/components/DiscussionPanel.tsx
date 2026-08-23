"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Discussion } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

export default function DiscussionPanel({ problemId }: { problemId: string }) {
  const t = useT();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["discussions", problemId],
    queryFn: () => apiFetch<Discussion[]>(`/discussions/problem/${problemId}`),
  });

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setPosting(true);
    try {
      await apiFetch(`/discussions/problem/${problemId}`, { method: "POST", body: { body } });
      setBody("");
      await qc.invalidateQueries({ queryKey: ["discussions", problemId] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not post"));
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("Delete this comment? This cannot be undone."))) return;
    try {
      await apiFetch(`/discussions/${id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["discussions", problemId] });
    } catch (e) {
      // Previously silently swallowed — a failed delete (e.g. a permission error) left the comment
      // still there with no explanation of why the click appeared to do nothing.
      setError(e instanceof ApiError ? e.message : t("Could not delete this comment"));
    }
  }

  if (isLoading) return <p className="text-sm text-ink-400">{t("Loading discussion…")}</p>;
  const items = data ?? [];

  return (
    <div className="space-y-4">
      {user ? (
        <form onSubmit={post} className="space-y-2">
          <textarea
            className="oj-input h-24 text-sm"
            placeholder={t("Ask a question or share a hint…")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={4000}
          />
          {error && <p className="text-sm text-verdict-wa">{error}</p>}
          <button type="submit" disabled={posting || !body.trim()} className="oj-btn-primary text-sm">
            {posting ? t("Posting…") : t("Post")}
          </button>
        </form>
      ) : (
        <p className="oj-card p-3 text-sm text-ink-400">
          <Link href="/login" className="text-brand hover:underline">
            {t("Log in")}
          </Link>{" "}
          {t("to join the discussion.")}
        </p>
      )}

      {items.length === 0 && <p className="text-sm text-ink-400">{t("No discussion yet — be the first to post.")}</p>}

      <div className="space-y-3">
        {items.map((d) => (
          <div key={d.id} className="oj-card p-3">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href={`/u/${d.userHandle}`} className="text-sm font-medium text-ink-100 hover:text-brand">
                  {d.userHandle}
                </Link>
                {d.userRole === "ADMIN" && (
                  <span className="rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                    {t("ADMIN")}
                  </span>
                )}
                <span className="font-mono text-xs text-ink-500">{new Date(d.createdAt).toLocaleString()}</span>
              </div>
              {(user?.handle === d.userHandle || user?.role === "ADMIN") && (
                <button onClick={() => remove(d.id)} className="text-xs text-ink-500 hover:text-verdict-wa">
                  {t("Delete")}
                </button>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm text-ink-200">{d.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
