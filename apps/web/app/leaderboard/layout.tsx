import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "排行榜｜CPE、GPE 解題排名",
  description: "依解題數與連續 AC 天數排名的 CPE、GPE 練習排行榜。",
  alternates: { canonical: `${SITE_URL}/leaderboard` },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
