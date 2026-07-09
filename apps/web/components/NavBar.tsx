"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useExamTimerStore } from "@/store/examTimer";

const LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/contests", label: "Contests" },
  { href: "/cpe", label: "CPE" },
  { href: "/assignments", label: "Assignments" },
];

const ADMIN_LINKS = [
  { href: "/admin/problems", label: "Problems" },
  { href: "/admin/contests", label: "Contests" },
  { href: "/admin/assignments", label: "Assignments" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const examActive = useExamTimerStore((s) => s.active);

  if (examActive) {
    return null; // ExamModeShell supplies its own minimal header while a timed window is running
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink-50">
            judge<span className="text-brand">.</span>
          </Link>
          <nav className="hidden gap-4 sm:flex">
            {LINKS.filter((l) => user?.role !== "ADMIN" || l.href !== "/assignments").map((l) => (
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
            <>
              <Link href={`/u/${user.handle}`} className="text-sm text-ink-200 hover:text-brand">
                {user.handle}
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="oj-btn-secondary px-3 py-1.5 text-xs"
              >
                Log out
              </button>
            </>
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
