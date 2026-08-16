"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LocaleContext";

export default function NotFound() {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-brand">404 / not found</p>
      <h1 className="font-display text-3xl font-bold text-ink-50">{t("This page doesn't exist")}</h1>
      <p className="max-w-sm text-sm text-ink-400">
        {t("The problem, contest, or page you're looking for isn't here — it may have been moved or never existed.")}
      </p>
      <div className="mt-2 flex gap-3">
        <Link href="/" className="oj-btn-primary px-5 py-2.5">
          {t("Go home")}
        </Link>
        <Link href="/problems" className="oj-btn-secondary px-5 py-2.5">
          {t("Browse problems")}
        </Link>
      </div>
    </div>
  );
}
