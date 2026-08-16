"use client";

import { useT } from "@/lib/i18n/LocaleContext";

/** Small all-caps kicker label above a heading — split out of app/about/page.tsx (a Server
 * Component, so it can't call useT() itself) purely so that one line can still be translated. */
export default function Eyebrow({ text }: { text: string }) {
  const t = useT();
  return <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-brand">{t(text)}</p>;
}
