"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useExamTimerStore } from "@/store/examTimer";

// Visible to everyone, including logged-out visitors.
const PUBLIC_LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/collections", label: "Collections" },
  { href: "/contests", label: "Contests" },
  { href: "/cpe", label: "CPE" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
];

// Only for logged-in students (isStudent, set by an admin) or admins previewing the student view.
const STUDENT_LINKS = [{ href: "/classes", label: "My Classes" }];

const ADMIN_LINKS = [
  { href: "/admin/problems", label: "Problems" },
  { href: "/admin/contests", label: "Contests" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/analytics", label: "Analytics" },
];

function UserMenu({ handle, isAdmin, onLogout }: { handle: string; isAdmin: boolean; onLogout: () => void }) {
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
            Admin
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
            href={`/u/${handle}`}
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm text-ink-200 hover:bg-ink-800"
          >
            Activity
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block rounded px-3 py-2 text-sm text-ink-200 hover:bg-ink-800"
          >
            Language &amp; settings
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
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const examActive = useExamTimerStore((s) => s.active);

  if (examActive) {
    return null; // ExamModeShell supplies its own minimal header while a timed window is running
  }

  const showStudentLinks = !!user && (user.isStudent || user.role === "ADMIN");

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink-50">
            judge<span className="text-brand">.</span>
          </Link>
          <nav className="hidden gap-4 sm:flex">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  pathname?.startsWith(l.href) ? "text-brand" : "text-ink-300 hover:text-ink-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {showStudentLinks && <span className="mx-1 text-ink-700">|</span>}
            {showStudentLinks &&
              STUDENT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname?.startsWith(l.href) ? "text-brand" : "text-ink-300 hover:text-ink-50"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            {user?.role === "ADMIN" && (
              <span className="mx-1 text-ink-700">|</span>
            )}
            {user?.role === "ADMIN" &&
              ADMIN_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === l.href ? "text-brand" : "text-ink-300 hover:text-ink-50"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu
              handle={user.handle}
              isAdmin={user.role === "ADMIN"}
              onLogout={async () => {
                await logout();
                router.push("/");
              }}
            />
          ) : (
            <Link href="/login" className="oj-btn-primary px-3 py-1.5 text-xs">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
