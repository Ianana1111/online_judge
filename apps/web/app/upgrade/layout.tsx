import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// upgrade/page.tsx is a client component (billing status query, auth-gated CTAs), so metadata
// can't be exported from it directly — see contests/layout.tsx for the same pattern.
export const metadata: Metadata = {
  title: "升級 Pro｜無限提交與歷屆模擬考",
  description: "Pro 方案提供無限次提交與虛擬測驗、各題 CPE 出題次數統計，以及完整的討論區與排行榜功能。",
  alternates: { canonical: `${SITE_URL}/upgrade` },
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
