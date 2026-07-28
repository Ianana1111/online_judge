"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Avatar from "@/components/Avatar";
import type { UserSettings } from "@/lib/types";

const LANGUAGES = ["cpp17", "c11", "python3", "java17"];
const AVATAR_MAX_DIMENSION = 200;
const AVATAR_JPEG_QUALITY = 0.85;
// Comfortably under the API's 1mb body limit (see main.ts) with room for the rest of the request.
const AVATAR_MAX_DATA_URL_BYTES = 300_000;

/** Downscales/compresses a picked image client-side so the base64 payload we send stays small —
 * there's no external file storage here (see users.service.updateProfile), so keeping this tiny is
 * what makes storing avatars as a plain DB column workable at all. */
function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function ProfileSettingsForm() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBio(user?.bio ?? "");
    setAvatarPreview(user?.avatarUrl ?? null);
  }, [user]);

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets picking the exact same file again re-fire onChange
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      if (dataUrl.length > AVATAR_MAX_DATA_URL_BYTES) {
        setError("Image is too large even after compression — try a smaller or simpler picture.");
        return;
      }
      setAvatarPreview(dataUrl);
      const { avatarUrl } = await apiFetch<{ bio: string; avatarUrl: string | null }>("/users/me/profile", {
        method: "PATCH",
        body: { avatarUrl: dataUrl },
      });
      if (user) setUser({ ...user, avatarUrl });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not upload avatar");
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    setError(null);
    setUploading(true);
    try {
      const { avatarUrl } = await apiFetch<{ bio: string; avatarUrl: string | null }>("/users/me/profile", {
        method: "PATCH",
        body: { avatarUrl: null },
      });
      setAvatarPreview(avatarUrl);
      if (user) setUser({ ...user, avatarUrl });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not remove avatar");
    } finally {
      setUploading(false);
    }
  }

  async function saveBio() {
    setError(null);
    setSaving(true);
    try {
      const { bio: savedBio } = await apiFetch<{ bio: string; avatarUrl: string | null }>("/users/me/profile", {
        method: "PATCH",
        body: { bio },
      });
      if (user) setUser({ ...user, bio: savedBio });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save motto");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="oj-card space-y-5 p-4">
      <h2 className="text-sm font-semibold text-ink-200">Profile</h2>

      <div>
        <label className="mb-2 block text-sm text-ink-300">Avatar</label>
        <div className="flex items-center gap-4">
          <Avatar avatarUrl={avatarPreview} handle={user.handle} size={72} />
          <div className="flex flex-col gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="oj-btn-secondary px-3 py-1.5 text-xs"
            >
              {uploading ? "Uploading…" : "Change photo"}
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploading}
                className="text-xs text-ink-500 hover:text-verdict-wa"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-ink-300">Motto</label>
        <input
          className="oj-input"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          placeholder="A line about yourself, shown on your public profile"
        />
        <p className="mt-1 text-xs text-ink-500">{bio.length}/200</p>
      </div>

      {error && <p className="text-sm text-verdict-wa">{error}</p>}
      <button onClick={saveBio} disabled={saving || bio === (user.bio ?? "")} className="oj-btn-primary">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}

function ChangeHandleForm() {
  const { user, setUser } = useAuthStore();
  const [handle, setHandle] = useState(user?.handle ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const updated = await apiFetch<{ id: string; handle: string; email: string; role: string }>("/users/me/handle", {
        method: "PATCH",
        body: { handle },
      });
      if (user) setUser({ ...user, handle: updated.handle });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not change name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="oj-card space-y-3 p-4">
      <h2 className="text-sm font-semibold text-ink-200">Change display name</h2>
      <div>
        <label className="mb-1 block text-sm text-ink-300">Handle</label>
        <input
          className="oj-input"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]+"
          title="Letters, numbers, and underscore only"
          required
        />
        <p className="mt-1 text-xs text-ink-500">
          Letters, numbers, and underscore only. This is also what you use to log in if you have a password set.
        </p>
      </div>
      {error && <p className="text-sm text-verdict-wa">{error}</p>}
      <button type="submit" disabled={saving || handle === user?.handle} className="oj-btn-primary">
        {saving ? "Saving…" : success ? "Name changed ✓" : "Save name"}
      </button>
    </form>
  );
}

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

function PreferencesForm() {
  const { user, setUser } = useAuthStore();
  const [defaultLanguage, setDefaultLanguage] = useState("cpp17");
  const [dailyGoal, setDailyGoal] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Falls back to the pre-4e localStorage value on a user's first load after this shipped, so
    // nobody's existing choice silently resets to the default — server value wins once it exists.
    const fallbackLang = localStorage.getItem("oj:settings:language") ?? "cpp17";
    setDefaultLanguage(user?.settings.defaultLanguage ?? fallbackLang);
    setDailyGoal(user?.settings.dailyGoal ?? 1);
  }, [user]);

  async function save() {
    setSaving(true);
    try {
      const { settings } = await apiFetch<{ settings: UserSettings }>("/users/me/settings", {
        method: "PATCH",
        body: { defaultLanguage, dailyGoal },
      });
      localStorage.setItem("oj:settings:language", defaultLanguage);
      if (user) setUser({ ...user, settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="oj-card space-y-4 p-4">
      <h2 className="text-sm font-semibold text-ink-200">Preferences</h2>
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
      <div>
        <label className="mb-1 block text-sm text-ink-300">Daily goal</label>
        <input
          type="number"
          min={1}
          max={50}
          className="oj-input"
          value={dailyGoal}
          onChange={(e) => setDailyGoal(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
        />
        <p className="mt-1 text-xs text-ink-500">Problems to solve per day to keep your streak on track.</p>
      </div>
      <p className="text-xs text-ink-500">Light/dark theme is in the top-right corner of the page, next to your account menu.</p>
      <button onClick={save} disabled={saving} className="oj-btn-primary">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}

const SECTIONS = [
  { key: "profile", label: "Profile", render: () => <ProfileSettingsForm /> },
  { key: "account", label: "Account", render: () => <ChangeHandleForm /> },
  { key: "password", label: "Password", render: () => <ChangePasswordForm /> },
  { key: "preferences", label: "Preferences", render: () => <PreferencesForm /> },
] as const;

export default function SettingsPage() {
  const [active, setActive] = useState<(typeof SECTIONS)[number]["key"]>("profile");
  const activeSection = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">Settings</h1>
      <div className="flex gap-8">
        <aside className="w-40 shrink-0">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`rounded px-3 py-1.5 text-left text-sm font-medium transition-colors ${
                  active === s.key ? "bg-brand/10 text-brand" : "text-ink-300 hover:bg-ink-800 hover:text-ink-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{activeSection.render()}</div>
      </div>
    </div>
  );
}
