"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/LocaleContext";
import { SITE_NAME } from "@/lib/site";

const LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
];

// Matches /problems/<slug> but not the /problems list page itself — the detail page is a fixed,
// non-scrolling LeetCode-style workspace (see ProblemView's fullHeight mode), so a footer below it
// would either get clipped by the page's own overflow-hidden or force a page-level scrollbar back
// into existence, defeating the whole point of that layout.
const PROBLEM_DETAIL_PATTERN = /^\/problems\/[^/]+$/;

export default function Footer() {
  const t = useT();
  const pathname = usePathname();
  if (pathname && PROBLEM_DETAIL_PATTERN.test(pathname)) return null;
  // /upgrade and /upgrade/checkout are the same deliberately focused, single-viewport flow NavBar
  // already hides itself on (see NavBar's own /upgrade check) — a footer below them would add
  // height NavBar's absence doesn't free up, forcing a page-level scrollbar on a page designed to
  // never need one.
  if (pathname?.startsWith("/upgrade")) return null;
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
