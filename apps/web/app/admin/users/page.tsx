"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AdminUser } from "@/lib/types";

const EMPTY_FORM = { handle: "", email: "", password: "", role: "USER" as "USER" | "ADMIN" };

export default function AdminUsersPage() {
  const { user, status } = useAuthStore();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ handle: string; password: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["users", "admin"],
    queryFn: () => apiFetch<AdminUser[]>("/users"),
    enabled: user?.role === "ADMIN",
  });

  if (status === "ready" && user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiFetch("/users", { method: "POST", body: form });
      setCreated({ handle: form.handle, password: form.password });
      setForm(EMPTY_FORM);
      await qc.invalidateQueries({ queryKey: ["users", "admin"] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">Admin · Students &amp; Users</h1>
      <p className="text-sm text-ink-400">
        There's no public sign-up — create each student's account here and share the handle/password with
        them directly.
      </p>

      <form onSubmit={createUser} className="oj-card grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-ink-300">Handle</label>
          <input
            className="oj-input"
            value={form.handle}
            onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
            pattern="[a-zA-Z0-9_]+"
            minLength={3}
            maxLength={24}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Email</label>
          <input
            type="email"
            className="oj-input"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Initial password</label>
          <input
            type="text"
            className="oj-input"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            minLength={8}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Role</label>
          <select
            className="oj-input"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "USER" | "ADMIN" }))}
          >
            <option value="USER">Student</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-verdict-wa sm:col-span-2">{error}</p>}
        <button type="submit" disabled={saving} className="oj-btn-primary sm:col-span-2">
          {saving ? "Creating…" : "Create account"}
        </button>
      </form>

      {created && (
        <p className="oj-card p-3 text-sm text-ink-200">
          Created <span className="font-mono text-brand">{created.handle}</span> / password{" "}
          <span className="font-mono text-brand">{created.password}</span> — share these with the student now,
          they won't be shown again here.
        </p>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">All accounts</h2>
        <table className="oj-table">
          <thead>
            <tr>
              <th>Handle</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u) => (
              <tr key={u.id}>
                <td>{u.handle}</td>
                <td className="text-xs text-ink-400">{u.email}</td>
                <td className="text-xs text-ink-400">{u.role}</td>
                <td className="font-mono text-xs text-ink-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
