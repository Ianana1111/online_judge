"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useT } from "@/lib/i18n/LocaleContext";

const SIDEBAR_LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/problems", label: "Problems" },
  { href: "/admin/contests", label: "Contests" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/assignments", label: "Assignments" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/moderation", label: "Content review" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const { user, status } = useAuthStore();

  if (status !== "ready") return null;

  if (user?.role !== "ADMIN") {
    return <p className="text-sm text-verdict-wa">{t("Admins only.")}</p>;
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-8">
      <aside className="shrink-0 md:w-40">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Console")}</p>
        <nav aria-label={t("Console")} className="flex gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
          {SIDEBAR_LINKS.map((l) => {
            const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-brand/10 text-brand" : "text-ink-300 hover:bg-ink-800 hover:text-ink-50"
                }`}
              >
                {t(l.label)}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
