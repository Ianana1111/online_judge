"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TAIWAN_UNIVERSITY_DOMAINS } from "@oj/shared";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Avatar from "@/components/Avatar";
import SchoolCombobox from "@/components/SchoolCombobox";
import { resizeImageToDataUrl, AVATAR_MAX_DATA_URL_BYTES } from "@/lib/avatarUpload";
import type { UserSettings } from "@/lib/types";
import { useLocale, useT } from "@/lib/i18n/LocaleContext";

const LANGUAGES = ["cpp17", "c11", "python3", "java17"];

const RESEND_COOLDOWN_MS = 60_000;

/** Only rendered once a school is picked (see ProfileSettingsForm) — lets the user prove they
 * actually belong to that school by verifying an address on its registered domain, which is what
 * lets the leaderboard trust school groupings instead of anyone typing in a prestigious name.
 * "其他" (the catch-all option) has no known domain and so never gets this section at all. */
function SchoolEmailVerification({ school }: { school: string }) {
  const t = useT();
  const { user, setUser } = useAuthStore();
  const domain = (TAIWAN_UNIVERSITY_DOMAINS as Record<string, string | undefined>)[school];
  const [email, setEmail] = useState(user?.schoolEmail ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (cooldownUntil <= now) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil, now]);

  if (!user || !domain) return null;
  const verified = !!user.schoolVerifiedAt;
  const cooling = cooldownUntil > now;
  const domainMismatch = email.length > 0 && !email.toLowerCase().endsWith(`@${domain}`) && !email.toLowerCase().endsWith(`.${domain}`);

  async function send() {
    setError(null);
    setSending(true);
    try {
      await apiFetch("/users/me/school/verify/request", { method: "POST", body: { email } });
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      if (user) setUser({ ...user, schoolEmail: email });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Couldn't send the verification email — try again in a moment."));
    } finally {
      setSending(false);
    }
  }

  if (verified) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-verdict-ac">
        ✓ {t("Verified via {email}", { email: user.schoolEmail ?? "" })}
      </p>
    );
  }

  return (
    <div className="mt-2 rounded border border-ink-700 bg-ink-900/40 p-3">
      <p className="text-xs text-ink-400">
        {t("Verify a @{domain} email to attach {school} to your leaderboard entry.", { domain, school })}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          className="oj-input min-w-0 flex-1 text-sm"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`you@${domain}`}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || cooling || !email || domainMismatch}
          className="oj-btn-secondary shrink-0 px-3 py-1.5 text-xs"
        >
          {sending
            ? t("Sending…")
            : cooling
              ? t("Wait {n}s", { n: Math.ceil((cooldownUntil - now) / 1000) })
              : user.schoolEmail
                ? t("Resend")
                : t("Send verification email")}
        </button>
      </div>
      {domainMismatch && <p className="mt-1.5 text-xs text-verdict-wa">{t("That doesn't look like a @{domain} address.", { domain })}</p>}
      {!domainMismatch && user.schoolEmail && !error && (
        <p className="mt-1.5 text-xs text-ink-500">
          {t("Verification email sent to {email} — check your inbox for the link.", { email: user.schoolEmail })}
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-verdict-wa">{error}</p>}
    </div>
  );
}

/** Reads ?schoolVerified=0|1 left by the API's redirect after the emailed link is clicked
 * (users.controller.confirmSchoolVerification), re-hydrates the user (the verification happened
 * server-side, outside this tab's own state) and shows the result once, then strips the param so
 * a reload doesn't re-show the banner. Split out from the page body since useSearchParams needs
 * its own Suspense boundary. */
function SchoolVerifiedBanner() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrate = useAuthStore((s) => s.hydrate);
  const result = searchParams.get("schoolVerified");

  useEffect(() => {
    if (!result) return;
    if (result === "1") hydrate();
    router.replace("/settings", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (!result) return null;
  return (
    <div
      className={`mb-4 rounded border p-3 text-sm ${
        result === "1" ? "border-verdict-ac/40 bg-verdict-ac/10 text-verdict-ac" : "border-verdict-wa/40 bg-verdict-wa/10 text-verdict-wa"
      }`}
    >
      {result === "1" ? t("School email verified ✓") : t("That verification link is invalid or expired — try sending a new one.")}
    </div>
  );
}

function ProfileSettingsForm() {
  const t = useT();
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [schoolSaving, setSchoolSaving] = useState(false);

  useEffect(() => {
    setBio(user?.bio ?? "");
    setAvatarPreview(user?.avatarUrl ?? null);
  }, [user]);

  async function onSchoolChange(school: string | null) {
    if (!user) return;
    setError(null);
    setSchoolSaving(true);
    try {
      const updated = await apiFetch<{
        bio: string;
        avatarUrl: string | null;
        school: string | null;
        schoolEmail: string | null;
        schoolVerifiedAt: string | null;
      }>("/users/me/profile", { method: "PATCH", body: { school } });
      // A school change resets verification server-side (see users.service.updateProfile) —
      // carry that reset into the store too, not just the new school name, so the verification
      // section doesn't keep showing the previous school's "verified" state for a stale beat.
      setUser({ ...user, school: updated.school, schoolEmail: updated.schoolEmail, schoolVerifiedAt: updated.schoolVerifiedAt });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not update school"));
    } finally {
      setSchoolSaving(false);
    }
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets picking the exact same file again re-fire onChange
    if (!file) return;
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
      if (user) setUser({ ...user, avatarUrl });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not upload avatar"));
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
      setError(e instanceof ApiError ? e.message : t("Could not remove avatar"));
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
      setError(e instanceof ApiError ? e.message : t("Could not save motto"));
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="oj-card space-y-5 p-4">
      <h2 className="text-sm font-semibold text-ink-200">{t("Profile")}</h2>

      <div>
        <label className="mb-2 block text-sm text-ink-300">{t("Avatar")}</label>
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
              {uploading ? t("Uploading…") : t("Change photo")}
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploading}
                className="text-xs text-ink-500 hover:text-verdict-wa"
              >
                {t("Remove photo")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-ink-300">{t("Motto")}</label>
        <input
          className="oj-input"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          placeholder={t("A line about yourself, shown on your public profile")}
        />
        <p className="mt-1 text-xs text-ink-500">{bio.length}/200</p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-ink-300">{t("School")}</label>
        <SchoolCombobox value={user.school} onChange={onSchoolChange} />
        <p className="mt-1 text-xs text-ink-500">
          {schoolSaving ? t("Saving…") : t("Shown on your public profile and the leaderboard.")}
        </p>
        {user.school && <SchoolEmailVerification key={user.school} school={user.school} />}
      </div>

      {error && <p className="text-sm text-verdict-wa">{error}</p>}
      <button onClick={saveBio} disabled={saving || bio === (user.bio ?? "")} className="oj-btn-primary">
        {saving ? t("Saving…") : saved ? t("Saved ✓") : t("Save")}
      </button>
    </div>
  );
}

function ChangeHandleForm() {
  const t = useT();
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
      setError(e instanceof ApiError ? e.message : t("Could not change name"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="oj-card space-y-3 p-4">
      <h2 className="text-sm font-semibold text-ink-200">{t("Change display name")}</h2>
      <div>
        <label className="mb-1 block text-sm text-ink-300">{t("Handle")}</label>
        <input
          className="oj-input"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]+"
          title={t("Letters, numbers, and underscore only")}
          required
        />
        <p className="mt-1 text-xs text-ink-500">
          {t("Letters, numbers, and underscore only. This is also what you use to log in if you have a password set.")}
        </p>
      </div>
      {error && <p className="text-sm text-verdict-wa">{error}</p>}
      <button type="submit" disabled={saving || handle === user?.handle} className="oj-btn-primary">
        {saving ? t("Saving…") : success ? t("Name changed ✓") : t("Save name")}
      </button>
    </form>
  );
}

function ChangePasswordForm() {
  const t = useT();
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
      setError(t("New password and confirmation don't match"));
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
      setError(e instanceof ApiError ? e.message : t("Could not change password"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="oj-card space-y-3 p-4">
      <h2 className="text-sm font-semibold text-ink-200">{t("Change password")}</h2>
      <div>
        <label className="mb-1 block text-sm text-ink-300">{t("Current password")}</label>
        <input
          type="password"
          className="oj-input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-300">{t("New password")}</label>
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
        <label className="mb-1 block text-sm text-ink-300">{t("Confirm new password")}</label>
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
        {saving ? t("Saving…") : success ? t("Password changed ✓") : t("Change password")}
      </button>
    </form>
  );
}

function LanguageToggle() {
  const t = useT();
  const { locale, setLocale } = useLocale();

  return (
    <div>
      <label className="mb-1.5 block text-sm text-ink-300">{t("Display language")}</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setLocale("zh-TW")}
          className={`oj-card p-2 text-sm font-medium transition-colors ${
            locale === "zh-TW" ? "border-brand text-brand" : "text-ink-300 hover:border-ink-500"
          }`}
        >
          繁體中文
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`oj-card p-2 text-sm font-medium transition-colors ${
            locale === "en" ? "border-brand text-brand" : "text-ink-300 hover:border-ink-500"
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}

function PreferencesForm() {
  const t = useT();
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
      <h2 className="text-sm font-semibold text-ink-200">{t("Preferences")}</h2>
      <LanguageToggle />
      <div>
        <label className="mb-1 block text-sm text-ink-300">{t("Default language")}</label>
        <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className="oj-input">
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-ink-300">{t("Daily goal")}</label>
        <input
          type="number"
          min={1}
          max={50}
          className="oj-input"
          value={dailyGoal}
          onChange={(e) => setDailyGoal(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
        />
        <p className="mt-1 text-xs text-ink-500">{t("Problems to solve per day to keep your streak on track.")}</p>
      </div>
      <p className="text-xs text-ink-500">
        {t("Light/dark theme is in the top-right corner of the page, next to your account menu.")}
      </p>
      <button onClick={save} disabled={saving} className="oj-btn-primary">
        {saving ? t("Saving…") : saved ? t("Saved ✓") : t("Save")}
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
  const t = useT();
  const [active, setActive] = useState<(typeof SECTIONS)[number]["key"]>("profile");
  const activeSection = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">{t("Settings")}</h1>
      <Suspense>
        <SchoolVerifiedBanner />
      </Suspense>
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
                {t(s.label)}
              </button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{activeSection.render()}</div>
      </div>
    </div>
  );
}
