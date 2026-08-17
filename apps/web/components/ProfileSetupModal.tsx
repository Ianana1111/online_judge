"use client";

import { useRef, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Avatar from "@/components/Avatar";
import SchoolCombobox from "@/components/SchoolCombobox";
import { resizeImageToDataUrl, AVATAR_MAX_DATA_URL_BYTES } from "@/lib/avatarUpload";
import type { UserSettings } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

/**
 * One-time "finish setting up your account" prompt — shown by ProfileSetupGate right after
 * registration (and, incidentally, to any existing account that never had the chance to set a
 * school before this feature shipped). Skippable: nothing here is required to use the site, it
 * just makes the leaderboard's school filter meaningfully populated sooner.
 */
export default function ProfileSetupModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [handle, setHandle] = useState(user?.handle ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [school, setSchool] = useState<string | null>(user?.school ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function dismiss() {
    if (!user) return;
    try {
      const { settings } = await apiFetch<{ settings: UserSettings }>("/users/me/settings", {
        method: "PATCH",
        body: { profileSetupDismissed: true },
      });
      setUser({ ...user, settings });
    } catch {
      /* best-effort — closing the modal client-side still works even if this fails */
    }
    onClose();
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      if (dataUrl.length > AVATAR_MAX_DATA_URL_BYTES) {
        setError(t("Image is too large even after compression — try a smaller or simpler picture."));
        return;
      }
      setAvatarPreview(dataUrl);
      const { avatarUrl } = await apiFetch<{ bio: string; avatarUrl: string | null }>("/users/me/profile", {
        method: "PATCH",
        body: { avatarUrl: dataUrl },
      });
      setUser({ ...user, avatarUrl });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not upload avatar"));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      if (handle !== user.handle) {
        const updated = await apiFetch<{ id: string; handle: string; email: string; role: string }>(
          "/users/me/handle",
          { method: "PATCH", body: { handle } },
        );
        setUser({ ...user, handle: updated.handle });
      }
      if (school !== user.school) {
        const updated = await apiFetch<{ bio: string; avatarUrl: string | null; school: string | null }>(
          "/users/me/profile",
          { method: "PATCH", body: { school } },
        );
        setUser({ ...user, school: updated.school });
      }
      await dismiss();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not save your profile"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="oj-card w-full max-w-md p-6">
        <h2 className="font-display text-lg font-bold text-ink-50">{t("Welcome! Quick setup")}</h2>
        <p className="mt-1 text-sm text-ink-400">
          {t("Add your school so classmates can find each other on the leaderboard — takes a few seconds, and you can always change this later in Settings.")}
        </p>

        <div className="mt-5 flex items-center gap-4">
          <Avatar avatarUrl={avatarPreview} handle={user.handle} size={64} />
          <div className="flex flex-col gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="oj-btn-secondary px-3 py-1.5 text-xs"
            >
              {uploading ? t("Uploading…") : t("Change photo")}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm text-ink-300">{t("Nickname")}</label>
          <input
            className="oj-input"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_]+"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm text-ink-300">{t("School")}</label>
          <SchoolCombobox value={school} onChange={setSchool} />
        </div>

        {error && <p className="mt-3 text-sm text-verdict-wa">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" onClick={dismiss} className="text-sm text-ink-500 hover:text-ink-300">
            {t("Skip for now")}
          </button>
          <button type="button" onClick={save} disabled={saving} className="oj-btn-primary px-5 py-2 text-sm">
            {saving ? t("Saving…") : t("Save")}
          </button>
        </div>
      </div>
    </div>
  );
}
