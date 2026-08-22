"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";

/**
 * Renders `children` unconditionally — including during SSR, where `status` is always "idle" —
 * rather than gating on auth having resolved. Blanking the whole page until `/auth/me` returns
 * meant every route's server-rendered HTML was empty (bad for SEO, and a multi-second blank
 * screen on a cold API start), and it was redundant: every real consumer already keys off
 * `useAuthStore().status === "ready"` for its own auth-dependent rendering (see
 * app/submissions/page.tsx, app/classes/page.tsx, components/LoggedOutHome.tsx, and others).
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>{children}</LocaleProvider>
    </QueryClientProvider>
  );
}
