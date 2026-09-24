import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "考試專區｜CPE／GPE 歷屆虛擬測驗",
  description: "選擇 CPE 或 GPE 歷屆試題，進行獨立計時的虛擬測驗，練習考場節奏與題型。",
  alternates: { canonical: `${SITE_URL}/contests` },
};

export default function ContestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
