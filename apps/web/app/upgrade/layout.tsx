import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// upgrade/page.tsx is a client component (billing status query, auth-gated CTAs), so metadata
// can't be exported from it directly — see contests/layout.tsx for the same pattern.
export const metadata: Metadata = {
  title: "Upgrade to Pro",
  description: "Unlimited submissions and virtual exams, per-exam appearance stats, and full Discussion/leaderboard access.",
  alternates: { canonical: `${SITE_URL}/upgrade` },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
