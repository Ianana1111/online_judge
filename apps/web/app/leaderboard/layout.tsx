import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top solvers ranked by problems solved and consecutive days with an accepted solution.",
  alternates: { canonical: `${SITE_URL}/leaderboard` },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
