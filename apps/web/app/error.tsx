"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useT } from "@/lib/i18n/LocaleContext";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  // The copy below has claimed "it's been logged" since before this was actually true — this is
  // what makes that true. Sentry.captureException is a safe no-op when no DSN is configured (see
  // instrumentation-client.ts).
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-verdict-wa">{t("error")}</p>
      <h1 className="font-display text-3xl font-bold text-ink-50">{t("Something went wrong")}</h1>
      <p className="max-w-sm text-sm text-ink-400">
        {t("This page hit an unexpected error. It's been logged — try again, or head back to the homepage.")}
      </p>
      <button onClick={reset} className="oj-btn-primary mt-2 px-5 py-2.5">
        {t("Try again")}
      </button>
    </div>
  );
}
