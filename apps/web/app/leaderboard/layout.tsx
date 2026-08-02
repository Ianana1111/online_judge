import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top solvers ranked by score and by longest daily-check-in streak.",
  alternates: { canonical: `${SITE_URL}/leaderboard` },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
