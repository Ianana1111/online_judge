"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useT } from "@/lib/i18n/LocaleContext";

const SIDEBAR_GROUPS = [
  { label: "營運", links: [
    { href: "/admin", label: "營運總覽" },
    { href: "/admin/agent-ops", label: "AI 維運中心" },
    { href: "/admin/analytics", label: "數據分析" },
    { href: "/admin/billing", label: "金流與退款" },
    { href: "/admin/services", label: "外部服務與費用" },
  ] },
  { label: "內容與會員", links: [
    { href: "/admin/problems", label: "Problems" },
    { href: "/admin/contests", label: "Contests" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/moderation", label: "Content review" },
    { href: "/admin/schools", label: "School domain review" },
  ] },
  { label: "教學", links: [
    { href: "/admin/classes", label: "Classes" },
    { href: "/admin/assignments", label: "Assignments" },
  ] },
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
      <aside className="min-w-0 shrink-0 md:w-44">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink-500">{t("Console")}</p>
        <nav aria-label={t("Console")} className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
          {SIDEBAR_GROUPS.map(group => <div key={group.label} className="flex shrink-0 gap-1 border-r border-ink-700 pr-2 last:border-0 md:mb-4 md:flex-col md:border-0 md:pr-0">
            <p className="hidden px-3 pb-2 text-[11px] font-medium tracking-wide text-ink-500 md:block">{group.label}</p>
            {group.links.map(l => {
              const active = l.href === "/admin" ? pathname === l.href : pathname?.startsWith(l.href);
              return <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-brand/10 text-brand" : "text-ink-300 hover:bg-ink-800 hover:text-ink-50"}`}>{t(l.label)}</Link>;
            })}
          </div>)}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
