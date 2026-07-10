import Link from "next/link";

const SECTIONS = [
  { href: "/admin/problems", title: "Problems", description: "Add, edit, and manage visibility of the problem set." },
  { href: "/admin/contests", title: "Contests", description: "Set up CPE sittings and other timed contests." },
  { href: "/admin/classes", title: "Classes", description: "Track every student's progress and homework status." },
  { href: "/admin/users", title: "Users", description: "Create accounts and mark who's your actual student." },
  { href: "/admin/analytics", title: "Analytics", description: "CPE-wide stats: topics, difficulty, repeat problems." },
];

export default function AdminConsolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Console</h1>
        <p className="mt-1 text-sm text-ink-400">Pick a section from the sidebar, or jump in below.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="oj-card block p-4 transition-colors hover:border-brand">
            <h2 className="font-display text-lg font-semibold text-ink-50">{s.title}</h2>
            <p className="mt-1 text-sm text-ink-400">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
