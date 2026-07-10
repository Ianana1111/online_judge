"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AdminUser, ClassSessionItem, ProblemListResponse } from "@/lib/types";
import HomeworkStatusBadge from "@/components/HomeworkStatusBadge";
import StatementRenderer from "@/components/StatementRenderer";

interface ProblemPick {
  id: string;
  title: string;
}

function ProblemPicker({
  selected,
  onAdd,
  onRemove,
}: {
  selected: ProblemPick[];
  onAdd: (p: ProblemPick) => void;
  onRemove: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const { data: results } = useQuery({
    queryKey: ["problems", "picker", query],
    queryFn: () => apiFetch<ProblemListResponse>(`/problems?page=1&q=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
  });

  return (
    <div>
      <label className="mb-1 block text-sm text-ink-300">Homework problems</label>
      <input
        className="oj-input"
        placeholder="Search problems by title…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results && results.items.length > 0 && (
        <div className="oj-card mt-1 max-h-40 overflow-y-auto p-1">
          {results.items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd({ id: p.id, title: p.title })}
              className="block w-full rounded px-2 py-1 text-left text-sm text-ink-200 hover:bg-ink-800"
            >
              {p.title}
            </button>
          ))}
        </div>
      )}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((p) => (
            <span key={p.id} className="oj-card flex items-center gap-1 px-2 py-1 text-xs text-ink-200">
              {p.title}
              <button type="button" onClick={() => onRemove(p.id)} className="text-ink-500 hover:text-verdict-wa">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EditClassForm({
  studentId,
  cls,
  onDone,
}: {
  studentId: string;
  cls: ClassSessionItem | null;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(cls?.title ?? "");
  const [contentMd, setContentMd] = useState(cls?.contentMd ?? "");
  const [problems, setProblems] = useState<ProblemPick[]>(
    cls?.homework.map((h) => ({ id: h.id, title: h.title })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (cls) {
        await apiFetch(`/classes/${cls.id}`, {
          method: "PATCH",
          body: { title, contentMd, problemIds: problems.map((p) => p.id) },
        });
      } else {
        await apiFetch("/classes", {
          method: "POST",
          body: { studentId, title, contentMd, problemIds: problems.map((p) => p.id) },
        });
      }
      await qc.invalidateQueries({ queryKey: ["classes", "student", studentId] });
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save class");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="oj-card space-y-3 p-4">
      <div>
        <label className="mb-1 block text-sm text-ink-300">Title (optional)</label>
        <input className="oj-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Greedy warm-up" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-300">What was taught today</label>
        <textarea
          className="oj-input h-48 font-mono text-sm"
          value={contentMd}
          onChange={(e) => setContentMd(e.target.value)}
          placeholder={"Markdown — headings, links, and code blocks all render on the student's page:\n\n## Today\nCovered greedy algorithms.\n\n```cpp\n#include <bits/stdc++.h>\n...\n```"}
        />
        {contentMd && (
          <div className="mt-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Preview</p>
            <div className="oj-card p-3">
              <StatementRenderer content={contentMd} />
            </div>
          </div>
        )}
      </div>
      <ProblemPicker
        selected={problems}
        onAdd={(p) => setProblems((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]))}
        onRemove={(id) => setProblems((prev) => prev.filter((p) => p.id !== id))}
      />
      {error && <p className="text-sm text-verdict-wa">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="oj-btn-primary">
          {saving ? "Saving…" : cls ? "Save changes" : "Create class"}
        </button>
        {cls && (
          <button type="button" onClick={onDone} className="oj-btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminStudentClassesClient({ studentId }: { studentId: string }) {
  const { user, status } = useAuthStore();
  const qc = useQueryClient();
  const isAdmin = user?.role === "ADMIN";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: students } = useQuery({
    queryKey: ["users", "admin"],
    queryFn: () => apiFetch<AdminUser[]>("/users"),
    enabled: isAdmin,
  });
  const student = students?.find((s) => s.id === studentId);

  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes", "student", studentId],
    queryFn: () => apiFetch<ClassSessionItem[]>(`/classes/student/${studentId}`),
    enabled: isAdmin && !!studentId,
  });

  if (status === "ready" && !isAdmin) {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  async function removeClass(id: string) {
    if (!confirm("Delete this class and its homework list? This cannot be undone.")) return;
    try {
      await apiFetch(`/classes/${id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["classes", "student", studentId] });
    } catch {
      /* best-effort */
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">
          {student ? student.handle : "Student"}
          <span className="ml-2 text-base font-normal text-ink-400">— class history</span>
        </h1>
      </div>

      {isLoading && <p className="text-sm text-ink-400">Loading…</p>}

      <div className="space-y-3">
        {classes?.map((c) =>
          editingId === c.id ? (
            <EditClassForm key={c.id} studentId={studentId} cls={c} onDone={() => setEditingId(null)} />
          ) : (
            <div key={c.id} className="oj-card p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-semibold text-ink-50">
                  Class {c.number}
                  {c.title && <span className="ml-2 text-sm font-normal text-ink-300">— {c.title}</span>}
                </h2>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setEditingId(c.id)} className="text-ink-400 hover:text-brand">
                    Edit
                  </button>
                  <button onClick={() => removeClass(c.id)} className="text-ink-500 hover:text-verdict-wa">
                    Delete
                  </button>
                </div>
              </div>
              {c.contentMd && (
                <div className="mb-3">
                  <StatementRenderer content={c.contentMd} />
                </div>
              )}
              {c.homework.length > 0 && (
                <div className="space-y-1.5">
                  {c.homework.map((hw) => (
                    <div key={hw.id} className="flex items-center justify-between gap-3 rounded border border-ink-800 px-3 py-1.5">
                      <span className="text-sm text-ink-200">
                        {hw.uvaId ? `UVa ${hw.uvaId} — ` : ""}
                        {hw.title}
                      </span>
                      <HomeworkStatusBadge status={hw.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {creating ? (
        <EditClassForm studentId={studentId} cls={null} onDone={() => setCreating(false)} />
      ) : (
        <button onClick={() => setCreating(true)} className="oj-btn-primary">
          + Record new class
        </button>
      )}
    </div>
  );
}
