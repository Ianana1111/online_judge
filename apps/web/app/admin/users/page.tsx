"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AdminUser } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const EMPTY_FORM = { handle: "", email: "", password: "", role: "USER" as "USER" | "ADMIN" };

export default function AdminUsersPage() {
  const t = useT();
  const { user, status } = useAuthStore();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ handle: string; password: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["users", "admin"],
    queryFn: () => apiFetch<AdminUser[]>("/users"),
    enabled: user?.role === "ADMIN",
  });

  if (status === "ready" && user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">{t("Admins only.")}</p>;
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
      setError(e instanceof ApiError ? e.message : t("Could not create account"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStudent(id: string, isStudent: boolean) {
    try {
      await apiFetch(`/users/${id}/student`, { method: "PATCH", body: { isStudent } });
      await qc.invalidateQueries({ queryKey: ["users", "admin"] });
    } catch {
      /* best-effort */
    }
  }

  async function grantPlan(id: string, period: "MONTHLY" | "YEARLY") {
    setPlanError(null);
    setActingId(id);
    try {
      await apiFetch(`/billing/admin/${id}/grant`, { method: "POST", body: { period } });
      await qc.invalidateQueries({ queryKey: ["users", "admin"] });
    } catch (e) {
      setPlanError(e instanceof ApiError ? e.message : t("Could not grant Pro"));
    } finally {
      setActingId(null);
    }
  }

  async function revokePlan(id: string) {
    if (!confirm(t("Revoke this user's Pro plan and drop them back to Free immediately?"))) return;
    setPlanError(null);
    setActingId(id);
    try {
      await apiFetch(`/billing/admin/${id}/revoke`, { method: "POST" });
      await qc.invalidateQueries({ queryKey: ["users", "admin"] });
    } catch (e) {
      setPlanError(e instanceof ApiError ? e.message : t("Could not revoke Pro"));
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">{t("Admin · Students & Users")}</h1>
      <p className="text-sm text-ink-400">
        {t(
          "Anyone can create their own account now — use the toggle below to mark someone as your actual tutoring student, which is what gives them the Class-tracking features. You can still provision an account directly here too.",
        )}
      </p>

      <form onSubmit={createUser} className="oj-card grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label htmlFor="new-user-handle" className="mb-1 block text-sm text-ink-300">{t("Handle")}</label>
          <input
            id="new-user-handle"
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
          <label htmlFor="new-user-email" className="mb-1 block text-sm text-ink-300">{t("Email")}</label>
          <input
            id="new-user-email"
            type="email"
            className="oj-input"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="new-user-password" className="mb-1 block text-sm text-ink-300">{t("Initial password")}</label>
          <input
            id="new-user-password"
            type="text"
            className="oj-input"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            minLength={8}
            required
          />
        </div>
        <div>
          <label htmlFor="new-user-role" className="mb-1 block text-sm text-ink-300">{t("Role")}</label>
          <select
            id="new-user-role"
            className="oj-input"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "USER" | "ADMIN" }))}
          >
            <option value="USER">{t("Student")}</option>
            <option value="ADMIN">{t("Admin")}</option>
          </select>
        </div>
        {error && <p className="text-sm text-verdict-wa sm:col-span-2">{error}</p>}
        <button type="submit" disabled={saving} className="oj-btn-primary sm:col-span-2">
          {saving ? t("Creating…") : t("Create account")}
        </button>
      </form>

      {created && (
        <p className="oj-card p-3 text-sm text-ink-200">
          {t("Created")} <span className="font-mono text-brand">{created.handle}</span> / {t("password")}{" "}
          <span className="font-mono text-brand">{created.password}</span> —{" "}
          {t("share these with the student now, they won't be shown again here.")}
        </p>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-200">{t("All accounts")}</h2>
        <p className="mb-2 text-xs text-ink-500">
          {t("Use Grant if someone paid but wasn't upgraded — extends from their current expiry, same as a real purchase.")}
        </p>
        {planError && <p className="mb-2 text-sm text-verdict-wa">{planError}</p>}
        <table className="oj-table">
          <thead>
            <tr>
              <th>{t("Handle")}</th>
              <th>{t("Email")}</th>
              <th>{t("Role")}</th>
              <th>{t("Plan")}</th>
              <th>{t("My student")}</th>
              <th>{t("Created")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u) => {
              // Admins are never capped and students are auto-Pro regardless of the plan field
              // (see billing.service isUnlimited/isProActive) — granting/revoking here wouldn't
              // change what they actually see, so don't offer controls that couldn't do anything.
              const canManagePlan = u.role === "USER" && !u.isStudent;
              const acting = actingId === u.id;
              return (
                <tr key={u.id}>
                  <td>{u.handle}</td>
                  <td className="text-xs text-ink-400">{u.email}</td>
                  <td className="text-xs text-ink-400">{u.role}</td>
                  <td className="text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {u.plan === "PRO" ? (
                        <span className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-1.5 py-0.5 font-semibold text-brand">
                          Pro
                        </span>
                      ) : (
                        <span className="text-ink-500">{t("Free")}</span>
                      )}
                      {u.plan === "PRO" && u.planExpiresAt && (
                        <span className="text-ink-500">
                          {t("until {date}", { date: new Date(u.planExpiresAt).toLocaleDateString() })}
                        </span>
                      )}
                    </div>
                    {canManagePlan && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => grantPlan(u.id, "MONTHLY")}
                          disabled={acting}
                          className="text-[11px] text-brand hover:underline disabled:opacity-50"
                        >
                          {t("+1mo")}
                        </button>
                        <button
                          type="button"
                          onClick={() => grantPlan(u.id, "YEARLY")}
                          disabled={acting}
                          className="text-[11px] text-brand hover:underline disabled:opacity-50"
                        >
                          {t("+1yr")}
                        </button>
                        {u.plan === "PRO" && (
                          <button
                            type="button"
                            onClick={() => revokePlan(u.id)}
                            disabled={acting}
                            className="text-[11px] text-ink-500 hover:text-verdict-wa disabled:opacity-50"
                          >
                            {t("Revoke")}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {u.role === "USER" && (
                      <label className="flex items-center gap-2 text-xs text-ink-300">
                        <input
                          type="checkbox"
                          checked={u.isStudent}
                          onChange={(e) => toggleStudent(u.id, e.target.checked)}
                        />
                        {u.isStudent ? t("Student") : "—"}
                      </label>
                    )}
                  </td>
                  <td className="font-mono text-xs text-ink-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
