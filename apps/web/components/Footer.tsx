"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LocaleContext";
import { SITE_NAME } from "@/lib/site";

const LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
];

export default function Footer() {
  const t = useT();
  return (
    <footer className="mx-auto mt-12 max-w-[1400px] border-t border-ink-800 px-6 py-6 text-xs text-ink-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink-300">
              {t(l.label)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
