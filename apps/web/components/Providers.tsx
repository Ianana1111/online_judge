"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>{ready ? children : <div className="min-h-screen bg-ink-950" />}</LocaleProvider>
    </QueryClientProvider>
  );
}
