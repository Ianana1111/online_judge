"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { ContestListItem, ProblemListResponse } from "@/lib/types";

const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function AdminContestsPage() {
  const { user, status } = useAuthStore();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState<"CPE" | "VIRTUAL" | "PUBLIC">("PUBLIC");
  const [scheduled, setScheduled] = useState(false);
  const [startAt, setStartAt] = useState("");
  const [durationMin, setDurationMin] = useState(180);
  const [problemQuery, setProblemQuery] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<{ id: string; title: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const { data: contests } = useQuery({
    queryKey: ["contests"],
    queryFn: () => apiFetch<ContestListItem[]>("/contests"),
    enabled: isAdmin,
  });

  const { data: problemResults } = useQuery({
    queryKey: ["problems", "picker", problemQuery],
    queryFn: () => apiFetch<ProblemListResponse>(`/problems?page=1&q=${encodeURIComponent(problemQuery)}`),
    enabled: isAdmin && problemQuery.length > 0,
  });

  if (status === "ready" && !isAdmin) {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  function addProblem(p: { id: string; title: string }) {
    if (selectedProblems.some((sp) => sp.id === p.id)) return;
    if (selectedProblems.length >= LABELS.length) return;
    setSelectedProblems((prev) => [...prev, p]);
  }

  function removeProblem(id: string) {
    setSelectedProblems((prev) => prev.filter((p) => p.id !== id));
  }

  async function createContest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (selectedProblems.length === 0) {
      setError("Pick at least one problem");
      return;
    }
    if (scheduled && !startAt) {
      setError("Pick a start time for a scheduled/group session");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/contests", {
        method: "POST",
        body: {
          title,
          slug,
          kind,
          startAt: scheduled ? new Date(startAt).toISOString() : undefined,
          durationMin,
          problems: selectedProblems.map((p, i) => ({ problemId: p.id, label: LABELS[i] })),
        },
      });
      setTitle("");
      setSlug("");
      setStartAt("");
      setSelectedProblems([]);
      await qc.invalidateQueries({ queryKey: ["contests"] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create contest");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">Admin · Contests</h1>

      <form onSubmit={createContest} className="oj-card space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-ink-300">Title</label>
            <input className="oj-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-300">Slug</label>
            <input className="oj-input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-300">Kind</label>
            <select className="oj-input" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              <option value="PUBLIC">Public</option>
              <option value="CPE">CPE</option>
              <option value="VIRTUAL">Virtual</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-300">Duration (minutes)</label>
            <input
              type="number"
              className="oj-input"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              min={10}
              max={600}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input type="checkbox" checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} />
            Scheduled group session (everyone shares one clock — start it live for multiple students at once)
          </label>
          {scheduled ? (
            <div className="mt-2">
              <label className="mb-1 block text-sm text-ink-300">Start time</label>
              <input
                type="datetime-local"
                className="oj-input max-w-xs"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
          ) : (
            <p className="mt-1 text-xs text-ink-500">
              Unscheduled = virtual mode: each student gets their own personal {durationMin}-minute window
              whenever they click "start".
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-300">Problems (labeled A, B, C… in the order added)</label>
          <input
            className="oj-input"
            placeholder="Search problems by title…"
            value={problemQuery}
            onChange={(e) => setProblemQuery(e.target.value)}
          />
          {problemResults && problemResults.items.length > 0 && (
            <div className="oj-card mt-1 max-h-40 overflow-y-auto p-1">
              {problemResults.items.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProblem({ id: p.id, title: p.title })}
                  className="block w-full rounded px-2 py-1 text-left text-sm text-ink-200 hover:bg-ink-800"
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
          {selectedProblems.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedProblems.map((p, i) => (
                <span key={p.id} className="oj-card flex items-center gap-1 px-2 py-1 text-xs text-ink-200">
                  <span className="font-mono text-brand">{LABELS[i]}</span> {p.title}
                  <button type="button" onClick={() => removeProblem(p.id)} className="text-ink-500 hover:text-verdict-wa">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-verdict-wa">{error}</p>}
        <button type="submit" disabled={saving} className="oj-btn-primary">
          {saving ? "Creating…" : "Create contest"}
        </button>
      </form>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">Existing contests</h2>
        <table className="oj-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Kind</th>
              <th>Start</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {contests?.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td className="text-xs text-ink-400">{c.kind}</td>
                <td className="font-mono text-xs text-ink-400">
                  {c.startAt ? new Date(c.startAt).toLocaleString() : "virtual (per-user)"}
                </td>
                <td className="font-mono text-xs text-ink-400">{c.durationMin}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
