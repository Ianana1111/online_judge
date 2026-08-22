"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Distinct from error.tsx: that one only catches errors inside a route segment, which means a
// crash in RootLayout itself (app/layout.tsx) — outside every route segment — was previously
// uncaught by anything in this app. Renders its own <html>/<body> because at this point the real
// root layout has already failed to render.
export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "96px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ maxWidth: 380, fontSize: 14, opacity: 0.7 }}>
            The page failed to load. It&apos;s been logged — try refreshing.
          </p>
        </div>
      </body>
    </html>
  );
}
