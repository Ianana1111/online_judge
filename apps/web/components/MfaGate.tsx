"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function MfaGate() {
  const user = useAuthStore((s) => s.user), path = usePathname(), router = useRouter();
  useEffect(() => {
    if (["/forgot-password", "/reset-password", "/verify-email", "/verify-school"].includes(path)) return;
    if (user?.mfaRequired && path !== "/verify-mfa") router.replace("/verify-mfa");
    else if (user?.mfaEnrollmentRequired && path !== "/settings") router.replace("/settings?section=security");
  }, [user?.mfaRequired, user?.mfaEnrollmentRequired, path, router]);
  return null;
}
