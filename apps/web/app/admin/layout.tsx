"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

const SIDEBAR_LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/problems", label: "Problems" },
  { href: "/admin/contests", label: "Contests" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, status } = useAuthStore();

  if (status !== "ready") return null;

  if (user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">Admins only.</p>;
  }

  return (
    <div className="flex gap-8">
      <aside className="w-40 shrink-0">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink-500">Console</p>
        <nav className="flex flex-col gap-1">
          {SIDEBAR_LINKS.map((l) => {
            const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-brand/10 text-brand" : "text-ink-300 hover:bg-ink-800 hover:text-ink-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
