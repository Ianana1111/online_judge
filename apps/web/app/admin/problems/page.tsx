"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ProblemListResponse } from "@/lib/types";

const EMPTY_FORM = {
  slug: "",
  title: "",
  statementMd: "",
  inputSpecMd: "",
  outputSpecMd: "",
  timeLimitMs: 1000,
  memoryLimitKb: 65536,
  difficulty: 1,
  source: "CUSTOM" as const,
};

export default function AdminProblemsPage() {
  const { user, status } = useAuthStore();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["problems", "admin"],
    queryFn: () => apiFetch<ProblemListResponse>("/problems?page=1"),
    enabled: user?.role === "ADMIN",
  });

  if (status === "ready" && user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  async function createProblem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiFetch("/problems", { method: "POST", body: form });
      setForm(EMPTY_FORM);
      await qc.invalidateQueries({ queryKey: ["problems", "admin"] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create problem");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">Admin · Problems</h1>

      <form onSubmit={createProblem} className="oj-card grid gap-3 p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-ink-300">Title</label>
          <input
            className="oj-input"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Slug</label>
          <input
            className="oj-input"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Source</label>
          <select
            className="oj-input"
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as typeof form.source }))}
          >
            <option value="CUSTOM">Custom</option>
            <option value="UVA">UVa</option>
            <option value="CPE">CPE</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-ink-300">Statement (Markdown)</label>
          <textarea
            className="oj-input h-32 font-mono text-xs"
            value={form.statementMd}
            onChange={(e) => setForm((f) => ({ ...f, statementMd: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Time limit (ms)</label>
          <input
            type="number"
            className="oj-input"
            value={form.timeLimitMs}
            onChange={(e) => setForm((f) => ({ ...f, timeLimitMs: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Memory limit (KB)</label>
          <input
            type="number"
            className="oj-input"
            value={form.memoryLimitKb}
            onChange={(e) => setForm((f) => ({ ...f, memoryLimitKb: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Difficulty (1-4)</label>
          <input
            type="number"
            min={1}
            max={4}
            className="oj-input"
            value={form.difficulty}
            onChange={(e) => setForm((f) => ({ ...f, difficulty: Number(e.target.value) }))}
          />
        </div>
        {error && <p className="text-sm text-verdict-wa sm:col-span-2">{error}</p>}
        <button type="submit" disabled={saving} className="oj-btn-primary sm:col-span-2">
          {saving ? "Creating…" : "Create problem"}
        </button>
        <p className="text-xs text-ink-500 sm:col-span-2">
          Submissions are judged by the real UVa Online Judge, not locally — set a UVa problem id above so
          students' submissions have somewhere to be judged against.
        </p>
      </form>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">Existing problems</h2>
        <table className="oj-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Source</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td className="font-mono text-xs text-ink-400">{p.slug}</td>
                <td className="text-xs text-ink-400">{p.source}</td>
                <td className="font-mono text-xs text-brand">{"★".repeat(p.difficulty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
