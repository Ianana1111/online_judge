"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useExamTimerStore } from "@/store/examTimer";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { MenuIcon, XIcon } from "@/components/icons";
import type { User } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

// Visible to everyone, including logged-out visitors.
const PUBLIC_LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/collections", label: "Collections" },
  { href: "/contests", label: "Contests" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/discussion", label: "Discussion" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

// Any logged-in user — registered visitors and students alike.
const AUTH_LINKS = [{ href: "/submissions", label: "My Submissions" }];

// Only for logged-in students (isStudent, set by an admin) — not admins, they get the console link.
const STUDENT_LINKS = [{ href: "/classes", label: "My Classes" }];

function UserMenu({
  handle,
  isAdmin,
  plan,
  onLogout,
}: {
  handle: string;
  isAdmin: boolean;
  plan: "FREE" | "PRO";
  onLogout: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-ink-200 hover:text-brand"
      >
        {isAdmin && (
          <span className="rounded border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-brand">
            {t("Admin")}
          </span>
        )}
        {handle}
        <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div className="oj-card absolute right-0 top-full mt-2 w-44 overflow-hidden p-1">
          <Link
            href="/upgrade"
            onClick={() => setOpen(false)}
            className={`block rounded px-3 py-2 text-xs font-semibold hover:bg-ink-800 ${
              plan === "PRO" ? "text-brand hover:text-brand" : "text-ink-500 hover:text-brand"
            }`}
          >
            {plan === "PRO" ? t("Pro Plan") : t("Free Plan")}
          </Link>
          <div className="my-1 border-t border-ink-800" />
          <Link
            href={`/u/${handle}`}
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm text-ink-200 hover:bg-ink-800"
          >
            {t("Activity")}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm text-ink-200 hover:bg-ink-800"
          >
            {t("Settings")}
          </Link>
          <div className="my-1 border-t border-ink-800" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="block w-full rounded px-3 py-2 text-left text-sm text-ink-400 hover:bg-ink-800 hover:text-verdict-wa"
          >
            {t("Log out")}
          </button>
        </div>
      )}
    </div>
  );
}

/** Every link the desktop nav can show, flattened into one list with a visibility predicate —
 * shared by the mobile drawer so the two never drift out of sync with each other. */
function useNavLinks(user: User | null) {
  const showStudentLinks = !!user && user.isStudent;
  const isAdmin = user?.role === "ADMIN";
  const showUpgrade = !!user && !isAdmin && !user.isStudent;

  return [
    ...PUBLIC_LINKS,
    ...(user ? AUTH_LINKS : []),
    ...(showUpgrade ? [{ href: "/upgrade", label: "Upgrade Plan" }] : []),
    ...(showStudentLinks ? STUDENT_LINKS : []),
    ...(isAdmin ? [{ href: "/admin", label: "Console" }] : []),
  ];
}

/** Slide-down panel shown below the header on narrow screens — the desktop `<nav>` is `hidden`
 * below `sm`, so without this the entire site (Problems, Contests, Leaderboard, ...) was
 * unreachable on a phone except by typing a URL directly. */
function MobileMenu({ links, onNavigate }: { links: { href: string; label: string }[]; onNavigate: () => void }) {
  const t = useT();
  const pathname = usePathname();
  return (
    <nav className="oj-card absolute inset-x-4 top-full mt-2 flex flex-col gap-1 p-2 sm:hidden">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onNavigate}
          className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
            pathname?.startsWith(l.href) ? "bg-brand/10 text-brand" : "text-ink-200 hover:bg-ink-800"
          }`}
        >
          {t(l.label)}
        </Link>
      ))}
    </nav>
  );
}

export default function NavBar() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const examActive = useExamTimerStore((s) => s.active);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const navLinks = useNavLinks(user);

  // A route change (including via a link inside the drawer) always closes it — otherwise
  // navigating and reopening the header shows a drawer still open over the new page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  if (examActive) {
    return null; // ExamModeShell supplies its own minimal header while a timed window is running
  }

  // The upgrade flow (/upgrade, /upgrade/checkout) is a deliberately focused, full-screen
  // experience with its own back-arrow navigation — no site chrome to distract from it.
  if (pathname?.startsWith("/upgrade")) {
    return null;
  }

  const showStudentLinks = !!user && user.isStudent;
  const isAdmin = user?.role === "ADMIN";
  // Admins and students never have a billing problem — admins aren't capped, students are auto-Pro
  // (see billing.service.isProActive) — so the upgrade page is only relevant to ordinary users.
  const showUpgrade = !!user && !isAdmin && !user.isStudent;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <div ref={headerRef} className="relative mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? t("Close menu") : t("Open menu")}
            aria-expanded={mobileOpen}
            className="-ml-1.5 rounded p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-50 sm:hidden"
          >
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink-50">
            judge<span className="text-brand">.</span>
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium leading-none transition-colors ${
                  pathname?.startsWith(l.href) ? "text-brand" : "text-ink-300 hover:text-ink-50"
                }`}
              >
                {t(l.label)}
              </Link>
            ))}
            {!!user && <span className="mx-1 text-ink-500">|</span>}
            {!!user &&
              AUTH_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-medium leading-none transition-colors ${
                    pathname?.startsWith(l.href) ? "text-brand" : "text-ink-300 hover:text-ink-50"
                  }`}
                >
                  {t(l.label)}
                </Link>
              ))}
            {showUpgrade && (
              <Link
                href="/upgrade"
                className={`text-sm font-medium leading-none transition-colors ${
                  pathname?.startsWith("/upgrade") ? "text-brand" : "text-ink-300 hover:text-ink-50"
                }`}
              >
                {t("Upgrade Plan")}
              </Link>
            )}
            {showStudentLinks &&
              STUDENT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-medium leading-none transition-colors ${
                    pathname?.startsWith(l.href) ? "text-brand" : "text-ink-300 hover:text-ink-50"
                  }`}
                >
                  {t(l.label)}
                </Link>
              ))}
            {isAdmin && <span className="mx-1 text-ink-500">|</span>}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium leading-none transition-colors ${
                  pathname?.startsWith("/admin") ? "text-brand" : "text-ink-300 hover:text-ink-50"
                }`}
              >
                {t("Console")}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user && <NotificationBell />}
          <ThemeToggle />
          {user ? (
            <UserMenu
              handle={user.handle}
              isAdmin={user.role === "ADMIN"}
              plan={user.plan}
              onLogout={async () => {
                await logout();
                router.push("/");
              }}
            />
          ) : (
            <Link href="/login" className="oj-btn-primary px-3 py-1.5 text-xs">
              {t("Log in")}
            </Link>
          )}
        </div>
        {mobileOpen && <MobileMenu links={navLinks} onNavigate={() => setMobileOpen(false)} />}
      </div>
    </header>
  );
}
