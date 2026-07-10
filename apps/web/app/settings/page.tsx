"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

const LANGUAGES = ["cpp17", "c11", "python3", "java17"];

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/users/me/password", {
        method: "PATCH",
        body: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="oj-card space-y-3 p-4">
      <h2 className="text-sm font-semibold text-ink-200">Change password</h2>
      <div>
        <label className="mb-1 block text-sm text-ink-300">Current password</label>
        <input
          type="password"
          className="oj-input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-300">New password</label>
        <input
          type="password"
          className="oj-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-300">Confirm new password</label>
        <input
          type="password"
          className="oj-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      {error && <p className="text-sm text-verdict-wa">{error}</p>}
      <button type="submit" disabled={saving} className="oj-btn-primary">
        {saving ? "Saving…" : success ? "Password changed ✓" : "Change password"}
      </button>
    </form>
  );
}

export default function SettingsPage() {
  const [defaultLanguage, setDefaultLanguage] = useState("cpp17");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDefaultLanguage(localStorage.getItem("oj:settings:language") ?? "cpp17");
  }, []);

  function save() {
    localStorage.setItem("oj:settings:language", defaultLanguage);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-50">Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink-300">Default language</label>
          <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className="oj-input">
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-ink-500">
          Light/dark theme is in the top-right corner of the page, next to your account menu.
        </p>
        <button onClick={save} className="oj-btn-primary">
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
