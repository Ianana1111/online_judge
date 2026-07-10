"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ProblemNote } from "@/lib/types";

export default function ProblemNotePanel({ slug }: { slug: string }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["problem-note", slug],
    queryFn: () => apiFetch<ProblemNote>(`/problems/${slug}/note`),
    enabled: !!user,
  });

  useEffect(() => {
    if (data) setContent(data.content);
  }, [data]);

  if (!user) {
    return <p className="text-sm text-ink-400">Log in to keep your own private notes on this problem.</p>;
  }
  if (isLoading) return <p className="text-sm text-ink-400">Loading…</p>;

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch(`/problems/${slug}/note`, { method: "PUT", body: { content } });
      await qc.invalidateQueries({ queryKey: ["problem-note", slug] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-500">Private — only you can see this.</p>
      <textarea
        className="oj-input h-48 font-mono text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your approach, gotchas, things to remember next time…"
      />
      <button onClick={save} disabled={saving} className="oj-btn-primary">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save note"}
      </button>
    </div>
  );
}
