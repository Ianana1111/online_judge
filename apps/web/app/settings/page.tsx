"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TAIWAN_UNIVERSITY_DOMAINS } from "@oj/shared";
import { apiFetch, apiUrl, ApiError, setCsrfToken } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Avatar from "@/components/Avatar";
import SchoolCombobox from "@/components/SchoolCombobox";
import { resizeImageToDataUrl, AVATAR_MAX_DATA_URL_BYTES } from "@/lib/avatarUpload";
import type { UserSettings } from "@/lib/types";
import { useLocale, useT } from "@/lib/i18n/LocaleContext";
import { useFocusTrap } from "@/lib/useFocusTrap";

const LANGUAGES = ["cpp17", "c11", "python3", "java17"];

const RESEND_COOLDOWN_MS = 60_000;

/** Only rendered once a school is picked and while it is still unverified (see
 * ProfileSettingsForm) — lets the user prove they actually belong to that school by verifying an
 * address on its registered domain, which is what lets the leaderboard trust school groupings
 * instead of anyone typing in a prestigious name. "其他" (the catch-all option) has no known
 * domain and so never gets this section at all. */
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

  const schoolLocked = !!user.school && !!user.schoolVerifiedAt;

  return (
    <div className="oj-card space-y-5 p-4">
      <h2 className="text-sm font-semibold text-ink-200">{t("Profile")}</h2>

      <div>
        <label htmlFor="settings-avatar" className="mb-2 block text-sm text-ink-300">{t("Avatar")}</label>
        <div className="flex items-center gap-4">
          <Avatar avatarUrl={avatarPreview} handle={user.handle} size={72} />
          <div className="flex flex-col gap-2">
            <input id="settings-avatar" ref={fileInputRef} type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />
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
        <label htmlFor="settings-bio" className="mb-1 block text-sm text-ink-300">{t("Motto")}</label>
        <input
          id="settings-bio"
          className="oj-input"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          placeholder={t("A line about yourself, shown on your public profile")}
        />
        <p className="mt-1 text-xs text-ink-500">{bio.length}/200</p>
      </div>

      <div>
        <label htmlFor="settings-school" className="mb-1 block text-sm text-ink-300">{t("School")}</label>
        {schoolLocked ? (
          // Once verified the school is permanent (enforced in users.service.updateProfile too) —
          // showing a disabled picker would invite clicking at something that can never change, so
          // it becomes a plain read-only field instead.
          <>
            <div className="flex items-center justify-between gap-2 rounded border border-verdict-ac/40 bg-verdict-ac/5 px-3 py-2">
              <span className="min-w-0 truncate text-sm text-ink-50">{user.school}</span>
              <span className="shrink-0 text-xs font-semibold text-verdict-ac">✓ {t("Verified")}</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              {t("Verified via {email} — your school is now permanent and can't be changed.", {
                email: user.schoolEmail ?? "",
              })}
            </p>
          </>
        ) : (
          <>
            <SchoolCombobox id="settings-school" value={user.school} onChange={onSchoolChange} />
            <p className="mt-1 text-xs text-ink-500">
              {schoolSaving ? t("Saving…") : t("Shown on your public profile and the leaderboard.")}
            </p>
            {user.school && <SchoolEmailVerification key={user.school} school={user.school} />}
          </>
        )}
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
        <label htmlFor="settings-handle" className="mb-1 block text-sm text-ink-300">{t("Handle")}</label>
        <input
          id="settings-handle"
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

function DeleteAccountConfirmDialog({
  hasPassword,
  reauthed,
  reauthError,
  onCancel,
  onConfirm,
}: {
  hasPassword: boolean;
  reauthed: boolean;
  reauthError: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void>;
}) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(
    reauthError ? t("That didn't match your account's Google login — try again with the same Google account.") : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(true);
  const identityConfirmed = hasPassword || reauthed;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  async function handleConfirm() {
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not delete your account"));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={onCancel}>
      <div ref={trapRef} tabIndex={-1} className="oj-card w-full max-w-sm p-5 outline-none" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-base font-semibold text-verdict-wa">{t("Delete your account?")}</h2>
        <p className="mt-2 text-sm text-ink-300">
          {t(
            "This schedules your account and everything tied to it — submissions, discussion posts, notes, achievements — for permanent deletion in 3 days. You're logged out immediately; logging back in before then lets you cancel it. If you have an active Pro subscription, it will be cancelled first so you won't be charged again.",
          )}
        </p>
        {hasPassword ? (
          <div className="mt-4">
            <label htmlFor="delete-account-password" className="mb-1 block text-sm text-ink-300">
              {t("Current password")}
            </label>
            <input
              id="delete-account-password"
              type="password"
              className="oj-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        ) : reauthed ? (
          <p className="mt-4 text-sm text-verdict-ac">{t("Google identity re-verified ✓")}</p>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-ink-300">
              {t("This account signs in with Google — re-authenticate with it first to confirm it's really you.")}
            </p>
            <a href={apiUrl("/auth/google?intent=delete_account")} className="oj-btn-secondary inline-flex px-3 py-1.5 text-xs">
              {t("Re-authenticate with Google")}
            </a>
          </div>
        )}
        <div className="mt-4">
          <label htmlFor="delete-account-confirm-text" className="mb-1 block text-sm text-ink-300">
            {t('Type "{word}" to confirm', { word: "DELETE" })}
          </label>
          <input
            id="delete-account-confirm-text"
            className="oj-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={!identityConfirmed}
          />
        </div>
        {error && <p className="mt-3 text-sm text-verdict-wa">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="oj-btn-secondary px-4 py-2 text-sm" disabled={submitting}>
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || confirmText !== "DELETE" || !identityConfirmed}
            className="inline-flex items-center justify-center gap-2 rounded bg-verdict-wa px-4 py-2 text-sm font-semibold text-onbrand transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? t("Deleting…") : t("Delete my account")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountSection() {
  const t = useT();
  const router = useRouter();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [reauthed, setReauthed] = useState(false);
  const [reauthError, setReauthError] = useState(false);

  // Google-only accounts land back here after the intent=delete_account re-auth round trip (see
  // AuthController's googleCallback) — reopen the dialog exactly where they left off instead of
  // making them click "Delete account" a second time. Reads window.location directly rather than
  // useSearchParams() so this doesn't need its own Suspense boundary (see SchoolVerifiedBanner for
  // the alternative that does).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gotReauth = params.get("reauth") === "1";
    const gotReauthError = params.get("reauthError") === "1";
    if (!gotReauth && !gotReauthError) return;
    setOpen(true);
    setReauthed(gotReauth);
    setReauthError(gotReauthError);
    router.replace("/settings", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConfirm(password: string) {
    await apiFetch("/users/me", {
      method: "DELETE",
      body: password ? { currentPassword: password } : {},
    });
    await useAuthStore.getState().logout();
    router.push("/");
  }

  return (
    <div className="oj-card space-y-2 border-verdict-wa/30 p-4">
      <h2 className="text-sm font-semibold text-verdict-wa">{t("Danger zone")}</h2>
      <p className="text-xs text-ink-400">
        {t(
          "Request account deletion. Your account is logged out right away; the data itself is permanently deleted 3 days later, and logging back in before then lets you cancel.",
        )}
      </p>
      <button type="button" onClick={() => setOpen(true)} className="oj-btn-secondary border-verdict-wa/40 px-3 py-1.5 text-xs text-verdict-wa">
        {t("Delete account")}
      </button>
      {open && (
        <DeleteAccountConfirmDialog
          hasPassword={user?.hasPassword ?? true}
          reauthed={reauthed}
          reauthError={reauthError}
          onCancel={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
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
      // Changing your password rotates the server-side session (see UsersController), which
      // issues a new csrf_token cookie too — without updating the in-memory copy here, every
      // CSRF-protected request after this one would fail until the next /auth/me refetch.
      const { csrfToken } = await apiFetch<{ csrfToken: string }>("/users/me/password", {
        method: "PATCH",
        body: { currentPassword, newPassword },
      });
      setCsrfToken(csrfToken);
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
        <label htmlFor="settings-current-password" className="mb-1 block text-sm text-ink-300">{t("Current password")}</label>
        <input
          id="settings-current-password"
          type="password"
          className="oj-input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="settings-new-password" className="mb-1 block text-sm text-ink-300">{t("New password")}</label>
        <input
          id="settings-new-password"
          type="password"
          className="oj-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <div>
        <label htmlFor="settings-confirm-password" className="mb-1 block text-sm text-ink-300">{t("Confirm new password")}</label>
        <input
          id="settings-confirm-password"
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
    <fieldset>
      <legend className="mb-1.5 block text-sm text-ink-300">{t("Display language")}</legend>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setLocale("zh-TW")}
          aria-pressed={locale === "zh-TW"}
          className={`oj-card p-2 text-sm font-medium transition-colors ${
            locale === "zh-TW" ? "border-brand text-brand" : "text-ink-300 hover:border-ink-500"
          }`}
        >
          繁體中文
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
          className={`oj-card p-2 text-sm font-medium transition-colors ${
            locale === "en" ? "border-brand text-brand" : "text-ink-300 hover:border-ink-500"
          }`}
        >
          English
        </button>
      </div>
    </fieldset>
  );
}

function PreferencesForm() {
  const t = useT();
  const { user, setUser } = useAuthStore();
  const [defaultLanguage, setDefaultLanguage] = useState("cpp17");
  const [dailyGoal, setDailyGoal] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Falls back to the pre-4e localStorage value on a user's first load after this shipped, so
    // nobody's existing choice silently resets to the default — server value wins once it exists.
    const fallbackLang = localStorage.getItem("oj:settings:language") ?? "cpp17";
    setDefaultLanguage(user?.settings.defaultLanguage ?? fallbackLang);
    setDailyGoal(user?.settings.dailyGoal ?? 1);
  }, [user]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const { settings } = await apiFetch<{ settings: UserSettings }>("/users/me/settings", {
        method: "PATCH",
        body: { defaultLanguage, dailyGoal },
      });
      localStorage.setItem("oj:settings:language", defaultLanguage);
      if (user) setUser({ ...user, settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      // Previously had no catch at all — a failed save silently left `saving` reset to false with
      // no confirmation and no error, indistinguishable from a successful save at a glance.
      setError(e instanceof ApiError ? e.message : t("Could not save your preferences"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="oj-card space-y-4 p-4">
      <h2 className="text-sm font-semibold text-ink-200">{t("Preferences")}</h2>
      <LanguageToggle />
      <div>
        <label htmlFor="settings-default-language" className="mb-1 block text-sm text-ink-300">{t("Default language")}</label>
        <select
          id="settings-default-language"
          value={defaultLanguage}
          onChange={(e) => setDefaultLanguage(e.target.value)}
          className="oj-input"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="settings-daily-goal" className="mb-1 block text-sm text-ink-300">{t("Daily goal")}</label>
        <input
          id="settings-daily-goal"
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
      {error && <p className="text-sm text-verdict-wa">{error}</p>}
      <button onClick={save} disabled={saving} className="oj-btn-primary">
        {saving ? t("Saving…") : saved ? t("Saved ✓") : t("Save")}
      </button>
    </div>
  );
}

const SECTIONS = [
  { key: "profile", label: "Profile", render: () => <ProfileSettingsForm /> },
  {
    key: "account",
    label: "Account",
    render: () => (
      <div className="space-y-4">
        <ChangeHandleForm />
        <DeleteAccountSection />
      </div>
    ),
  },
  { key: "password", label: "Password", render: () => <ChangePasswordForm /> },
  { key: "preferences", label: "Preferences", render: () => <PreferencesForm /> },
] as const;

export default function SettingsPage() {
  const t = useT();
  const { user, status } = useAuthStore();
  // Lands on "account" when returning from the Google re-auth round trip DeleteAccountSection
  // kicks off (?reauth=1 / ?reauthError=1) — otherwise that section, and the effect in it that
  // reopens the delete dialog, would never even mount. Read directly off window.location rather
  // than useSearchParams() so this initializer doesn't need a Suspense boundary.
  const [active, setActive] = useState<(typeof SECTIONS)[number]["key"]>(() => {
    if (typeof window === "undefined") return "profile";
    const params = new URLSearchParams(window.location.search);
    return params.get("reauth") === "1" || params.get("reauthError") === "1" ? "account" : "profile";
  });
  const activeSection = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];

  // Previously this rendered the heading and all four (non-functional) tabs regardless of auth
  // state — an anonymous visitor saw a page that looked interactive but was permanently empty,
  // since every section's form bails out internally on `!user`. Gate at the top instead, same
  // pattern as /contests and /classes.
  if (status === "ready" && !user) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">{t("Settings")}</h1>
        <div className="oj-card p-6 text-center">
          <p className="text-sm text-ink-300">{t("Log in to manage your account settings.")}</p>
          <Link href="/login" className="oj-btn-primary mt-3 inline-block px-4 py-2 text-sm">
            {t("Log in")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">{t("Settings")}</h1>
      <Suspense>
        <SchoolVerifiedBanner />
      </Suspense>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <aside className="shrink-0 sm:w-40">
          <div
            role="tablist"
            aria-label={t("Settings sections")}
            aria-orientation="vertical"
            className="flex flex-row flex-wrap gap-1 sm:flex-col"
            onKeyDown={(e) => {
              if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
              e.preventDefault();
              const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
              const i = SECTIONS.findIndex((s) => s.key === active);
              const next = (i + dir + SECTIONS.length) % SECTIONS.length;
              setActive(SECTIONS[next].key);
              document.getElementById(`settings-tab-${SECTIONS[next].key}`)?.focus();
            }}
          >
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                id={`settings-tab-${s.key}`}
                role="tab"
                aria-selected={active === s.key}
                aria-controls={`settings-tabpanel-${s.key}`}
                tabIndex={active === s.key ? 0 : -1}
                onClick={() => setActive(s.key)}
                className={`rounded px-3 py-1.5 text-left text-sm font-medium transition-colors ${
                  active === s.key ? "bg-brand/10 text-brand" : "text-ink-300 hover:bg-ink-800 hover:text-ink-50"
                }`}
              >
                {t(s.label)}
              </button>
            ))}
          </div>
        </aside>
        <div
          id={`settings-tabpanel-${activeSection.key}`}
          role="tabpanel"
          aria-labelledby={`settings-tab-${activeSection.key}`}
          className="min-w-0 flex-1"
        >
          {activeSection.render()}
        </div>
      </div>
    </div>
  );
}
