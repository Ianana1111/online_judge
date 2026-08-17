"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import ProfileSetupModal from "@/components/ProfileSetupModal";

/** Shows ProfileSetupModal once per account — right after registration for a brand new user, or
 * (since this shipped after some accounts already existed) the first time any pre-existing
 * account without a school loads a page. Mounted alongside NavBar so it can appear regardless of
 * which page a session lands on, not just the homepage. */
export default function ProfileSetupGate() {
  const { user } = useAuthStore();
  const [closed, setClosed] = useState(false);

  if (!user || closed || user.school || user.settings.profileSetupDismissed) return null;

  return <ProfileSetupModal onClose={() => setClosed(true)} />;
}
