"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import ProfileSetupModal from "@/components/ProfileSetupModal";
import type { UserSettings } from "@/lib/types";

/** Shows ProfileSetupModal at most once per account, ever — right after registration for a
 * brand new user, or (since this shipped after some accounts already existed) the first time any
 * pre-existing account without a school loads the app. The decision of whether to show is locked
 * in the moment `user` first becomes available (i.e. right after login/app load) and, if showing,
 * `profileSetupDismissed` is persisted server-side immediately — not only when the user clicks
 * Skip/Save — so a user who navigates away, closes the tab, or reloads without interacting won't
 * see it pop up again on the next page. `visible` then only tracks the modal's local open/close
 * state for the rest of this session. */
export default function ProfileSetupGate() {
  const { user, setUser } = useAuthStore();
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || visible !== null) return;
    const shouldShow = !user.school && !user.settings.profileSetupDismissed;
    setVisible(shouldShow);
    if (shouldShow) {
      apiFetch<{ settings: UserSettings }>("/users/me/settings", {
        method: "PATCH",
        body: { profileSetupDismissed: true },
      })
        .then(({ settings }) => setUser({ ...user, settings }))
        .catch(() => {});
    }
  }, [user, visible, setUser]);

  if (!visible) return null;

  return <ProfileSetupModal onClose={() => setVisible(false)} />;
}
