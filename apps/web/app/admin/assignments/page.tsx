"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AdminAssignment, AdminUser, ProblemListResponse } from "@/lib/types";

export default function AdminAssignmentsPage() {
  const { user, status } = useAuthStore();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [problemQuery, setProblemQuery] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<{ id: string; title: string }[]>([]);
  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const { data: assignments } = useQuery({
    queryKey: ["assignments", "admin"],
    queryFn: () => apiFetch<AdminAssignment[]>("/assignments"),
    enabled: isAdmin,
  });

  const { data: problemResults } = useQuery({
    queryKey: ["problems", "picker", problemQuery],
    queryFn: () => apiFetch<ProblemListResponse>(`/problems?page=1&q=${encodeURIComponent(problemQuery)}`),
    enabled: isAdmin && problemQuery.length > 0,
  });

  const { data: users } = useQuery({
    queryKey: ["users", "picker"],
    queryFn: () => apiFetch<AdminUser[]>("/users"),
    enabled: isAdmin && !assignToAll,
  });

  if (status === "ready" && !isAdmin) {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  function addProblem(p: { id: string; title: string }) {
    if (selectedProblems.some((sp) => sp.id === p.id)) return;
    setSelectedProblems((prev) => [...prev, p]);
  }

  function removeProblem(id: string) {
    setSelectedProblems((prev) => prev.filter((p) => p.id !== id));
  }

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (selectedProblems.length === 0) {
      setError("Pick at least one problem");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/assignments", {
        method: "POST",
        body: {
          title,
          description,
          dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
          problemIds: selectedProblems.map((p) => p.id),
          assignToAll,
          assigneeUserIds: assignToAll ? [] : selectedUserIds,
        },
      });
      setTitle("");
      setDescription("");
      setDueAt("");
      setSelectedProblems([]);
      setSelectedUserIds([]);
      await qc.invalidateQueries({ queryKey: ["assignments", "admin"] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create assignment");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await apiFetch(`/assignments/${id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["assignments", "admin"] });
    } catch {
      /* best-effort */
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">Admin · Assignments</h1>

      <form onSubmit={createAssignment} className="oj-card space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-ink-300">Title</label>
            <input className="oj-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-300">Due date (optional)</label>
            <input
              type="datetime-local"
              className="oj-input"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-ink-300">Description (optional)</label>
            <textarea
              className="oj-input h-20 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-ink-300">Problems</label>
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
              {selectedProblems.map((p) => (
                <span key={p.id} className="oj-card flex items-center gap-1 px-2 py-1 text-xs text-ink-200">
                  {p.title}
                  <button type="button" onClick={() => removeProblem(p.id)} className="text-ink-500 hover:text-verdict-wa">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-ink-300">
            <input type="checkbox" checked={assignToAll} onChange={(e) => setAssignToAll(e.target.checked)} />
            Assign to all students
          </label>
          {!assignToAll && (
            <div className="oj-card mt-2 max-h-40 overflow-y-auto p-2">
              {users
                ?.filter((u) => u.role === "USER")
                .map((u) => (
                  <label key={u.id} className="flex items-center gap-2 py-0.5 text-sm text-ink-200">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={(e) =>
                        setSelectedUserIds((prev) =>
                          e.target.checked ? [...prev, u.id] : prev.filter((id) => id !== u.id),
                        )
                      }
                    />
                    {u.handle}
                  </label>
                ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-verdict-wa">{error}</p>}
        <button type="submit" disabled={saving} className="oj-btn-primary">
          {saving ? "Creating…" : "Create assignment"}
        </button>
      </form>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">Existing assignments</h2>
        <div className="space-y-2">
          {assignments?.map((a) => (
            <div key={a.id} className="oj-card p-3">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-medium text-ink-50">{a.title}</h3>
                <button onClick={() => remove(a.id)} className="text-xs text-ink-500 hover:text-verdict-wa">
                  Delete
                </button>
              </div>
              {a.dueAt && (
                <p className="mb-1 font-mono text-xs text-ink-400">Due {new Date(a.dueAt).toLocaleString()}</p>
              )}
              <p className="text-xs text-ink-400">
                {a.problemCount} problems · {a.assigneeCount} students
              </p>
              <p className="mt-1 text-xs text-ink-500">{a.problems.map((p) => p.title).join(", ")}</p>
            </div>
          ))}
          {assignments?.length === 0 && <p className="text-sm text-ink-400">No assignments yet.</p>}
        </div>
      </div>
    </div>
  );
}
